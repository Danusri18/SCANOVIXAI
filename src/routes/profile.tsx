import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Lightbulb, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { useProfile, useStats } from "@/lib/history";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Protection Settings — Scanovix AI" },
      {
        name: "description",
        content:
          "See your Scanovix AI security score, scan analytics and manage alerts, auto-protection and daily security tips.",
      },
      { property: "og:title", content: "Profile & Protection — Scanovix AI" },
      { property: "og:description", content: "Your security score, scan analytics and protection settings." },
    ],
  }),
  component: ProfilePage,
});

function Toggle({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: typeof BellRing;
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4">
      <Icon className="size-4 shrink-0 text-accent" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "gradient-hero" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-background transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ProfilePage() {
  const stats = useStats();
  const { profile, update } = useProfile();

  const requestProtection = async (enabled: boolean) => {
    if (!enabled) {
      update({ autoProtect: false });
      return;
    }
    if (typeof Notification === "undefined") {
      toast.error("Alerts are not supported on this device");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Permission denied — pop-up threat alerts stay off");
      return;
    }
    update({ autoProtect: true });
    new Notification("⚠️ Scanovix protection active", {
      body: "You'll get a danger alert whenever a scam is detected.",
    });
    toast.success("Auto protection enabled");
  };

  return (
    <AppShell>
      <section className="glass flex items-center gap-4 rounded-3xl p-5">
        <span className="gradient-hero flex size-14 items-center justify-center rounded-2xl glow">
          <UserRound className="size-7 text-primary-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <input
            value={profile.name}
            onChange={(e) => update({ name: e.target.value.slice(0, 40) })}
            className="w-full bg-transparent font-display text-lg font-bold outline-none"
            aria-label="Your name"
          />
          <p className="text-xs text-muted-foreground">Security score {stats.securityScore}/100</p>
        </div>
      </section>

      <h2 className="mt-6 font-display text-sm font-semibold">Dashboard Analytics</h2>
      <section className="mt-3 grid grid-cols-2 gap-3">
        {[
          { label: "Total Scans", value: stats.total, tone: "text-accent" },
          { label: "Fake Detected", value: stats.fake, tone: "text-danger" },
          { label: "Safe Content", value: stats.safe, tone: "text-safe" },
          { label: "Blocked Threats", value: stats.blocked, tone: "text-warning" },
          { label: "Weekly Report", value: `${stats.weekly} scans`, tone: "text-foreground" },
          { label: "Avg Trust Score", value: stats.avgTrust, tone: "text-safe" },
        ].map(({ label, value, tone }) => (
          <div key={label} className="glass rounded-2xl p-4">
            <p className={cn("font-display text-2xl font-bold", tone)}>{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <h2 className="mt-6 font-display text-sm font-semibold">Protection & Notifications</h2>
      <div className="mt-3 space-y-2">
        <Toggle
          icon={ShieldCheck}
          label="Auto protection"
          description="Allow Scanovix to raise a danger pop-up whenever a scam is found"
          checked={profile.autoProtect}
          onChange={(v) => void requestProtection(v)}
        />
        <Toggle
          icon={BellRing}
          label="Scam & fake site alerts"
          description="Instant warnings for phishing links and fake websites"
          checked={profile.alerts}
          onChange={(v) => update({ alerts: v })}
        />
        <Toggle
          icon={Lightbulb}
          label="Daily security tips"
          description="One practical safety tip every day"
          checked={profile.tips}
          onChange={(v) => update({ tips: v })}
        />
      </div>

      <div className="glass mt-4 flex items-start gap-3 rounded-2xl p-4">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-caution" />
        <p className="text-[11px] text-muted-foreground">
          System-wide interception of every app's messages requires a native Android/iOS build. In this installable
          web app, Scanovix protects everything you scan or share into it and raises OS-level pop-up alerts once you
          grant notification permission.
        </p>
      </div>
    </AppShell>
  );
}
