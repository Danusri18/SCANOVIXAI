import { createFileRoute } from "@tanstack/react-router";
import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ScanResultCard } from "@/components/ScanResultCard";
import { clearHistory, useHistory } from "@/lib/history";
import { labelForType, type ScanResult } from "@/lib/scan-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — Scanovix AI" },
      {
        name: "description",
        content:
          "Review every link, message, email and QR code you scanned with Scanovix AI, filtered by safe, suspicious or fake verdicts.",
      },
      { property: "og:title", content: "Scan History — Scanovix AI" },
      { property: "og:description", content: "Your full scam-scan timeline with Trust Scores and verdicts." },
    ],
  }),
  component: HistoryPage,
});

const FILTERS = ["All", "Safe", "Suspicious", "Fake"] as const;

function HistoryPage() {
  const items = useHistory();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<ScanResult | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (filter === "All" || item.status === filter) &&
          item.content.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [items, filter, query],
  );

  if (open) {
    return (
      <AppShell>
        <button onClick={() => setOpen(null)} className="mb-4 text-xs text-accent">
          ← Back to history
        </button>
        <ScanResultCard result={open} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">History</h1>
        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1.5 text-[11px] text-muted-foreground"
          >
            <Trash2 className="size-3" /> Clear
          </button>
        )}
      </div>

      <div className="glass mt-4 flex items-center gap-2 rounded-2xl px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search history..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              filter === f ? "gradient-hero text-primary-foreground glow" : "bg-secondary/50 text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpen(item)}
            className="glass flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform active:scale-[0.99]"
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold",
                item.status === "Safe"
                  ? "bg-safe/15 text-safe"
                  : item.status === "Fake"
                    ? "bg-danger/15 text-danger"
                    : "bg-caution/15 text-caution",
              )}
            >
              {item.trustScore}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.content}</p>
              <p className="text-[11px] text-muted-foreground">
                {labelForType(item.type)} · {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                item.status === "Safe"
                  ? "bg-safe/15 text-safe"
                  : item.status === "Fake"
                    ? "bg-danger/15 text-danger"
                    : "bg-caution/15 text-caution",
              )}
            >
              {item.status}
            </span>
          </button>
        ))}
        {!filtered.length && (
          <p className="glass rounded-2xl p-4 text-xs text-muted-foreground">No scans match this filter yet.</p>
        )}
      </div>
    </AppShell>
  );
}
