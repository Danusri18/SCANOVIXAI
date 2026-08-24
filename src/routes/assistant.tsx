import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, SendHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { askAssistant } from "@/lib/scan.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Security Assistant — Scanovix AI" },
      {
        name: "description",
        content:
          "Ask Scanovix AI anything about phishing, QR scams, fake banking SMS and staying safe online, and get simple, actionable answers.",
      },
      { property: "og:title", content: "AI Security Assistant — Scanovix AI" },
      { property: "og:description", content: "Chat with a cybersecurity expert AI about scams and online safety." },
    ],
  }),
  component: Assistant,
});

const SUGGESTIONS = [
  "Is this website safe?",
  "Explain phishing.",
  "How do QR scams work?",
  "What is a fake banking SMS?",
  "How can I stay safe online?",
];

type Message = { role: "user" | "assistant"; content: string };

function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Scanovix security assistant. Ask me about any scam, link or message you're unsure about.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askAssistant);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next.slice(-12) } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Assistant unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-bold">AI Assistant</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your personal cybersecurity expert, 24/7.</p>

      <div className="mt-5 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-3xl px-4 py-3 text-sm whitespace-pre-wrap",
              m.role === "user"
                ? "gradient-hero ml-auto text-primary-foreground"
                : "glass text-muted-foreground",
            )}
          >
            {m.role === "assistant" && (
              <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-accent">
                <Bot className="size-3" /> Scanovix AI
              </span>
            )}
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="glass flex w-fit items-center gap-2 rounded-3xl px-4 py-3 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => void send(s)}
            className="shrink-0 rounded-full bg-secondary/50 px-3 py-1.5 text-[11px] text-muted-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="glass mt-4 flex items-center gap-2 rounded-2xl px-4 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="Ask about a scam or link..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={loading}
          className="gradient-hero flex size-9 shrink-0 items-center justify-center rounded-xl text-primary-foreground disabled:opacity-60"
          aria-label="Send message"
        >
          <SendHorizontal className="size-4" />
        </button>
      </form>
    </AppShell>
  );
}
