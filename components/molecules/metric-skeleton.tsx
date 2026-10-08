import { Skeleton } from "@/components/atoms/skeleton";
import { Card } from "@/components/molecules/card";

/** Matches `Metric` card padding, label, value, and note rhythm. */
export function MetricSkeleton() {
  return (
    <Card className="block min-w-0 gap-0 p-5 max-[700px]:p-4" aria-hidden="true">
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="mt-2.5 h-7.5 w-36" />
      <Skeleton className="mt-1 h-4 w-24" />
    </Card>
  );
}
