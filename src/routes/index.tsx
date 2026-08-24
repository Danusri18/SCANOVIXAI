import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BellRing, Lightbulb, ScanLine, ShieldCheck, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { useProfile, useStats } from "@/lib/history";
import { labelForType } from "@/lib/scan-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scanovix AI — Detect, Explain & Protect Against Scams" },
      {
        name: "description",
        content:
          "Scanovix AI instantly detects phishing links, scam SMS, fake emails and malicious QR codes, gives a Trust Score and tells you exactly what to do next.",
      },
      { property: "og:title", content: "Scanovix AI — Detect, Explain & Protect" },
      {
        property: "og:description",
        content: "AI-powered scam and phishing detection with a 0–100 Trust Score for links, messages, emails and QR codes.",
      },
    ],
  }),
  component: Home,
});

const TIPS = [
  "Banks never ask for your OTP, PIN or full card number over SMS or calls.",
  "Hover or long-press a link to preview the real destination before tapping.",
  "A padlock icon means encrypted — not trustworthy. Always check the domain name.",
  "Scan unknown QR codes with Scanovix before approving any payment.",
  "Enable two-factor authentication on email, banking and social accounts.",
  "Urgency is the scammer's favourite weapon — slow down and verify.",
];

function Home() {
  const stats = useStats();
  const { profile } = useProfile();
  const tip = TIPS[new Date().getDate() % TIPS.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">
        {greeting}, <span className="text-gradient">{profile.name.split(" ")[0]}</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Your AI shield is watching your digital life.</p>

      <section className="glass mt-5 flex items-center gap-4 rounded-3xl p-5">
        <div className="relative">
          <span className="pulse-ring absolute inset-0 rounded-2xl bg-safe/40" />
          <span className="relative flex size-12 items-center justify-center rounded-2xl bg-safe/20">
            <ShieldCheck className="size-6 text-safe" />
          </span>
        </div>
        <div>
          <p className="font-display text-sm font-semibold">AI Security Status</p>
          <p className="text-xs text-muted-foreground">
            {stats.fake > 0
              ? `${stats.fake} threat${stats.fake > 1 ? "s" : ""} neutralised · Protection active`
              : "Protected · No threats detected"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Security score <span className="font-semibold text-safe">{stats.securityScore}/100</span>
          </p>
        </div>
      </section>

      <Link
        to="/scan"
        className="gradient-hero mt-5 flex w-full items-center justify-center gap-2 rounded-3xl py-4 font-display text-base font-semibold text-primary-foreground glow transition-transform active:scale-[0.98]"
      >
        <ScanLine className="size-5" /> Smart Scan
      </Link>

      <section className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total Scans", value: stats.total, icon: Activity, tone: "text-accent" },
          { label: "Fake Found", value: stats.fake, icon: BellRing, tone: "text-danger" },
          { label: "Safe", value: stats.safe, icon: ShieldCheck, tone: "text-safe" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="glass rounded-2xl p-3 text-center">
            <Icon className={cn("mx-auto size-4", tone)} />
            <p className="mt-1 font-display text-xl font-bold">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold">Recent Scans</h2>
          <Link to="/history" className="text-xs text-accent">
            View all
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {stats.items.slice(0, 3).map((item) => (
            <div key={item.id} className="glass flex items-center gap-3 rounded-2xl p-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold",
                  item.status === "Safe"
                    ? "bg-safe/15 text-safe"
                    : item.status === "Fake"
                      ? "bg-danger/15 text-danger"
                      : "bg-caution/15 text-caution",
                )}
              >
                {item.trustScore}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm">{item.content}</p>
                <p className="text-[11px] text-muted-foreground">
                  {labelForType(item.type)} · {item.status}
                </p>
              </div>
            </div>
          ))}
          {!stats.items.length && (
            <p className="glass rounded-2xl p-4 text-xs text-muted-foreground">
              No scans yet. Paste a suspicious link or message into Smart Scan to get started.
            </p>
          )}
        </div>
      </section>

      <section className="glass mt-6 rounded-3xl p-5">
        <p className="flex items-center gap-2 font-display text-sm font-semibold">
          <Lightbulb className="size-4 text-caution" /> Daily Cyber Tip
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{tip}</p>
      </section>

      <section className="glass mt-4 rounded-3xl p-5">
        <p className="flex items-center gap-2 font-display text-sm font-semibold">
          <TrendingUp className="size-4 text-accent" /> Threat Statistics
        </p>
        <div className="mt-3 space-y-3">
          {[
            { label: "Blocked threats", value: stats.blocked, max: Math.max(stats.total, 1), tone: "bg-danger" },
            { label: "Safe content", value: stats.safe, max: Math.max(stats.total, 1), tone: "bg-safe" },
            { label: "Scans this week", value: stats.weekly, max: Math.max(stats.total, 1), tone: "bg-accent" },
          ].map(({ label, value, max, tone }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className={cn("h-full rounded-full", tone)} style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
