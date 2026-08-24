import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, History, House, ScanLine, ShieldCheck, User } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/history", label: "History", icon: History },
  { to: "/assistant", label: "AI Chat", icon: Bot },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/70 px-5 py-4 backdrop-blur-xl">
        <span className="gradient-hero flex size-9 items-center justify-center rounded-xl glow">
          <ShieldCheck className="size-5 text-primary-foreground" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-bold">Scanovix AI</p>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Detect • Explain • Protect
          </p>
        </div>
      </header>

      <main className="flex-1 px-5 pt-5 pb-28">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border/60 bg-background/80 px-2 pt-2 pb-3 backdrop-blur-xl">
        <ul className="flex items-center justify-between">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-all",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl transition-all",
                      active ? "gradient-hero glow text-primary-foreground" : "bg-secondary/50",
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
