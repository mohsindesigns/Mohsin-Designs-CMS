import { NextRequest, NextResponse } from "next/server";
import { buildChatSystemPrompt } from "@/lib/chatContext";

// ─────────────────────────────────────────────────────────────────────────────
// The site's AI chat widget backend. Proxies to the Anthropic Messages API with a system
// prompt built live from the site's own content (see lib/chatContext.ts) and streams the
// reply back to the browser as it's generated.
//
// Request:  POST { messages: [{ role: "user"|"assistant", content: string }, ...] }
// Response: text/plain stream of the assistant's reply (chunked as it's generated).
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

// Lets the widget check whether a key has actually been configured before it renders itself, so
// visitors never see a chat bubble that just errors on first message (e.g. before the site owner
// has added ANTHROPIC_API_KEY). No secrets are exposed - just a boolean.
export async function GET() {
  return NextResponse.json({ configured: !!process.env.ANTHROPIC_API_KEY });
}

const MODEL = process.env.ANTHROPIC_CHAT_MODEL || "claude-haiku-4-5-20251001";
const MAX_TOKENS = 700;
// A real back-and-forth can run long; cap what's sent to the model so one visitor can't run up
// an unbounded bill by pasting a huge message or scrolling a conversation on forever.
const MAX_TURNS = 16;
const MAX_MESSAGE_CHARS = 2000;

// Best-effort in-memory rate limit per client IP (per server instance) - same pattern as
// /api/send. Protects the owner's Anthropic bill from a single client hammering the widget.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 40;
const rateHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  const now = Date.now();
  const recent = (rateHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateHits.set(ip, recent);
  if (rateHits.size > 5000) {
    for (const [key, times] of rateHits) {
      if (!times.some((t) => now - t < RATE_WINDOW_MS)) rateHits.delete(key);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The chat assistant isn't configured yet (missing ANTHROPIC_API_KEY)." },
      { status: 503 }
    );
  }

  const clientIp = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please wait a moment and try again." }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const messages = rawMessages
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m: any) => ({ role: m.role, content: m.content.trim().slice(0, MAX_MESSAGE_CHARS) }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "No message to respond to." }, { status: 400 });
  }

  let system: string;
  try {
    system = await buildChatSystemPrompt();
  } catch (err) {
    console.error("Failed to build chat system prompt:", err);
    return NextResponse.json({ error: "The chat assistant is temporarily unavailable." }, { status: 500 });
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages,
        stream: true,
      }),
    });
  } catch (err: any) {
    console.error("Anthropic request failed:", err?.message);
    return NextResponse.json({ error: "Couldn't reach the chat assistant. Please try again." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    console.error("Anthropic API error:", upstream.status, text.slice(0, 500));
    return NextResponse.json({ error: "The chat assistant hit an error. Please try again." }, { status: 502 });
  }

  // Anthropic streams Server-Sent Events (message_start / content_block_delta / message_stop, ...).
  // Re-emit just the assistant's text as a plain chunked stream - the browser doesn't need to
  // know anything about Anthropic's event framing, just the words as they're generated.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffered = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta" && evt.delta.text) {
            controller.enqueue(encoder.encode(evt.delta.text));
          } else if (evt.type === "error") {
            console.error("Anthropic stream error event:", evt.error);
          }
        } catch {
          // Ignore any line that isn't valid JSON (keep-alive pings etc.)
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
