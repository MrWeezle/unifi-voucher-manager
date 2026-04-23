"use client";

import CustomCreateTab from "@/components/tabs/CustomCreateTab";
import TestTab from "@/components/tabs/TestTab";
import QuickCreateTab from "@/components/tabs/QuickCreateTab";
import VouchersTab from "@/components/tabs/VouchersTab";
import { useTranslation } from "@/i18n";
import { TranslationKey } from "@/i18n/en";
import { useState } from "react";

const TAB_CONFIG = [
  {
    id: "vouchers",
    labelKey: "tabViewVouchers",
    component: VouchersTab,
    enabled: true,
  },
  {
    id: "quick",
    labelKey: "tabQuickCreate",
    component: QuickCreateTab,
    enabled: true,
  },
  {
    id: "custom",
    labelKey: "tabCustomCreate",
    component: CustomCreateTab,
    enabled: true,
  },
  {
    id: "test",
    labelKey: "tabViewVouchers",
    component: TestTab,
    enabled: false,
  },
] as const satisfies ReadonlyArray<{
  id: string;
  labelKey: TranslationKey;
  component: React.ComponentType;
  enabled: boolean;
}>;

// Get enabled tabs and derive types
const enabledTabs = TAB_CONFIG.filter((tab) => tab.enabled);
const tabIds = enabledTabs.map((tab) => tab.id);
type TabId = (typeof tabIds)[number];

export default function Tabs() {
  const [tab, setTab] = useState<TabId>(tabIds[1]);
  const { t } = useTranslation();

  return (
    <>
      <nav className="bg-surface border-b border-default flex sticky sticky-tabs z-2000 shadow-soft dark:shadow-soft-dark">
        {enabledTabs.map((tabConfig) => (
          <button
            key={tabConfig.id}
            className={`flex-1 px-4 py-3 ${
              tab === tabConfig.id ? "tab-active" : "tab-inactive"
            }`}
            onClick={() => setTab(tabConfig.id)}
          >
            {t(tabConfig.labelKey)}
          </button>
        ))}
      </nav>
      <main className="p-4 overflow-y-auto">
        {enabledTabs.map((tabConfig) => {
          const Component = tabConfig.component;
          return (
            <div
              key={tabConfig.id}
              className={tab === tabConfig.id ? "" : "hidden"}
            >
              <Component />
            </div>
          );
        })}
      </main>
    </>
  );
}
