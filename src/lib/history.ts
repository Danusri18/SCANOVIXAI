import { useCallback, useEffect, useState } from "react";

import type { ScanResult } from "./scan-engine";

const KEY = "scanovix.history.v1";
const PROFILE_KEY = "scanovix.profile.v1";

export type Profile = { name: string; autoProtect: boolean; alerts: boolean; tips: boolean };

const DEFAULT_PROFILE: Profile = { name: "Guest User", autoProtect: false, alerts: true, tips: true };

function read(): ScanResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScanResult[]) : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((fn) => fn());
}

export function addScan(scan: ScanResult) {
  const next = [scan, ...read()].slice(0, 200);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function clearHistory() {
  window.localStorage.removeItem(KEY);
  emit();
}

export function useHistory() {
  const [items, setItems] = useState<ScanResult[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      if (raw) setProfile({ ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Profile) });
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { profile, update };
}

export function useStats() {
  const items = useHistory();
  const fake = items.filter((i) => i.status === "Fake").length;
  const suspicious = items.filter((i) => i.status === "Suspicious").length;
  const safe = items.filter((i) => i.status === "Safe").length;
  const avg = items.length
    ? Math.round(items.reduce((sum, i) => sum + i.trustScore, 0) / items.length)
    : 100;
  const week = items.filter(
    (i) => Date.now() - new Date(i.createdAt).getTime() < 7 * 24 * 3600 * 1000,
  ).length;

  return {
    items,
    total: items.length,
    fake,
    suspicious,
    safe,
    blocked: fake + suspicious,
    avgTrust: avg,
    weekly: week,
    securityScore: Math.max(35, Math.min(100, 70 + safe * 2 - fake * 3)),
  };
}
