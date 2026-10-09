"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu";
import type { Language } from "@/domain/primitives";
import { LOCALES } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

const LOCALE_LABEL_KEY = {
  en: "languageEn",
  id: "languageId",
} as const satisfies Record<Language, "languageEn" | "languageId">;

export function LoginLanguageSelect() {
  const tSettings = useTranslations("settings.dashboard");
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-auto min-h-11 gap-2 rounded-md px-3 font-normal tracking-normal text-muted-text hover:text-ink [&_svg:not([class*='size-'])]:size-4"
            aria-label={tSettings("language")}
          />
        }
      >
        <Globe className="size-4 shrink-0" aria-hidden="true" />
        <span className="text-base">{tSettings(LOCALE_LABEL_KEY[language])}</span>
        <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-36">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            className={cn(
              "min-h-10 cursor-pointer rounded-md px-3.5 text-base",
              loc === language && "bg-track",
            )}
            onClick={() => setLanguage(loc)}
          >
            {tSettings(LOCALE_LABEL_KEY[loc])}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
