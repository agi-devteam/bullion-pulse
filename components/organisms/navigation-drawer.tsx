"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrandPulse,
  NavigationIcon,
  NavigationToggleIcon,
} from "@/components/atoms/navigation-icons";
import { Button } from "@/components/atoms/button";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/organisms/sheet";
import { NAV_GROUPS, NAV_ITEMS, isNavItemActive } from "@/domain/navigation";
import { cn } from "@/lib/utils";

export function NavigationDrawer() {
  const pathname = usePathname();

  return (
    <SheetContent
      side="left"
      showCloseButton={false}
      className="gap-5 p-5"
    >
      <SheetHeader className="min-h-11 flex-row items-center justify-between gap-2 p-0">
        <SheetTitle className="flex min-w-0 items-center gap-3 text-[1.15rem] font-bold tracking-[-0.02em]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink text-logo">
            <BrandPulse />
          </span>
          <span>
            Bullion Pulse
            <small className="mt-0.75 block text-[0.8rem] font-normal text-muted-text">
              Trading workspace
            </small>
          </span>
        </SheetTitle>
        <SheetClose
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ciutkan atau perluas sidebar"
              className="size-11 min-h-11 min-w-11 flex-none rounded-[999px] border border-transparent text-muted-text hover:bg-track hover:text-ink"
            />
          }
        >
          <NavigationToggleIcon />
        </SheetClose>
        <SheetDescription className="sr-only">
          Navigasi workspace
        </SheetDescription>
      </SheetHeader>
      <nav
        aria-label="Main navigation"
        className="flex flex-1 flex-col gap-1"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="contents">
            <div className="mx-3.5 mt-3 mb-1.25 text-[0.8rem] font-semibold tracking-[0.08em] text-muted-text uppercase">
              {group.title}
            </div>
            {group.items.map((id) => {
              const item = NAV_ITEMS[id];
              const active = isNavItemActive(item.href, pathname);

              return (
                <Link
                  key={id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3.5 rounded-[14px] px-3.5 text-[1.0625rem] font-medium hover:bg-track",
                    active && "bg-track",
                  )}
                >
                  <NavigationIcon name={id} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="mt-auto text-[0.9375rem] leading-[1.6] text-muted-text">
        Mock workspace
        <br />
        Inventory Intelligence
      </div>
    </SheetContent>
  );
}
