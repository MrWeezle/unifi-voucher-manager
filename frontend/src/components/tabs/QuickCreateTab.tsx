"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { Voucher, VoucherCreateData } from "@/types/voucher";
import { api } from "@/utils/api";
import { notify } from "@/utils/notifications";
import { useTranslation } from "@/i18n";
import { useCallback, useState, FormEvent } from "react";

export default function QuickCreateTab() {
  const [loading, setLoading] = useState<boolean>(false);
  const [newVoucher, setNewVoucher] = useState<Voucher | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: VoucherCreateData = {
      count: 1,
      name: String(data.get("name")),
      timeLimitMinutes: Number(data.get("duration")),
      authorizedGuestLimit: 1,
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

  const closeModal = useCallback(() => {
    setNewVoucher(null);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit} className="card max-w-lg mx-auto space-y-6">
        <label className="block font-medium mb-1">{t("formDuration")}</label>
        <select name="duration" defaultValue="525600" required>
          <option value={1440}>{t("quickOneDay")}</option>
          <option value={10080}>{t("quickOneWeek")}</option>
          <option value={525600}>{t("quickOneYear")}</option>
        </select>

        <label className="block font-medium mb-1">{t("formName")}</label>
        <input name="name" defaultValue={t("quickDefaultName")} required />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? t("createBtnCreating") : t("quickBtnCreate")}
        </button>
      </form>

      {newVoucher && <SuccessModal voucher={newVoucher} onClose={closeModal} />}
    </div>
  );
}
