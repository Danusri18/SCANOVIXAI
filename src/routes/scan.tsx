import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, ClipboardPaste, ImageUp, Loader2, QrCode, ScanLine, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ScanResultCard } from "@/components/ScanResultCard";
import { addScan, getScan } from "@/lib/history";
import { analyzeContent, analyzeImage } from "@/lib/scan.functions";
import { detectType, labelForType, type ScanResult } from "@/lib/scan-engine";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Smart Scan — Scanovix AI Scam & Phishing Detector" },
      {
        name: "description",
        content:
          "Paste a link, SMS, email or upload a screenshot or QR code. Scanovix AI detects the type automatically and returns a Trust Score with an explanation.",
      },
      { property: "og:title", content: "Smart Scan — Scanovix AI" },
      {
        property: "og:description",
        content:
          "One field, any content: Scanovix AI auto-detects URLs, SMS, emails, QR codes and images and scans them for scams.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    url: typeof search.url === "string" ? search.url : undefined,
    text: typeof search.text === "string" ? search.text : undefined,
    title: typeof search.title === "string" ? search.title : undefined,
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: SmartScan,
});

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function SmartScan() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [shared, setShared] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const handled = useRef<string | null>(null);

  const runText = useServerFn(analyzeContent);
  const runImage = useServerFn(analyzeImage);

  const notifyDanger = (scan: ScanResult) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const notification = new Notification(`⚠️ DANGER — ${scan.status} content`, {
      body: `Trust score ${scan.trustScore}/100. ${scan.recommendations[0] ?? "Do not interact with it."}`,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `scanovix-${scan.id}`,
      requireInteraction: true,
      data: { deepLink: `/scan?id=${scan.id}` },
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
      void navigate({ to: "/scan", search: { id: scan.id } });
    };
  };

  const finish = (scan: ScanResult) => {
    setResult(scan);
    addScan(scan);
    if (scan.status !== "Safe") {
      toast.error(`⚠️ ${scan.status} content detected`, {
        description: `Trust score ${scan.trustScore}/100 — do not interact with it.`,
      });
      notifyDanger(scan);
    } else {
      toast.success("No threats found", { description: `Trust score ${scan.trustScore}/100` });
    }
  };

  const scanText = async (value: string) => {
    const content = value.trim();
    if (!content) {
      toast.error("Paste something to scan first");
      return;
    }
    setScanning(true);
    setResult(null);
    try {
      finish(await runText({ data: { content } }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const scanFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 5_000_000) {
      toast.error("Image is too large (max 5 MB)");
      return;
    }
    setScanning(true);
    setResult(null);
    try {
      const imageDataUrl = await fileToDataUrl(file);
      finish(await runImage({ data: { imageDataUrl } }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image scan failed");
    } finally {
      setScanning(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) throw new Error("Clipboard is empty");
      setInput(text);
      await scanText(text);
    } catch {
      toast.error("Clipboard unavailable — paste manually into the field");
    }
  };

  const detected = input.trim() ? labelForType(detectType(input)) : null;

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">Smart Scan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        One field for everything. The AI figures out what you pasted and scans it.
      </p>

      <section className="glass relative mt-5 overflow-hidden rounded-3xl p-4">
        {scanning && (
          <div className="gradient-hero scan-sweep pointer-events-none absolute inset-x-0 top-0 h-14 opacity-25" />
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          maxLength={8000}
          placeholder="Paste a link, message, email or scan a QR code..."
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {detected && (
          <p className="mt-1 text-[11px] text-accent">
            Detected: <span className="font-semibold">{detected}</span>
          </p>
        )}

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Paste", icon: ClipboardPaste, action: pasteFromClipboard },
            { label: "Camera", icon: Camera, action: () => cameraRef.current?.click() },
            { label: "QR Scan", icon: QrCode, action: () => cameraRef.current?.click() },
            { label: "Upload", icon: ImageUp, action: () => uploadRef.current?.click() },
          ].map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              disabled={scanning}
              className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/50 py-3 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void scanFile(e.target.files?.[0])}
        />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void scanFile(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => void scanText(input)}
          disabled={scanning}
          className="gradient-hero mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-semibold text-primary-foreground glow transition-transform active:scale-[0.98] disabled:opacity-70"
        >
          {scanning ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
          {scanning ? "AI analysing..." : "Start Smart Scan"}
        </button>
      </section>

      <div className="mt-5">
        {result ? (
          <ScanResultCard result={result} />
        ) : (
          <div className="glass flex items-start gap-3 rounded-3xl p-5">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-accent" />
            <p className="text-xs text-muted-foreground">
              Scanovix checks domains, brand impersonation, scam wording, payment QR payloads and screenshot text —
              then explains the verdict in plain language.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
