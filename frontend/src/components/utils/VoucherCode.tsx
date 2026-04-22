"use client";

import { copyText } from "@/utils/clipboard";
import { formatCode } from "@/utils/format";
import { notify } from "@/utils/notifications";
import { useTranslation } from "@/i18n";
import { useState } from "react";
import { Voucher } from "@/types/voucher";
import { useRouter } from "next/navigation";

type Props = {
  voucher: Voucher;
  contentClassName?: string;
};

export default function VoucherCode({ voucher, contentClassName = "" }: Props) {
  const code = formatCode(voucher.code);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleCopy = async () => {
    if (await copyText(voucher.code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      notify(t("codeCopied"), "success");
    } else {
      notify(t("codeCopyFailed"), "error");
    }
  };

  const handlePrint = () => {
    const vouchersParam = encodeURIComponent(JSON.stringify([voucher]));
    const printUrl = `/print?vouchers=${vouchersParam}&mode=list`;

    router.replace(printUrl);
  };

  return (
    <div className={`text-center ${contentClassName}`}>
      <div
        onClick={handleCopy}
        className="cursor-pointer mb-4 text-3xl voucher-code"
      >
        {code}
      </div>
      <div className="flex-center gap-3">
        <button onClick={handleCopy} className="btn-success">
          {t("codeCopy")}
        </button>
        <button onClick={handlePrint} className="btn-primary">
          {t("codePrint")}
        </button>
      </div>
    </div>
  );
}
