import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { isInBlockedSubnet } from "@/utils/ipv4";

export const config = {
  matcher: ["/", "/print", "/print/:path*", "/rust-api/:path*"],
};

const DEFAULT_FRONTEND_TO_BACKEND_URL = "http://127.0.0.1";
const DEFAULT_BACKEND_BIND_PORT = "8080";

const IPV6_IPV4_MAPPED_PREFIX = "::ffff:";

const guestAllowedPaths = [
  "/welcome",
  "/rust-api/vouchers/rolling",
  "favicon.ico",
  "favicon.svg",
];

// Endpoints that bypass authentication (used by unauthenticated guest flow).
const publicApiPaths = ["/rust-api/vouchers/rolling"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract client IP
  let clientIp = request.headers.get("x-forwarded-for") || "";

  // Strip IPv6 prefix if it's a mapped IPv4
  if (clientIp.startsWith(IPV6_IPV4_MAPPED_PREFIX)) {
    clientIp = clientIp.replace(IPV6_IPV4_MAPPED_PREFIX, "");
  }

  // Restrict access based on GUEST_SUBNETWORK env variable
  const guestSubnet = process.env.GUEST_SUBNETWORK;
  if (guestSubnet) {
    if (
      !guestAllowedPaths.includes(pathname) &&
      isInBlockedSubnet(clientIp, guestSubnet)
    ) {
      return new NextResponse("Access denied", { status: 403 });
    }
  }

  // Auth check — all matched routes are protected except public API paths.
  const isPublicApiPath = publicApiPaths.includes(pathname);
  if (!isPublicApiPath) {
    const session = await auth();
    if (!session) {
      if (pathname.startsWith("/rust-api")) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      // Build the sign-in redirect from the browser-supplied Host header.
      // `request.url` / `request.nextUrl` can carry the container's internal
      // bind host (e.g. 0.0.0.0:3000 when HOSTNAME=0.0.0.0 is set), which is
      // not routable from the browser.
      const host = request.headers.get("host") ?? request.nextUrl.host;
      const protocol =
        request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
        (request.nextUrl.protocol.replace(":", "") || "http");
      const callbackPath = pathname + request.nextUrl.search;
      const signInUrl = new URL(
        `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`,
        `${protocol}://${host}`,
      );
      return NextResponse.redirect(signInUrl);
    }
  }

  if (pathname.startsWith("/rust-api")) {
    // Remove the /rust-api prefix and reconstruct the path for the backend
    const backendPath = request.nextUrl.pathname.replace(/^\/rust-api/, "/api");

    const backendUrl =
      process.env.FRONTEND_TO_BACKEND_URL || DEFAULT_FRONTEND_TO_BACKEND_URL;
    const backendPort =
      process.env.BACKEND_BIND_PORT || DEFAULT_BACKEND_BIND_PORT;

    const backendFullUrl = new URL(
      `${backendUrl}:${backendPort}${backendPath}${request.nextUrl.search}`,
    );

    const response = NextResponse.rewrite(backendFullUrl, { request });

    // Forward the real client IP
    response.headers.set("x-forwarded-for", clientIp);
    return response;
  }

  return NextResponse.next();
}
