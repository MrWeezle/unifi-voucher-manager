"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemeSwitcher from "@/components/utils/ThemeSwitcher";
import WifiQrModal from "@/components/modals/WifiQrModal";
import { useGlobal } from "@/contexts/GlobalContext";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const [showWifi, setShowWifi] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { wifiConfig, wifiString } = useGlobal();
  const qrAvailable: boolean = useMemo(
    () => !!(wifiConfig && wifiString),
    [wifiConfig, wifiString],
  );

  useEffect(() => {
    // Set initial height and update on resize
    function updateHeaderHeight() {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerRef.current.offsetHeight}px`,
        );
      }
    }

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  return (
    <header
      ref={headerRef}
      className="bg-surface border-b border-default sticky top-0 z-7000"
    >
      <div className="max-w-95/100 mx-auto flex-center-between px-4 py-4 gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-brand">
          <span className="block sm:hidden">UVM</span>
          <span className="hidden sm:block">UniFi Voucher Manager</span>
        </h1>
        <div className="flex-center gap-3">
          <button
            onClick={() => router.push("/kiosk")}
            className="btn text-sm p-1 px-2"
            aria-label="Open Kiosk"
            title="Open Kiosk"
          >
            📺
          </button>
          <button
            onClick={() => setShowWifi(true)}
            className="btn p-1"
            disabled={!qrAvailable}
            aria-label="Open Wi‑Fi QR code"
            title="Open Wi‑Fi QR code"
          >
            <img
              src="/qr.svg"
              width={45}
              height={45}
              className="dark:invert"
              alt="QR code icon"
            />
          </button>
          <ThemeSwitcher />
          {session?.user && (
            <div className="flex-center gap-2">
              <span
                className="hidden md:inline text-sm text-muted truncate max-w-[12rem]"
                title={session.user.email ?? undefined}
              >
                {session.user.name ?? session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn text-sm p-1 px-2"
                aria-label="Sign out"
                title="Sign out"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {qrAvailable && showWifi && (
        <WifiQrModal onClose={() => setShowWifi(false)} />
      )}
    </header>
  );
}
