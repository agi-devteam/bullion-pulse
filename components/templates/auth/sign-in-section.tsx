"use client";

import { useTranslations } from "next-intl";
import { BrandPulse } from "@/components/atoms/navigation-icons";
import { Button } from "@/components/atoms/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/atoms/input-otp";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { useSignIn } from "@/lib/auth/use-sign-in";

const OTP_LENGTH = 6;

function AuthLogoHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4 text-center">
      <span className="flex size-11 items-center justify-center rounded-md bg-ink text-logo">
        <BrandPulse />
      </span>
      <div>
        <h1 className="m-0 text-[1.75rem] leading-tight font-bold tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mt-1.5 mb-0 text-[0.95rem] text-muted-text">{subtitle}</p>
      </div>
    </div>
  );
}

export function SignInSection() {
  const t = useTranslations("auth");
  const {
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
  } = useSignIn();

  if (showVerification) {
    return (
      <div className="flex w-full flex-col items-center">
        <AuthLogoHeader title={t("title")} subtitle={t("verifySubtitle")} />

        <div className="flex w-full flex-col items-center gap-6">
          <InputOTP
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            onComplete={(value) => void handleVerify(value)}
            disabled={isSubmitting}
            autoFocus
            containerClassName="justify-center"
          >
            <InputOTPGroup className="gap-2.5">
              {Array.from({ length: OTP_LENGTH }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="size-13 min-h-13 rounded-md border border-line bg-surface text-lg first:rounded-md first:border last:rounded-md"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <div className="flex w-full flex-col items-center">
            {secondsLeft > 0 ? (
              <p className="m-0 flex min-h-11 w-fit items-center rounded-md px-3 text-sm font-normal text-muted-text no-underline">
                {t("resendCountdown", { seconds: secondsLeft })}
              </p>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-fit min-h-11 rounded-md px-3 text-sm font-normal tracking-normal text-ink no-underline hover:no-underline"
                disabled={isResending || isSubmitting}
                onClick={() => void handleResend()}
              >
                {t("resendOtp")}
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              className="h-auto w-fit min-h-11 rounded-md px-3 text-sm font-normal tracking-normal text-ink no-underline hover:no-underline"
              disabled={isSubmitting}
              onClick={hideVerification}
            >
              {t("backToLogin")}
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <AuthLogoHeader title={t("title")} subtitle={t("subtitle")} />

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-muted-text">
              {t("emailLabel")}
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-muted-text">
              {t("passwordLabel")}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-md"
          disabled={
            isSubmitting || email.trim().length === 0 || password.length === 0
          }
        >
          {isSubmitting ? t("submitting") : t("continue")}
        </Button>

      </form>
    </div>
  );
}
