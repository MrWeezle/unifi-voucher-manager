"use client";

import Modal from "@/components/modals/Modal";
import VoucherCode from "@/components/utils/VoucherCode";
import { useTranslation } from "@/i18n";
import { Voucher } from "@/types/voucher";

type Props = {
  voucher: Voucher;
  onClose: () => void;
};

export default function SuccessModal({ voucher, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Modal onClose={onClose} contentClassName="max-w-sm">
      <h2 className="text-2xl font-bold text-primary mb-4 text-center">
        {t("successVoucherCreated")}
      </h2>
      <VoucherCode voucher={voucher} />
    </Modal>
  );
}
