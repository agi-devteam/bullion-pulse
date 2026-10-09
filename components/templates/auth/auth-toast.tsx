"use client";

import { Toast } from "@/components/molecules/toast";
import { useUIStore } from "@/stores/use-ui-store";

export function AuthToast() {
  const toast = useUIStore((state) => state.toast);
  return (
    <Toast id={toast.id} message={toast.message} tone={toast.tone} />
  );
}
