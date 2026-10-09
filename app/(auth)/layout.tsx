import type { ReactNode } from "react";
import { AuthToast } from "@/components/templates/auth/auth-toast";
import { LoginLanguageSelect } from "@/components/templates/auth/login-language-select";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#141414]">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-90">{children}</div>
      </main>
      <footer className="flex flex-col-reverse items-center justify-center gap-3 px-6 py-4 md:flex-row md:gap-2">
        <LoginLanguageSelect />
      </footer>
      <AuthToast />
    </div>
  );
}
