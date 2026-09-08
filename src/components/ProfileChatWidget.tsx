"use client";

import { useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface ProfileChatWidgetProps {
  handle: string;
  personName: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 6;

export function ProfileChatWidget({ handle, personName }: ProfileChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const history = messages.slice(-MAX_HISTORY);
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    scrollToBottom();

    const assistantIndex = nextMessages.length - 1;

    try {
      const res = await fetch("/api/chat/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          messages: [...history, { role: "user", content: text }],
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        setMessages((prev) => {
          const copy = [...prev];
          copy[assistantIndex] = { role: "assistant", content: err.error ?? "Chat is unavailable right now." };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      let text_acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });

        // Parse CF Workers AI SSE: `data: {"response":"token"}\n`
        const lines = raw.split("\n");
        raw = lines.pop() ?? ""; // keep incomplete last line
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const json = JSON.parse(payload) as { response?: string };
            if (json.response) text_acc += json.response;
          } catch { /* skip malformed lines */ }
        }

        if (text_acc) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[assistantIndex] = { role: "assistant", content: text_acc };
            return copy;
          });
          scrollToBottom();
        }
      }

      if (!text_acc) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[assistantIndex] = { role: "assistant", content: "No response — please try again." };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[assistantIndex] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return copy;
      });
    } finally {
      setSending(false);
      scrollToBottom();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label={`Ask about ${personName}`}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-500"
      >
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{personName}</div>
          <div className="text-[11px] text-indigo-200">Ask anything</div>
        </div>
        <button
          type="button"
          aria-label="Close chat"
          onClick={() => setOpen(false)}
          className="text-indigo-200 transition-colors hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="mt-2 text-center text-[13px] text-slate-400">
            Ask me anything about {personName}.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-3 py-2 text-[13px] text-white"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-[13px] text-slate-800"
              }
            >
              {m.content || (
                <span className="inline-flex gap-1 text-slate-400">
                  <span className="animate-pulse">•</span>
                  <span className="animate-pulse [animation-delay:150ms]">•</span>
                  <span className="animate-pulse [animation-delay:300ms]">•</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 px-3 py-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask a question…"
          disabled={sending}
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-[13px] text-slate-800 outline-none focus:border-indigo-400 disabled:opacity-60"
        />
        <button
          type="button"
          aria-label="Send message"
          onClick={send}
          disabled={sending || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
