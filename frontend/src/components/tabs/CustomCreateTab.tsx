"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { Voucher, VoucherCreateData } from "@/types/voucher";
import {
  api,
  MAX_VOUCHER_COUNT,
  MAX_VOUCHER_DATA_MB,
  MAX_VOUCHER_DOWNLOAD_KBPS,
  MAX_VOUCHER_DURATION_MINUTES,
  MAX_VOUCHER_GUESTS,
  MAX_VOUCHER_UPLOAD_KBPS,
  MIN_VOUCHER_COUNT,
  MIN_VOUCHER_DATA_MB,
  MIN_VOUCHER_DOWNLOAD_KBPS,
  MIN_VOUCHER_GUESTS,
  MIN_VOUCHER_UPLOAD_KBPS,
} from "@/utils/api";
import { map } from "@/utils/functional";
import { notify } from "@/utils/notifications";
import { useTranslation } from "@/i18n";
import { TranslationKey } from "@/i18n/en";
import { useCallback, useState, FormEvent } from "react";

type TimeUnit = "minutes" | "hours" | "days";

export default function CustomCreateTab() {
  const [loading, setLoading] = useState(false);
  const [newVoucher, setNewVoucher] = useState<Voucher | null>(null);
  const [durationUnit, setDurationUnit] = useState<TimeUnit>("minutes");
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const parseNumber = (x: FormDataEntryValue) =>
      x !== "" ? Number(x) : null;

    const form = e.currentTarget;
    const data = new FormData(form);

    const rawDuration = Number(data.get("duration"));
    const unit = String(data.get("durationUnit") || "minutes") as TimeUnit;

    if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
      notify(t("customErrDurationPositive"), "error");
      setLoading(false);
      return;
    }

    // Convert to minutes
    const multiplier = unit === "hours" ? 60 : unit === "days" ? 1440 : 1;
    const durationMinutes = Math.round(rawDuration * multiplier);

    if (durationMinutes > MAX_VOUCHER_DURATION_MINUTES) {
      notify(
        t("customErrDurationMax", { max: MAX_VOUCHER_DURATION_MINUTES }),
        "error",
      );
      setLoading(false);
      return;
    }

    const payload: VoucherCreateData = {
      count: Number(data.get("count")),
      name: String(data.get("name")),
      timeLimitMinutes: durationMinutes,
      authorizedGuestLimit: map(data.get("guests"), parseNumber),
      dataUsageLimitMBytes: map(data.get("data"), parseNumber),
      rxRateLimitKbps: map(data.get("download"), parseNumber),
      txRateLimitKbps: map(data.get("upload"), parseNumber),
    };

    try {
      const res = await api.createVoucher(payload);
      const voucher = res.vouchers?.[0];
      if (voucher) {
        setNewVoucher(voucher);
        form.reset();
      } else {
        notify(t("createErrNoVoucherInResponse"), "warning");
      }
    } catch {
      notify(t("createErrFailed"), "error");
    }
    setLoading(false);
  };

  const durationMaxForUnit = (u: TimeUnit) => {
    if (u === "minutes") return MAX_VOUCHER_DURATION_MINUTES;
    if (u === "hours") return Math.floor(MAX_VOUCHER_DURATION_MINUTES / 60);
    return Math.floor(MAX_VOUCHER_DURATION_MINUTES / 1440);
  };

  const closeModal = useCallback(() => {
    setNewVoucher(null);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit} className="card max-w-lg mx-auto space-y-6">
        {(
          [
            {
              labelKey: "formCount",
              name: "count",
              type: "number",
              props: {
                required: true,
                min: MIN_VOUCHER_COUNT,
                max: MAX_VOUCHER_COUNT,
                defaultValue: MIN_VOUCHER_COUNT,
              },
            },
            {
              labelKey: "formName",
              name: "name",
              type: "text",
              props: { required: true, defaultValue: t("customDefaultName") },
            },
          ] as {
            labelKey: TranslationKey;
            name: string;
            type: string;
            props: Record<string, unknown>;
          }[]
        ).map(({ labelKey, name, type, props }) => (
          <div key={name}>
            <label className="block font-medium mb-1">{t(labelKey)}</label>
            <input name={name} type={type} {...(props as any)} />
          </div>
        ))}

        <div>
          <label className="block font-medium mb-1">{t("formDuration")}</label>
          <div className="flex-center gap-2">
            <input
              name="duration"
              type="number"
              required
              min={1}
              max={durationMaxForUnit(durationUnit)}
              defaultValue={
                durationUnit === "minutes"
                  ? 1440
                  : durationUnit === "hours"
                    ? 24
                    : 1
              }
            />
            <select
              name="durationUnit"
              onChange={(e) =>
                setDurationUnit(e.target.value as "minutes" | "hours" | "days")
              }
              className="w-auto"
              defaultValue="minutes"
            >
              <option value="minutes">{t("formMinutes")}</option>
              <option value="hours">{t("formHours")}</option>
              <option value="days">{t("formDays")}</option>
            </select>
          </div>
        </div>

        {(
          [
            {
              labelKey: "formGuestLimit",
              name: "guests",
              type: "number",
              props: {
                min: MIN_VOUCHER_GUESTS,
                max: MAX_VOUCHER_GUESTS,
                placeholder: t("formUnlimited"),
              },
            },
            {
              labelKey: "formDataLimit",
              name: "data",
              type: "number",
              props: {
                min: MIN_VOUCHER_DATA_MB,
                max: MAX_VOUCHER_DATA_MB,
                placeholder: t("formUnlimited"),
              },
            },
            {
              labelKey: "formDownloadKbps",
              name: "download",
              type: "number",
              props: {
                min: MIN_VOUCHER_DOWNLOAD_KBPS,
                max: MAX_VOUCHER_DOWNLOAD_KBPS,
                placeholder: t("formUnlimited"),
              },
            },
            {
              labelKey: "formUploadKbps",
              name: "upload",
              type: "number",
              props: {
                min: MIN_VOUCHER_UPLOAD_KBPS,
                max: MAX_VOUCHER_UPLOAD_KBPS,
                placeholder: t("formUnlimited"),
              },
            },
          ] as {
            labelKey: TranslationKey;
            name: string;
            type: string;
            props: Record<string, unknown>;
          }[]
        ).map(({ labelKey, name, type, props }) => (
          <div key={name}>
            <label className="block font-medium mb-1">{t(labelKey)}</label>
            <input name={name} type={type} {...(props as any)} />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("createBtnCreating") : t("customBtnCreate")}
        </button>
      </form>
      {newVoucher && <SuccessModal voucher={newVoucher} onClose={closeModal} />}
    </div>
  );
}
