import { AlertTriangle, Ban, CheckCircle2, Sparkles } from "lucide-react";

import { labelForType, type ScanResult } from "@/lib/scan-engine";
import { cn } from "@/lib/utils";

const RISK_META: Record<
  ScanResult["riskLevel"],
  { text: string; ring: string; chip: string; label: string; emoji: string }
> = {
  safe: { text: "text-safe", ring: "stroke-safe", chip: "bg-safe/15 text-safe", label: "Low Risk", emoji: "🟢" },
  suspicious: {
    text: "text-caution",
    ring: "stroke-caution",
    chip: "bg-caution/15 text-caution",
    label: "Medium Risk",
    emoji: "🟨",
  },
  warning: {
    text: "text-warning",
    ring: "stroke-warning",
    chip: "bg-warning/15 text-warning",
    label: "High Risk",
    emoji: "🟧",
  },
  fake: { text: "text-danger", ring: "stroke-danger", chip: "bg-danger/15 text-danger", label: "Critical Risk", emoji: "🔴" },
};

const INDICATOR_STYLE: Record<string, string> = {
  Phishing: "bg-danger/15 text-danger border-danger/30",
  Scam: "bg-danger/15 text-danger border-danger/30",
  "Fake Website": "bg-danger/15 text-danger border-danger/30",
  "Suspicious Domain": "bg-warning/15 text-warning border-warning/30",
  Spam: "bg-caution/15 text-caution border-caution/30",
  Safe: "bg-safe/15 text-safe border-safe/30",
};

function TrustDial({ score, level }: { score: number; level: ScanResult["riskLevel"] }) {
  const meta = RISK_META[level];
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative mx-auto size-40">
      <svg viewBox="0 0 150 150" className="size-full -rotate-90">
        <circle cx="75" cy="75" r={radius} className="fill-none stroke-secondary" strokeWidth="11" />
        <circle
          cx="75"
          cy="75"
          r={radius}
          className={cn("fill-none transition-all duration-1000 ease-out", meta.ring)}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-4xl font-bold", meta.text)}>{score}</span>
        <span className="text-[11px] tracking-wider text-muted-foreground uppercase">Trust / 100</span>
      </div>
    </div>
  );
}

export function ScanResultCard({ result }: { result: ScanResult }) {
  const meta = RISK_META[result.riskLevel];
  const StatusIcon = result.status === "Safe" ? CheckCircle2 : result.status === "Fake" ? Ban : AlertTriangle;

  return (
    <div className="space-y-4">
      <section className="glass rounded-3xl p-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="size-3" /> Detected: {labelForType(result.type)}
        </span>
        <TrustDial score={result.trustScore} level={result.riskLevel} />
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", meta.chip)}>
            {meta.emoji} {meta.label}
          </span>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", meta.chip)}>
            <StatusIcon className="size-3.5" /> {result.status}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          AI confidence <span className="font-semibold text-foreground">{result.confidence}%</span>
          {!result.aiPowered && " · offline heuristics"}
        </p>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-display text-sm font-semibold">AI Explanation</h3>
        <ul className="mt-3 space-y-2">
          {result.explanation.map((line) => (
            <li key={line} className="flex gap-2 text-sm text-muted-foreground">
              <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", meta.chip)} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-display text-sm font-semibold">Risk Indicators</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.indicators.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                INDICATOR_STYLE[tag] ?? "border-border bg-secondary/50 text-muted-foreground",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h3 className="font-display text-sm font-semibold">Recommended Actions</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {result.recommendations.map((rec) => (
            <li key={rec} className="rounded-2xl bg-secondary/40 px-3 py-2 text-muted-foreground">
              {rec}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
