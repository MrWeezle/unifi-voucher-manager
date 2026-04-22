"use client";

import { useTranslation } from "@/i18n";

function FlagDE() {
  return (
    <svg
      viewBox="0 0 512 512"
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask id="flag-de-clip">
        <circle cx="256" cy="256" r="256" fill="#fff" />
      </mask>
      <g mask="url(#flag-de-clip)">
        <path fill="#ffce00" d="M0 341.3h512V512H0z" />
        <path d="M0 0h512v170.7H0z" />
        <path fill="#d00" d="M0 170.7h512v170.6H0z" />
      </g>
    </svg>
  );
}

function FlagGB() {
  return (
    <svg
      viewBox="0 0 512 512"
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask id="flag-gb-clip">
        <circle cx="256" cy="256" r="256" fill="#fff" />
      </mask>
      <g mask="url(#flag-gb-clip)">
        <path fill="#012169" d="M0 0h512v512H0z" />
        <path
          fill="#FFF"
          d="M512 0v64L322 256l190 187v69h-67L254 324 68 512H0v-68l186-187L0 74V0h62l192 188L440 0z"
        />
        <path
          fill="#C8102E"
          d="m184 324 11 34L42 512H0v-3l184-185zm124-12 54 8 150 147v45L308 312zM512 0 320 196l-4-44L466 0h46zM0 1l193 189-59-8L0 49V1z"
        />
        <path fill="#FFF" d="M176 0v512h160V0H176zM0 176v160h512V176H0z" />
        <path
          fill="#C8102E"
          d="M0 208v96h512v-96H0zM208 0v512h96V0h-96z"
        />
      </g>
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { locale, toggleLocale, t } = useTranslation();

  return (
    <button
      onClick={toggleLocale}
      className="cursor-pointer rounded-full p-2 flex-center hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={t("headerSwitchLanguage")}
      title={t("headerSwitchLanguage")}
    >
      {locale === "de" ? <FlagDE /> : <FlagGB />}
    </button>
  );
}
