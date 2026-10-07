import type { Language } from "@/domain/primitives";
import en from "@/messages/en.json";
import id from "@/messages/id.json";

export const LOCALES = ["id", "en"] as const satisfies readonly Language[];
export const DEFAULT_LOCALE: Language = "id";
export const messagesByLocale = { id, en } as const;
export type AppMessages = typeof id;
