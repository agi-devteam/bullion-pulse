"use client";

import { useEffect, useState } from "react";

export interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[100] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-[12px] bg-ink px-5 py-3.5 text-[0.9375rem] text-surface shadow-[0_8px_24px_#0002]"
    >
      {message}
    </div>
  );
}
