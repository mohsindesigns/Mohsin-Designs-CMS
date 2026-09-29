"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X, RotateCcw, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "md_chat_history_v1";
const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm the Mohsin Designs assistant. Ask me about our services, pricing approach, or where we work — or I can point you to the right page.",
};

// Shown once, only before the visitor has sent anything - a couple of one-tap starting points
// so the widget isn't just a blank box waiting for someone to think of a question.
const QUICK_REPLIES = ["What services do you offer?", "Where do you work?", "How do I get a quote?"];

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
}

/** Three bouncing dots - the universal "the other side is typing" signal, instead of a bare spinner. */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-brand-zinc-400 dark:bg-zinc-500"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
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
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
    // Lock background scroll behind the full-screen mobile sheet.
    if (open && typeof window !== "undefined" && window.innerWidth < 640) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 112) + "px";
  };

  const submit = async (text: string) => {
    const clean = text.trim();
    if (!clean || sending) return;
    setError("");
    setInput("");
    requestAnimationFrame(autoResize);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: clean }];
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
      setMessages((prev) => (prev[prev.length - 1]?.content === "" ? prev.slice(0, -1) : prev));
    } finally {
      setSending(false);
    }
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const resetChat = () => {
    setMessages([GREETING]);
    setError("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  if (!checked || !configured) return null;

  const showQuickReplies = messages.length === 1 && !sending;
  const isEmptyLastAssistant = messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "";

  return (
    <div className="fixed bottom-0 right-0 z-[90] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Chat with Mohsin Designs"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            className="fixed inset-0 flex h-[100dvh] w-screen flex-col overflow-hidden bg-white text-brand-dark dark:bg-[#0c0b18] dark:text-white sm:static sm:mb-4 sm:h-[min(72vh,600px)] sm:w-[min(94vw,392px)] sm:rounded-[28px] sm:border sm:border-brand-zinc-200/70 sm:shadow-[0_30px_80px_-20px_rgba(3,6,172,0.3)] sm:dark:border-white/10 sm:dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)]"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue to-[#161ce0] px-4 pb-4 pt-[calc(env(safe-area-inset-top)+14px)] text-white dark:from-[#0c0b18] dark:via-[#0c0b18] dark:to-[#141225] sm:rounded-t-[28px] sm:pt-4">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl dark:bg-brand-yellow/10"
                aria-hidden="true"
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-sm dark:bg-brand-yellow/15 dark:ring-brand-yellow/25">
                    <Sparkles className="h-4.5 w-4.5 text-white dark:text-brand-yellow" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand-blue bg-emerald-400 dark:border-[#0c0b18]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold leading-tight">Mohsin Designs</p>
                    <p className="mt-0.5 truncate text-[11px] leading-none text-white/70 dark:text-white/50">AI Assistant &middot; online now</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={resetChat}
                    title="Start a new conversation"
                    aria-label="Start a new conversation"
                    className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-brand-zinc-50/60 px-4 py-4 dark:bg-transparent">
              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                const showTyping = isLast && m.role === "assistant" && m.content === "" && sending;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "rounded-br-md bg-brand-blue text-white dark:bg-brand-yellow dark:text-[#0c0b18]"
                          : "rounded-bl-md border border-brand-zinc-100 bg-white text-brand-dark dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
                      }`}
                    >
                      {showTyping ? <TypingDots /> : m.content}
                    </div>
                  </motion.div>
                );
              })}

              {showQuickReplies && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submit(q)}
                      className="rounded-full border border-brand-blue/25 bg-white px-3 py-1.5 text-[12px] font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white dark:border-brand-yellow/25 dark:bg-white/5 dark:text-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-[#0c0b18]"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={send}
              className="shrink-0 border-t border-brand-zinc-100 bg-white p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] dark:border-white/10 dark:bg-[#0c0b18] sm:rounded-b-[28px] sm:pb-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-brand-zinc-200 bg-brand-zinc-50/60 px-1.5 py-1.5 transition-colors focus-within:border-brand-blue dark:border-white/10 dark:bg-white/5 dark:focus-within:border-brand-yellow">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResize();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(input);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Ask about our services…"
                  aria-label="Message"
                  className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-[13.5px] leading-relaxed outline-none placeholder:text-brand-zinc-400 dark:placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition-all hover:scale-105 disabled:scale-100 disabled:opacity-30 dark:bg-brand-yellow dark:text-[#0c0b18]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] leading-none text-brand-zinc-400 dark:text-zinc-600">
                AI-generated &middot; verify important details with our team
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={`relative m-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-[0_16px_40px_-12px_rgba(3,6,172,0.5)] dark:bg-brand-yellow dark:text-[#0c0b18] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] ${open ? "hidden sm:flex" : ""}`}
      >
        {!open && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-blue/40 dark:bg-brand-yellow/40" style={{ animationDuration: "2.4s" }} aria-hidden="true" />
        )}
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
