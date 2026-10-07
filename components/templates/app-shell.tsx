"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Settings, UserRound } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { NavigationToggleIcon } from "@/components/atoms/navigation-icons";
import { Button } from "@/components/atoms/button";
import { ChannelFilter } from "@/components/molecules/channel-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu";
import { MarketStrip } from "@/components/molecules/market-strip";
import { Toast } from "@/components/molecules/toast";
import { Sheet, SheetTrigger } from "@/components/organisms/sheet";
import { EvidenceDialog } from "@/components/templates/evidence-dialog";
import { NavigationDrawer } from "@/components/templates/navigation-drawer";
import { navItemIdFromPathname } from "@/domain/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/use-ui-store";

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const t = useTranslations("shell");
  const tNav = useTranslations("nav");
  const isHome = pathname === "/";
  const title = tNav(navItemIdFromPathname(pathname));
  const navOpen = useUIStore((state) => state.navOpen);
  const setNavOpen = useUIStore((state) => state.setNavOpen);
  const setDialog = useUIStore((state) => state.setDialog);
  const toast = useUIStore((state) => state.toast);

  useEffect(() => {
    setNavOpen(false);
    setDialog(null);
  }, [pathname, setNavOpen, setDialog]);

  return (
    <>
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
      <div
        className={cn(
          "mx-auto w-full max-w-[1920px]",
          isHome
            ? "px-8 pt-5 pb-6 min-[2560px]:px-10.5 min-[2560px]:pt-7 min-[2560px]:pb-8.5 max-[1000px]:p-4 max-[700px]:p-3"
            : "px-8 pt-6 pb-9 max-[700px]:px-3 max-[700px]:py-4",
        )}
      >
        <header
          className={cn(
            "mb-5.5 flex items-center gap-3.5",
            isHome &&
              "mb-4 flex-wrap justify-between gap-4 min-[701px]:max-[1500px]:grid min-[701px]:max-[1500px]:grid-cols-[auto_auto] min-[701px]:max-[1500px]:items-center max-[700px]:flex max-[700px]:items-center max-[700px]:gap-2.5",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-3.5 max-[700px]:flex-1",
              isHome && "gap-3",
            )}
          >
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("openNav")}
                  className={cn(
                    "size-11 min-h-11 min-w-11 flex-none rounded-[999px] border border-transparent text-muted-text hover:bg-track hover:text-ink",
                    isHome && "border-line max-[700px]:size-10 max-[700px]:min-h-10 max-[700px]:min-w-10",
                  )}
                />
              }
            >
              <NavigationToggleIcon />
            </SheetTrigger>
            <div className="min-w-0">
              <h1
                className={cn(
                  "m-0 text-[1.7rem] leading-normal font-bold tracking-[-0.02em]",
                  isHome && "text-[1.375rem] tracking-[-0.01em] max-[480px]:text-[1.2rem]",
                  !isHome && "max-[700px]:text-[1.5rem]",
                )}
              >
                {title}
              </h1>
              <p
                className={cn(
                  "mt-1 mb-0 text-[0.95rem] text-muted-text",
                  isHome && "mt-0 text-[0.875rem] max-[480px]:text-[0.8rem]",
                )}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>
          {isHome ? (
            <>
              <MarketStrip />
              <div className="flex min-w-0 items-center gap-3 min-[701px]:max-[1500px]:justify-self-end max-[700px]:order-2 max-[700px]:ml-auto max-[700px]:gap-1.75 max-[480px]:ml-0 max-[480px]:w-full max-[480px]:justify-between">
                <ChannelFilter />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="icon"
                        aria-label={t("account")}
                        className="size-11 min-h-11 flex-none rounded-[999px] border border-ink bg-ink text-surface max-[700px]:size-10 max-[700px]:min-h-10"
                      />
                    }
                  >
                    <UserRound size={20} aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-75 rounded-lg border-line p-2 shadow-[0_16px_48px_#0003] max-[700px]:fixed max-[700px]:top-18 max-[700px]:right-3 max-[700px]:left-3 max-[700px]:w-auto"
                  >
                    <DropdownMenuItem
                      className="min-h-12 gap-3.5 rounded-[14px] px-3.5 text-[1.0625rem]"
                      nativeButton={false}
                      render={<Link href="/settings" />}
                    >
                      <Settings size={20} aria-hidden="true" />
                      {t("settingsMenu")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : null}
        </header>
        <main>{children}</main>
      </div>
        <NavigationDrawer />
      </Sheet>
      <EvidenceDialog />
      <Toast message={toast} />
    </>
  );
}
