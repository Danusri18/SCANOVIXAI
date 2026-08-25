import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Ban,
  ExternalLink,
  Flag,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { addReport, addScan, getScan, hasReported } from "@/lib/history";
import { analyzeContent } from "@/lib/scan.functions";
import { type ScanResult } from "@/lib/scan-engine";

type LinkSearch = { u?: string | undefined; id?: string | undefined };

export const Route = createFileRoute("/link")({
  head: () => ({
    meta: [
      { title: "Blocked Link — Scanovix AI Safe Link Check" },
      {
        name: "description",
        content:
          "Scanovix blocked a dangerous link before it opened. Review the AI verdict, go back safely, or report the page as phishing in one tap.",
      },
      { property: "og:title", content: "Blocked Link — Scanovix AI" },
      {
        property: "og:description",
        content: "A safe-link interstitial that stops phishing pages from opening and lets you report them instantly.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): LinkSearch => {
    const str = (key: string) => {
      const value = search[key];
      return typeof value === "string" && value.trim() ? value : undefined;
    };
    return { u: str("u"), id: str("id") };
  },
  component: SafeLinkInterstitial;
});

function hostOf(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

function SafeLinkInterstitial() {
  const { u, id } = Route.useSearch();
  const navigate = useNavigate();
  const runText = useServerFn(analyzeContent);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [reported, setReported] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const handled = useRef<string | null>(null);

  const target = u ?? result?.content ?? "";

  useEffect(() => {
    const key = `${id ?? ""}|${u ?? ""}`;
    if (key === "|" || handled.current === key) return;
    handled.current = key;

    if (id) {
      const saved = getScan(id);
      if (saved) {
        setResult(saved);
        setReported(hasReported(saved.content));
        return;
      }
    }
    if (!u) return;
    setReported(hasReported(u));
    setChecking(true);
    runText({ data: { content: u } })
      .then((scan) => {
        setResult(scan);
        addScan(scan);
      })
      .catch(() => toast.error("Could not verify this link"))
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u, id]);

  const dangerous = !result || result.status !== "Safe";

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
    else void navigate({ to: "/" });
  };

  const report = () => {
    if (!target) return;
    addReport({ url: target, status: result?.status ?? "Suspicious", scanId: result?.id ?? null });
    setReported(true);
    toast.success("Reported as phishing", {
      description: "Added to your blocklist — Scanovix will warn you instantly next time.",
    });
  };

  if (!u && !id) {
    return (
      <AppShell>
        <h1 className="font-display text-2xl font-bold">Safe Link Check</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No link was provided. Open a link from a scan result to check it here.
        </p>
        <Link
          to="/scan"
          className="gradient-hero mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-sm font-semibold text-primary-foreground glow"
        >
          Go to Smart Scan
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section
        className={`glass relative overflow-hidden rounded-3xl p-6 text-center ${
          dangerous ? "ring-1 ring-danger/40" : "ring-1 ring-safe/40"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 -top-24 h-48 blur-3xl ${
            dangerous ? "bg-danger/25" : "bg-safe/20"
          }`}
        />
        <div className="relative">
          <div
            className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${
              dangerous ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"
            }`}
          >
            {checking ? (
              <Loader2 className="size-8 animate-spin" />
            ) : dangerous ? (
              <ShieldAlert className="size-8" />
            ) : (
              <ShieldCheck className="size-8" />
            )}
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">
            {checking ? "Checking this link…" : dangerous ? "Dangerous link blocked" : "This link looks safe"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {checking
              ? "Scanovix AI is inspecting the destination before it opens."
              : dangerous
                ? "Scanovix stopped this page from opening. Do not enter passwords, OTPs or card details."
                : "No scam signals were found, but stay alert if the page asks for credentials."}
          </p>

          <div className="mt-4 rounded-2xl bg-secondary/50 px-4 py-3 text-left">
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">Destination</p>
            <p className="mt-1 truncate font-display text-sm font-semibold">{hostOf(target)}</p>
            <p className="mt-0.5 line-clamp-2 text-[11px] break-all text-muted-foreground">{target}</p>
          </div>

          {result && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs">
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  dangerous ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"
                }`}
              >
                Trust {result.trustScore}/100
              </span>
              <span
                className={`rounded-full px-3 py-1 font-semibold ${
                  dangerous ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"
                }`}
              >
                {result.status}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={goBack}
          className="gradient-hero flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-semibold text-primary-foreground glow transition-transform active:scale-[0.98]"
        >
          <ArrowLeft className="size-4" /> Go back safely
        </button>
        <button
          type="button"
          onClick={report}
          disabled={reported}
          className="flex items-center justify-center gap-2 rounded-2xl bg-danger/15 py-3.5 font-display text-sm font-semibold text-danger transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <Flag className="size-4" /> {reported ? "Reported" : "Report phishing"}
        </button>
      </section>

      {result && (
        <section className="glass mt-4 rounded-3xl p-5">
          <h2 className="font-display text-sm font-semibold">Why it was blocked</h2>
          <ul className="mt-3 space-y-2">
            {result.explanation.slice(0, 4).map((line) => (
              <li key={line} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger/70" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.indicators.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            to="/scan"
            search={{ id: result.id }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent"
          >
            View full scan report →
          </Link>
        </section>
      )}

      <section className="glass mt-4 rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <Ban className="mt-0.5 size-5 shrink-0 text-danger" />
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Proceed at your own risk</p>
            <p className="mt-1">
              Opening this page can steal your login, OTP or money. Only continue if you are absolutely certain the
              site is genuine.
            </p>
            {!unlocked ? (
              <button
                type="button"
                onClick={() => setUnlocked(true)}
                className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground"
              >
                I understand the risk
              </button>
            ) : (
              <a
                href={target.startsWith("http") ? target : `https://${target}`}
                target="_blank"
                rel="noreferrer noopener nofollow"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-danger/15 px-3 py-2 text-[11px] font-semibold text-danger"
              >
                <ExternalLink className="size-3.5" /> Continue anyway
              </a>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
