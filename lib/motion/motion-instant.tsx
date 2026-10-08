"use client";

import { createContext, useContext, type ReactNode } from "react";

const MotionInstantContext = createContext(false);

export function MotionInstantProvider({
  instant,
  children,
}: {
  instant: boolean;
  children: ReactNode;
}) {
  return (
    <MotionInstantContext.Provider value={instant}>
      {children}
    </MotionInstantContext.Provider>
  );
}

export function useMotionInstant(): boolean {
  return useContext(MotionInstantContext);
}
