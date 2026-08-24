import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, ClipboardPaste, ImageUp, Loader2, QrCode, ScanLine, ShieldAlert, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ScanResultCard } from "@/components/ScanResultCard";
import { addScan } from "@/lib/history";
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
        content: "One field, any content: Scanovix AI auto-detects URLs, SMS, emails, QR codes and images and scans them for scams.",
      },
    ],
  }),
  component: SmartScan;
});

function SmartScan() {
  return null;
}
