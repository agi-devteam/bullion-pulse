"use client";

import { Toast } from "@/components/molecules/toast";
import { useUIStore } from "@/stores/use-ui-store";

export function AuthToast() {
  const toast = useUIStore((state) => state.toast);
  return <Toast message={toast} />;
}
