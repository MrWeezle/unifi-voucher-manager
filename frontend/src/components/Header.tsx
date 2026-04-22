"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemeSwitcher from "@/components/utils/ThemeSwitcher";
import LanguageSwitcher from "@/components/utils/LanguageSwitcher";
import WifiQrModal from "@/components/modals/WifiQrModal";
import { useGlobal } from "@/contexts/GlobalContext";
import { useTranslation } from "@/i18n";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const [showWifi, setShowWifi] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
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
          <span className="block sm:hidden">{t("appTitleShort")}</span>
          <span className="hidden sm:block">{t("appTitle")}</span>
        </h1>

        <div className="flex-center gap-3 md:gap-4">
          {/* App actions */}
          <div className="flex-center gap-1">
            <button
              onClick={() => router.push("/kiosk")}
              className="cursor-pointer rounded-full p-2 flex-center text-xl hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={t("headerOpenKiosk")}
              title={t("headerOpenKiosk")}
            >
              📺
            </button>
            {qrAvailable && (
              <button
                onClick={() => setShowWifi(true)}
                className="cursor-pointer rounded-full p-2 flex-center hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={t("headerOpenWifiQr")}
                title={t("headerOpenWifiQr")}
              >
                <img
                  src="/qr.svg"
                  width={24}
                  height={24}
                  className="dark:invert"
                  alt={t("headerQrIconAlt")}
                />
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

          {/* Preferences */}
          <div className="flex-center gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

          {/* User pill */}
          {session?.user && (
            <>
              <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
              <div className="flex-center gap-2 rounded-full bg-interactive border border-subtle pl-3 pr-1 py-1">
                <svg
                  viewBox="0 0 23 23"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                </svg>
                <span
                  className="hidden md:inline text-sm text-primary truncate max-w-[10rem]"
                  title={session.user.email ?? undefined}
                >
                  {session.user.name ?? session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer rounded-full p-1.5 flex-center text-secondary hover:text-primary hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label={t("headerSignOut")}
                  title={t("headerSignOut")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {qrAvailable && showWifi && (
        <WifiQrModal onClose={() => setShowWifi(false)} />
      )}
    </header>
  );
}
