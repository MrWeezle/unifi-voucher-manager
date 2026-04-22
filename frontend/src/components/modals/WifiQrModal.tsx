"use client";

import Modal from "@/components/modals/Modal";
import WifiQr from "@/components/utils/WifiQr";
import { useTranslation } from "@/i18n";

type Props = {
  onClose: () => void;
};

export default function WifiQrModal({ onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Modal onClose={onClose} contentClassName="max-w-md">
      <div className="flex-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-primary text-center">
          {t("wifiQrTitle")}
        </h2>
        <WifiQr className="w-full h-72" sizeRatio={0.88} />

        <p className="text-sm text-muted text-center">{t("wifiQrScanHint")}</p>
      </div>
    </Modal>
  );
}
