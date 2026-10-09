"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/molecules/tooltip";
import { cn } from "@/lib/utils";

export interface OverflowChipListProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Static/lightweight item used for width measurement. Defaults to `renderItem`. */
  renderMeasureItem?: (item: T, index: number) => ReactNode;
  renderOverflow: (hidden: T[]) => ReactNode;
  moreLabel: (count: number) => string;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  moreClassName?: string;
  "aria-label"?: string;
}

function fitVisibleCount(
  widths: number[],
  available: number,
  gap: number,
  moreWidthFor: (hiddenCount: number) => number,
): number {
  const n = widths.length;
  if (n === 0) return 0;

  let allWidth = 0;
  for (let i = 0; i < n; i++) {
    allWidth += widths[i] + (i > 0 ? gap : 0);
  }
  if (allWidth <= available + 0.5) return n;

  for (let count = n - 1; count >= 0; count--) {
    const hiddenCount = n - count;
    let used = moreWidthFor(hiddenCount);
    if (count > 0) {
      used += gap;
      for (let i = 0; i < count; i++) {
        used += widths[i] + (i > 0 ? gap : 0);
      }
    }
    if (used <= available + 0.5) return count;
  }

  return 0;
}

export function OverflowChipList<T>({
  items,
  getKey,
  renderItem,
  renderMeasureItem,
  renderOverflow,
  moreLabel,
  className,
  listClassName,
  itemClassName,
  moreClassName,
  "aria-label": ariaLabel,
}: OverflowChipListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLSpanElement>(null);
  const moreLabelRef = useRef(moreLabel);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const measureItem = renderMeasureItem ?? renderItem;

  moreLabelRef.current = moreLabel;

  useLayoutEffect(() => {
    setVisibleCount(items.length);
  }, [items]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    const moreEl = moreMeasureRef.current;
    if (!container || !measure || !moreEl) return;

    const itemEls = Array.from(
      measure.querySelectorAll<HTMLElement>("[data-overflow-item]"),
    );

    const recompute = () => {
      const available = container.clientWidth;
      if (available <= 0 || itemEls.length !== items.length) return;

      const styles = getComputedStyle(measure);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const widths = itemEls.map((el) => el.getBoundingClientRect().width);
      const next = fitVisibleCount(widths, available, gap, (hiddenCount) => {
        moreEl.textContent = moreLabelRef.current(hiddenCount);
        return moreEl.getBoundingClientRect().width;
      });

      setVisibleCount((prev) => (prev === next ? prev : next));
    };

    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    observer.observe(measure);
    recompute();

    return () => observer.disconnect();
  }, [items]);

  const visible = items.slice(0, visibleCount);
  const hidden = items.slice(visibleCount);

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <div
        ref={measureRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 left-0 flex w-max items-baseline opacity-0",
          listClassName,
        )}
      >
        {items.map((item, index) => (
          <span
            key={getKey(item, index)}
            data-overflow-item=""
            className={cn("shrink-0", itemClassName)}
          >
            {measureItem(item, index)}
          </span>
        ))}
        <span
          ref={moreMeasureRef}
          className={cn(
            "shrink-0 underline decoration-dotted underline-offset-2",
            moreClassName,
          )}
        />
      </div>

      <div
        ref={containerRef}
        className={cn(
          "flex min-w-0 items-baseline overflow-hidden whitespace-nowrap",
          listClassName,
        )}
        role="list"
        aria-label={ariaLabel}
      >
        {visible.map((item, index) => (
          <span
            key={getKey(item, index)}
            className={cn("shrink-0", itemClassName)}
            role="listitem"
          >
            {renderItem(item, index)}
          </span>
        ))}
        {hidden.length > 0 ? (
          <Tooltip>
            <TooltipTrigger
              delay={300}
              render={<span />}
              className={cn(
                "shrink-0 cursor-default underline decoration-dotted underline-offset-2",
                moreClassName,
              )}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {moreLabel(hidden.length)}
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="start"
              className="max-w-80"
              onClick={(event) => event.stopPropagation()}
            >
              {renderOverflow(hidden)}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}
