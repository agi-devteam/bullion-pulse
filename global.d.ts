import type { AppMessages } from "@/lib/i18n/config";

declare module "next-intl" {
  interface AppConfig {
    Locale: "id" | "en";
    Messages: AppMessages;
  }
}
