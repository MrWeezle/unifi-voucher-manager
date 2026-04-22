"use client";

import Modal from "@/components/modals/Modal";
import Spinner from "@/components/utils/Spinner";
import { api } from "@/utils/api";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatBytes,
  formatDuration,
  formatGuestUsage,
  formatSpeed,
  getVoucherStatus,
  isVoucherUsedUp,
} from "@/utils/format";
import VoucherCode from "@/components/utils/VoucherCode";
import { useTranslation } from "@/i18n";
import { Voucher } from "@/types/voucher";
import { TriState } from "@/types/state";

type Props = {
  voucher: Voucher;
  onClose: () => void;
};

export default function VoucherModal({ voucher, onClose }: Props) {
  const [details, setDetails] = useState<Voucher | null>(null);
  const [state, setState] = useState<TriState | null>(null);
  const lastFetchedId = useRef<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Only fetch if we haven't already fetched this voucher's details
    if (voucher.id === lastFetchedId.current) {
      return;
    }

    (async () => {
      setState("loading");
      lastFetchedId.current = voucher.id;

      try {
        const res = await api.getVoucherDetails(voucher.id);
        setDetails(res);
        setState("ok");
      } catch {
        setState("error");
      }
    })();
  }, [voucher.id]);

  const renderContent = useCallback(() => {
    switch (state) {
      case null:
      case "loading":
        return <Spinner />;
      case "error":
        return (
          <div className="card text-status-danger text-center">
            {t("detailsLoadFailed")}
          </div>
        );
      case "ok":
        if (details == null) {
          return;
        }
        const status = getVoucherStatus(
          details.expired,
          details.activatedAt,
          isVoucherUsedUp(details),
        );
        return (
          <div className="space-y-4">
            {(
              [
                [t("detailsStatus"), t(`status_${status}`)],
                [t("detailsName"), details.name || t("detailsNoNote")],
                [t("detailsCreated"), details.createdAt],
                ...(details.activatedAt
                  ? [[t("detailsActivated"), details.activatedAt]]
                  : []),
                ...(details.expiresAt
                  ? [[t("detailsExpires"), details.expiresAt]]
                  : []),
                [
                  t("detailsDuration"),
                  formatDuration(details.timeLimitMinutes, t("formUnlimited")),
                ],
                [
                  t("detailsGuestUsage"),
                  formatGuestUsage(
                    details.authorizedGuestCount,
                    details.authorizedGuestLimit,
                  ),
                ],
                [
                  t("detailsDataLimit"),
                  details.dataUsageLimitMBytes
                    ? formatBytes(
                        details.dataUsageLimitMBytes * 1024 * 1024,
                        t("formUnlimited"),
                      )
                    : t("formUnlimited"),
                ],
                [
                  t("detailsDownloadSpeed"),
                  formatSpeed(details.rxRateLimitKbps, t("formUnlimited")),
                ],
                [
                  t("detailsUploadSpeed"),
                  formatSpeed(details.txRateLimitKbps, t("formUnlimited")),
                ],
                [t("detailsId"), details.id],
              ] as [string, any][]
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex-center-between p-4 bg-interactive border border-subtle rounded-xl space-x-4"
              >
                <span className="font-semibold text-primary">{label}:</span>
                <span className="text-secondary">{value}</span>
              </div>
            ))}
          </div>
        );
    }
  }, [state, details, t]);

  return (
    <Modal onClose={onClose}>
      <VoucherCode voucher={voucher} contentClassName="mb-8" />
      {renderContent()}
    </Modal>
  );
}
