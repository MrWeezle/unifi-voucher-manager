"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { useTranslation } from "@/i18n";

export type Theme = "system" | "light" | "dark";

const NEXT_THEME: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const THEME_ICON: Record<Theme, string> = {
  system: "🎨",
  light: "🌞",
  dark: "🌙",
};

export default function ThemeSwitcher() {
  const { theme, setTheme } = useGlobal();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => setTheme(NEXT_THEME[theme])}
      className="cursor-pointer rounded-full p-2 flex-center text-xl hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={t("headerSwitchTheme")}
      title={t("headerSwitchTheme")}
    >
      {THEME_ICON[theme]}
    </button>
  );
}
