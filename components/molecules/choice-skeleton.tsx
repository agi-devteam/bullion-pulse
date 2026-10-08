import { Skeleton } from "@/components/atoms/skeleton";
import { cn } from "@/lib/utils";

/** Matches `SelectTrigger` default size (`min-h-12`, rounded-md border). */
export function ChoiceSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      aria-hidden="true"
      className={cn(
        "min-h-12 w-full rounded-md border border-transparent",
        className,
      )}
    />
  );
}
