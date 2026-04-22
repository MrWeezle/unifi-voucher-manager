"use client";

import "./styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Voucher } from "@/types/voucher";
import {
  formatBytes,
  formatDuration,
  formatMaxGuests,
  formatSpeed,
} from "@/utils/format";
import { useGlobal } from "@/contexts/GlobalContext";
import { formatCode } from "@/utils/format";
import { useTranslation } from "@/i18n";
import Spinner from "@/components/utils/Spinner";

export type PrintMode = "list" | "grid";

// This component represents a single voucher card to be printed
function VoucherPrintCard({ voucher }: { voucher: Voucher }) {
  const { wifiConfig, wifiString } = useGlobal();
  const { t } = useTranslation();

  const fields = [
    {
      label: t("detailsDuration"),
      value: formatDuration(voucher.timeLimitMinutes, t("formUnlimited")),
    },
    {
      label: t("printMaxGuests"),
      value: formatMaxGuests(voucher.authorizedGuestLimit, t("formUnlimited")),
    },
    {
      label: t("printDataLimit"),
      value: voucher.dataUsageLimitMBytes
        ? formatBytes(
            voucher.dataUsageLimitMBytes * 1024 * 1024,
            t("formUnlimited"),
          )
        : t("formUnlimited"),
    },
    {
      label: t("printDownSpeed"),
      value: formatSpeed(voucher.rxRateLimitKbps, t("formUnlimited")),
    },
    {
      label: t("printUpSpeed"),
      value: formatSpeed(voucher.txRateLimitKbps, t("formUnlimited")),
    },
  ];

  return (
    <div className="print-voucher">
      <div className="print-header">
        <div className="print-title">{t("printVoucherTitle")}</div>
      </div>

      <div className="print-voucher-code">{formatCode(voucher.code)}</div>

      {fields.map((field) => (
        <div key={`${voucher.id}:${field.label}`} className="print-info-row">
          <span className="print-label">{field.label}:</span>
          <span className="print-value">{field.value}</span>
        </div>
      ))}

      {wifiConfig && (
        <div className="print-qr-section">
          {wifiString && (
            <>
              <div className="font-bold mb-2">{t("printScanToConnect")}</div>
              <QRCodeSVG
                value={wifiString}
                size={140}
                level="H"
                marginSize={4}
                title={t("printQrTitle")}
              />
            </>
          )}
          <div className="print-qr-text">
            <strong>{t("printNetwork")}</strong> {wifiConfig.ssid}
            <br />
            {wifiConfig.type === "nopass" ? (
              t("printNoPassword")
            ) : (
              <>
                <strong>{t("printPassword")}</strong> {wifiConfig.password}
              </>
            )}
            {wifiConfig.hidden && <div>{t("printHiddenNetwork")}</div>}
          </div>
        </div>
      )}

      <div className="print-footer">
        <div>
          <strong className="text-sm">{t("printId")}</strong> {voucher.id}
        </div>
        <div>
          <strong className="text-sm">{t("printPrinted")}</strong>{" "}
          {new Date().toUTCString()}
        </div>
      </div>
    </div>
  );
}

// This component handles displaying and printing the vouchers based on URL params
function Vouchers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [mode, setMode] = useState<PrintMode>("list");
  const lastSearchParams = useRef<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const paramString = searchParams.toString();
    if (lastSearchParams.current === paramString) {
      return;
    }
    lastSearchParams.current = paramString;

    const vouchersParam = searchParams.get("vouchers");
    const modeParam = searchParams.get("mode");

    if (!vouchersParam || !modeParam) {
      return;
    }

    try {
      const parsedVouchers = JSON.parse(decodeURIComponent(vouchersParam));
      setVouchers(parsedVouchers);
      setMode(modeParam as PrintMode);

      setTimeout(() => {
        window.print();
        router.replace("/");
      }, 100);
    } catch (error) {
      console.error("Failed to parse vouchers:", error);
    }
  }, [searchParams, router]);

  return !vouchers.length ? (
    <div style={{ textAlign: "center" }}>{t("printNoVouchers")}</div>
  ) : (
    <div className={mode === "grid" ? "print-grid" : "print-list"}>
      {vouchers.map((v) => (
        <VoucherPrintCard key={v.id} voucher={v} />
      ))}
    </div>
  );
}

// This sets up the print page itself
export default function PrintPage() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace") router.replace("/");
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return (
    <main className="print-wrapper">
      <Suspense fallback={<Spinner />}>
        <Vouchers />
      </Suspense>
    </main>
  );
}
