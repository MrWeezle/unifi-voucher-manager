export function formatCode(code: string) {
  return code.length === 10 ? code.replace(/(.{5})(.{5})/, "$1-$2") : code;
}

export function formatMaxGuests(
  maxGuests: number | null | undefined,
  unlimitedLabel = "Unlimited",
) {
  return !maxGuests ? unlimitedLabel : Math.max(maxGuests, 0);
}

export type VoucherStatus = "expired" | "used" | "active" | "available";

export function getVoucherStatus(
  expired: boolean,
  activatedAt: string | null | undefined,
  usedUp = false,
): VoucherStatus {
  if (expired) return "expired";
  if (usedUp) return "used";
  if (activatedAt) return "active";
  return "available";
}

export function formatDuration(
  m: number | null | undefined,
  unlimitedLabel = "Unlimited",
) {
  if (!m) return unlimitedLabel;
  const days = Math.floor(m / 1440),
    hours = Math.floor((m % 1440) / 60),
    mins = m % 60;
  return (
    [
      days > 0 ? days + "d" : "",
      hours > 0 ? hours + "h" : "",
      mins > 0 ? mins + "m" : "",
    ]
      .filter(Boolean)
      .join(" ") || "0m"
  );
}

export function formatBytes(
  b: number | null | undefined,
  unlimitedLabel = "Unlimited",
) {
  if (!b) return unlimitedLabel;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = b,
    i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[i]}`;
}

export function formatSpeed(
  kbps: number | null | undefined,
  unlimitedLabel = "Unlimited",
) {
  if (!kbps) return unlimitedLabel;
  return kbps >= 1024
    ? `${(kbps / 1024).toFixed(kbps < 10240 ? 1 : 0)} Mbps`
    : `${kbps} Kbps`;
}

export function formatGuestUsage(
  usage: number,
  limit: number | null | undefined,
) {
  return limit ? `${usage}/${limit}` : `${usage}/∞`;
}

export function isVoucherUsedUp(v: {
  authorizedGuestCount: number;
  authorizedGuestLimit?: number | null;
}) {
  return (
    v.authorizedGuestLimit != null &&
    v.authorizedGuestLimit > 0 &&
    v.authorizedGuestCount >= v.authorizedGuestLimit
  );
}
