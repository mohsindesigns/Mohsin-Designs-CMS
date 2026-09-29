"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X, Loader2, RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "md_chat_history_v1";
const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm the Mohsin Designs assistant. Ask me about our services, pricing approach, or where we work — or I can point you to the right page.",
};

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
}

/**
 * Site-wide AI chat bubble (mounted once in SiteLayout, public pages only). Talks to
 * /api/chat, which grounds every answer in the site's own live content - see lib/chatContext.ts.
 *
 * Renders nothing until it has confirmed the server actually has ANTHROPIC_API_KEY configured
 * (GET /api/chat), so visitors never see a bubble that just fails on the first message.
 */
export default function ChatWidget() {
  const [configured, setConfigured] = useState(false);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat/", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setConfigured(!!d?.configured);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    setMessages(loadHistory());
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setError("");
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setSending(true);

    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });
      }
      if (!full.trim()) throw new Error("No response was received. Please try again.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      // Drop the empty assistant placeholder bubble left over from the failed attempt.
      setMessages((prev) => (prev[prev.length - 1]?.content === "" ? prev.slice(0, -1) : prev));
    } finally {
      setSending(false);
    }
  };

  const resetChat = () => {
    setMessages([GREETING]);
    setError("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  if (!checked || !configured) return null;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[90]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Chat with Mohsin Designs"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            className="mb-4 flex h-[min(70vh,540px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-brand-zinc-200/80 bg-white text-brand-dark shadow-[0_30px_70px_-20px_rgba(3,6,172,0.28)] dark:border-white/10 dark:bg-[#12121e] dark:text-white dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-zinc-100 bg-brand-blue px-4 py-3.5 text-white dark:border-white/10 dark:bg-[#080710]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-none">Mohsin Designs</p>
                  <p className="mt-1 text-[11px] leading-none text-white/70">AI Assistant · usually replies instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  title="Start a new conversation"
                  aria-label="Start a new conversation"
                  className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-md bg-brand-blue text-white dark:bg-brand-yellow dark:text-[#080710]"
                        : "rounded-bl-md bg-brand-zinc-50 text-brand-dark dark:bg-white/5 dark:text-zinc-100"
                    }`}
                  >
                    {m.content || (
                      <span className="inline-flex items-center gap-1 py-0.5 text-brand-zinc-400 dark:text-zinc-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> typing…
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={send} className="flex items-end gap-2 border-t border-brand-zinc-100 p-3 dark:border-white/10">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(e as any);
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Ask about our services…"
                aria-label="Message"
                className="max-h-24 flex-1 resize-none rounded-2xl border border-brand-zinc-200 bg-transparent px-3.5 py-2.5 text-[13px] leading-relaxed outline-none placeholder:text-brand-zinc-400 focus:border-brand-blue dark:border-white/10 dark:placeholder:text-zinc-500 dark:focus:border-brand-yellow"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 dark:bg-brand-yellow dark:text-[#080710]"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-[0_16px_40px_-12px_rgba(3,6,172,0.5)] dark:bg-brand-yellow dark:text-[#080710] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
