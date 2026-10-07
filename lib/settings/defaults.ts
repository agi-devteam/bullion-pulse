import { GRAMS, type Gram } from "@/domain/primitives";
import type {
  DisplaySettings,
  MarginByGram,
  PolicyDraft,
} from "@/domain/settings";

function marginByGram(value: number): MarginByGram {
  return Object.fromEntries(GRAMS.map((gram) => [gram, value])) as MarginByGram;
}

export function createDefaultPolicyDraft(
  display: DisplaySettings,
): PolicyDraft {
  return {
    margin: {
      minimumMargin: {
        B2C: marginByGram(3),
        B2B: marginByGram(2.5),
      },
    },
    route: {
      minimumMargin: 1.5,
      maxLeadHours: 24,
      capacityRequired: true,
    },
    supplier: {
      quotes: [
        {
          quote_id: "Q-SIMA-10",
          supplier_id: "SIMA",
          name: "SIMA",
          gram: 10 as Gram,
          active: true,
          capacity: 160,
          lead_time: 8,
          valid_until: "2026-10-08T13:00:00.000Z",
        },
        {
          quote_id: "Q-KRISNA-25",
          supplier_id: "KRISNA",
          name: "KRISNA",
          gram: 25 as Gram,
          active: true,
          capacity: 1075,
          lead_time: 8,
          valid_until: "2026-10-08T13:00:00.000Z",
        },
      ],
    },
    system: {
      businessDayStart: "08:00",
      refreshSeconds: 60,
      staleMinutes: 30,
      antamSource: "https://www.logammulia.com/",
      xauEnabled: true,
    },
    display,
  };
}

export function clonePolicyDraft(draft: PolicyDraft): PolicyDraft {
  return structuredClone(draft);
}
