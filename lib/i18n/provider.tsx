"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, messagesByLocale } from "@/lib/i18n/config";
import { useSettingsStore } from "@/stores/use-settings-store";

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const unsub = useSettingsStore.persist.onFinishHydration(() =>
      setReady(true),
    );
    return unsub;
  }, []);

  const locale = ready ? language : DEFAULT_LOCALE;

  return (
    <NextIntlClientProvider
      key={locale}
      locale={locale}
      messages={messagesByLocale[locale]}
      timeZone="Asia/Jakarta"
    >
      {children}
    </NextIntlClientProvider>
  );
}
