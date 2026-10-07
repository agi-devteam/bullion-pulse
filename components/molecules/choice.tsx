"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/select";

export interface ChoiceProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | [string, string])[];
}

export function Choice({ label, value, onChange, options }: ChoiceProps) {
  const normalized = options.map((option) => {
    const [key, text] = Array.isArray(option) ? option : [option, option];
    return { key, text };
  });
  const items = Object.fromEntries(
    normalized.map(({ key, text }) => [key, text]),
  ) as Record<string, string>;

  return (
    <Select
      value={value}
      items={items}
      onValueChange={(next) => {
        if (next == null) return;
        onChange(String(next));
      }}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {normalized.map(({ key, text }) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
