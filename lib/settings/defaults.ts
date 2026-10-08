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
          quoteId: "Q-SIMA-10",
          supplierId: "SIMA",
          name: "SIMA",
          gram: 10 as Gram,
          active: true,
          capacity: 160,
          leadTime: 8,
        },
        {
          quoteId: "Q-KRISNA-25",
          supplierId: "KRISNA",
          name: "KRISNA",
          gram: 25 as Gram,
          active: true,
          capacity: 1075,
          leadTime: 8,
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
