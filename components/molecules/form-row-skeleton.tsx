import { Skeleton } from "@/components/atoms/skeleton";
import { cn } from "@/lib/utils";

/** Matches `FormRow` label + control column layout. */
export function FormRowSkeleton({
  controlWidth = 120,
  withNote = false,
}: {
  controlWidth?: 120 | 210;
  withNote?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-between gap-5 border-b border-line py-4 last:border-b-0 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-2.5"
    >
      <div className="min-w-0 flex-1">
        <Skeleton className="h-5 w-40" />
        {withNote ? <Skeleton className="mt-1.5 h-4 w-56 max-w-full" /> : null}
      </div>
      <div
        className={cn(
          "flex flex-none items-center justify-end max-[700px]:w-full",
          controlWidth === 210 ? "w-52.5" : "w-30",
        )}
      >
        <Skeleton className="min-h-12 w-full rounded-md" />
      </div>
    </div>
  );
}
