import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClassName = {
  sm: "size-8",
  md: "size-10",
  lg: "size-11",
} as const;

const iconSize = {
  sm: 16,
  md: 20,
  lg: 20,
} as const;

export function UserAvatar({
  image,
  size = "md",
  className,
}: UserAvatarProps) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote auth avatar URLs; no next/image remotePatterns configured
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClassName[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-ink text-surface",
        sizeClassName[size],
        className,
      )}
    >
      <UserRound size={iconSize[size]} aria-hidden="true" />
    </span>
  );
}
