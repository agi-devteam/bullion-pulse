"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api/http";
import { fetchUserInfo, requestCredentials, verifyOtp } from "@/lib/api/auth";
import { setAuthToken } from "@/lib/auth/token";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUIStore } from "@/stores/use-ui-store";

const RESEND_SECONDS = 60;

function safeNextPath(): string {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  if (next.startsWith("/login")) return "/";
  return next;
}

function errorText(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return fallback;
}

export function useSignIn() {
  const router = useRouter();
  const t = useTranslations("auth");
  const showToast = useUIStore((state) => state.showToast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const showVerification = requestId != null;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  function hideVerification() {
    setRequestId(null);
    setOtp("");
    setSecondsLeft(0);
  }

  async function submitCredentials() {
    const nextRequestId = await requestCredentials(email.trim(), password);
    setRequestId(nextRequestId);
    setOtp("");
    setSecondsLeft(RESEND_SECONDS);
  }

  async function handleVerify(code?: string) {
    if (!requestId || isSubmitting) return;
    const value = (code ?? otp).trim();
    if (value.length < 6) return;

    setIsSubmitting(true);

    try {
      const token = await verifyOtp(requestId, value);
      setAuthToken(token);
      const user = await fetchUserInfo();
      useAuthStore.getState().setSession(user);
      router.replace(safeNextPath());
      router.refresh();
    } catch (error) {
      showToast(errorText(error, t("errors.verifyFailed")));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || showVerification) return;
    setIsSubmitting(true);

    try {
      await submitCredentials();
    } catch (error) {
      showToast(errorText(error, t("errors.signInFailed")));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (isResending || isSubmitting || secondsLeft > 0) return;
    setIsResending(true);
    try {
      await submitCredentials();
    } catch (error) {
      showToast(errorText(error, t("errors.signInFailed")));
    } finally {
      setIsResending(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    otp,
    setOtp,
    showVerification,
    hideVerification,
    secondsLeft,
    isSubmitting,
    isResending,
    handleSubmit,
    handleVerify,
    handleResend,
  };
}
