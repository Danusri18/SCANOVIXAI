export type ScanType = "url" | "website" | "sms" | "email" | "qr" | "image";
export type RiskLevel = "safe" | "suspicious" | "warning" | "fake";

export type ScanResult = {
  id: string;
  content: string;
  type: ScanType;
  createdAt: string;
  trustScore: number;
  riskLevel: RiskLevel;
  status: "Safe" | "Suspicious" | "Fake";
  confidence: number;
  explanation: string[];
  indicators: string[];
  recommendations: string[];
  aiPowered: boolean;
};

const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".click", ".zip", ".mov",
  ".buzz", ".rest", ".country", ".work", ".loan", ".live", ".icu",
];

const BRANDS = [
  "amazon", "paypal", "apple", "netflix", "google", "microsoft", "facebook",
  "instagram", "whatsapp", "sbi", "hdfc", "icici", "paytm", "phonepe", "gpay",
  "bank", "dhl", "fedex", "usps", "irs", "flipkart", "binance", "metamask",
];

const SCAM_PHRASES = [
  "verify your account", "urgent", "act now", "your account has been suspended",
  "click the link", "claim your prize", "you have won", "lottery", "otp",
  "one time password", "kyc", "update your kyc", "limited time", "congratulations",
  "refund", "payment failed", "unusual activity", "confirm your identity",
  "gift card", "bitcoin", "crypto investment", "double your money", "job offer",
  "work from home", "customs fee", "package is held", "final notice", "blocked",
];

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "shorturl.at"];

export function detectType(raw: string): ScanType {
  const input = raw.trim();
  const lower = input.toLowerCase();

  if (/^(https?:\/\/|www\.)/i.test(input) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(input)) {
    return input.includes("/") && input.length > 25 ? "website" : "url";
  }
  if (/^(bitcoin:|upi:\/\/|wifi:|otpauth:|smsto:|tel:|mailto:|BEGIN:VCARD)/i.test(input)) return "qr";
  if (/\b(from|to|subject|dear)\b\s*:/i.test(lower) || /\bunsubscribe\b/i.test(lower)) return "email";
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(input) && input.length > 60) return "email";
  if (input.length <= 480) return "sms";
  return "email";
}

export function extractUrls(text: string): string[] {
  const matches = text.match(/((https?:\/\/|www\.)[^\s<>"')]+|[a-z0-9-]+\.[a-z]{2,}(\/[^\s<>"')]*)?)/gi);
  return matches ? Array.from(new Set(matches)) : [];
}

export function labelForType(type: ScanType): string {
  return {
    url: "Website URL",
    website: "Website",
    sms: "SMS Message",
    email: "Email",
    qr: "QR Code",
    image: "Image / Screenshot",
  }[type];
}

export type Heuristics = {
  score: number;
  reasons: string[];
  indicators: string[];
};

export function runHeuristics(content: string, type: ScanType): Heuristics {
  const lower = content.toLowerCase();
  const reasons: string[] = [];
  const indicators = new Set<string>();
  let penalty = 0;

  const urls = extractUrls(content);
  const primary = urls[0]?.toLowerCase() ?? "";
  const host = primary.replace(/^https?:\/\//, "").split("/")[0] ?? "";

  if (primary) {
    if (SUSPICIOUS_TLDS.some((tld) => host.endsWith(tld))) {
      penalty += 30;
      reasons.push(`Uses a low-trust domain extension (${host.slice(host.lastIndexOf("."))}) commonly abused by scammers`);
      indicators.add("Suspicious Domain");
    }
    if (host.split(".").length > 3) {
      penalty += 12;
      reasons.push("Domain uses many subdomains to hide its real destination");
      indicators.add("Suspicious Domain");
    }
    const brandHit = BRANDS.find((b) => host.includes(b));
    if (brandHit && !new RegExp(`(^|\\.)${brandHit}\\.(com|in|net|org|co\\.uk)$`).test(host)) {
      penalty += 32;
      reasons.push(`Imitates a well-known brand ("${brandHit}") without being its official domain`);
      indicators.add("Fake Website");
      indicators.add("Phishing");
    }
    if (/(login|verify|secure|account|update|signin|confirm|wallet|otp)/.test(primary)) {
      penalty += 18;
      reasons.push("Link contains credential-harvesting keywords such as login/verify/secure");
      indicators.add("Phishing");
    }
    if (SHORTENERS.some((s) => host.includes(s))) {
      penalty += 16;
      reasons.push("Shortened link hides the real destination");
      indicators.add("Suspicious Domain");
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      penalty += 25;
      reasons.push("Uses a raw IP address instead of a domain name");
      indicators.add("Suspicious Domain");
    }
    if (primary.startsWith("http://")) {
      penalty += 10;
      reasons.push("Connection is not encrypted (no HTTPS)");
      indicators.add("Suspicious Domain");
    }
    if (/[а-яα-ω]/i.test(host) || /xn--/.test(host)) {
      penalty += 22;
      reasons.push("Domain uses look-alike characters to mimic a real site");
      indicators.add("Fake Website");
    }
  }

  const phrases = SCAM_PHRASES.filter((p) => lower.includes(p));
  if (phrases.length) {
    penalty += Math.min(36, phrases.length * 12);
    reasons.push(`Contains classic scam wording: ${phrases.slice(0, 3).join(", ")}`);
    indicators.add("Scam");
    if (phrases.some((p) => p.includes("otp") || p.includes("kyc") || p.includes("password"))) {
      indicators.add("Phishing");
    }
  }

  if (/(₹|\$|usd|inr)\s?\d{3,}/i.test(content)) {
    penalty += 8;
    reasons.push("Mentions a money amount to create excitement or panic");
    indicators.add("Scam");
  }
  if (/[A-Z]{6,}/.test(content) && content.length > 30) {
    penalty += 6;
    reasons.push("Heavy use of capital letters to create urgency");
    indicators.add("Spam");
  }
  if (/(within|in)\s+\d+\s*(hour|hrs|minute|min|day)/i.test(content)) {
    penalty += 10;
    reasons.push("Pressures you with a countdown deadline");
    indicators.add("Scam");
  }
  if ((type === "sms" || type === "email") && urls.length > 0 && content.length < 260) {
    penalty += 8;
    reasons.push("Short message whose only purpose is to make you tap a link");
    indicators.add("Spam");
  }
  if (type === "qr" && /^(upi:\/\/|bitcoin:)/i.test(content.trim())) {
    penalty += 28;
    reasons.push("QR code triggers a payment request instead of opening a page");
    indicators.add("Scam");
  }

  if (!reasons.length) {
    reasons.push("No known phishing patterns, brand impersonation or scam wording detected");
    indicators.add("Safe");
  }

  const score = Math.max(2, Math.min(99, 100 - penalty));
  return { score, reasons, indicators: Array.from(indicators) };
}

export function riskFromScore(score: number): { level: RiskLevel; status: ScanResult["status"]; label: string } {
  if (score >= 75) return { level: "safe", status: "Safe", label: "Low Risk" };
  if (score >= 50) return { level: "suspicious", status: "Suspicious", label: "Medium Risk" };
  if (score >= 30) return { level: "warning", status: "Suspicious", label: "High Risk" };
  return { level: "fake", status: "Fake", label: "Critical Risk" };
}

export function defaultRecommendations(level: RiskLevel, type: ScanType): string[] {
  if (level === "safe") {
    return [
      "✅ Content looks safe, but stay alert for follow-up messages",
      "✅ Never share OTPs or passwords, even on trusted sites",
      "✅ Check the address bar before entering any credentials",
    ];
  }
  const base = [
    "❌ Do not open the link or attachment",
    "❌ Never enter passwords, card details or OTP",
    "✅ Delete this message and block the sender",
    "✅ Report it as phishing to your provider",
  ];
  if (type === "qr") base.unshift("❌ Do not approve any payment triggered by this QR code");
  return base;
}
