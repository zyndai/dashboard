"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, ArrowUp } from "lucide-react";

interface ProfileChatWidgetProps {
  handle: string;
  personName: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 8;

export function ProfileChatWidget({ handle, personName }: ProfileChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

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
          copy[assistantIndex] = { role: "assistant", content: err.error ?? "Unavailable right now." };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      let textAcc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });

        const lines = raw.split("\n");
        raw = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const json = JSON.parse(payload) as { response?: string };
            if (json.response) textAcc += json.response;
          } catch { /* skip */ }
        }

        if (textAcc) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[assistantIndex] = { role: "assistant", content: textAcc };
            return copy;
          });
          scrollToBottom();
        }
      }

      if (!textAcc) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[assistantIndex] = { role: "assistant", content: "No response — try again." };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[assistantIndex] = { role: "assistant", content: "Something went wrong." };
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
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
          width: "48px", height: "48px", borderRadius: "50%",
          background: "#0B0B0B", color: "#fff", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
      >
        <MessageCircle size={20} />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
      width: "360px", maxWidth: "calc(100vw - 32px)",
      height: "520px", display: "flex", flexDirection: "column",
      borderRadius: "20px", overflow: "hidden",
      background: "#fff",
      boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.08)",
    }}>

      {/* Header */}
      <div style={{
        padding: "14px 16px", background: "#0B0B0B", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em" }}>{personName}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "1px" }}>Ask me anything</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "4px", display: "flex", transition: "color 0.12s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", padding: "16px",
          display: "flex", flexDirection: "column", gap: "10px",
          background: "#FAFAF8",
        }}
      >
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "#999", fontSize: "13px" }}>
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>💬</div>
            Ask anything about {personName.split(" ")[0]}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%",
              padding: "9px 13px",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "#0B0B0B" : "#fff",
              color: m.role === "user" ? "#fff" : "#1a1a1a",
              fontSize: "13px", lineHeight: "1.5",
              border: m.role === "assistant" ? "1px solid #E8E8E1" : "none",
              boxShadow: m.role === "assistant" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
              wordBreak: "break-word",
            }}>
              {m.content || (
                <span style={{ display: "inline-flex", gap: "3px", color: "#999" }}>
                  <span style={{ animation: "dot 1.2s infinite", animationDelay: "0ms" }}>•</span>
                  <span style={{ animation: "dot 1.2s infinite", animationDelay: "200ms" }}>•</span>
                  <span style={{ animation: "dot 1.2s infinite", animationDelay: "400ms" }}>•</span>
                  <style>{`@keyframes dot { 0%,80%,100%{opacity:.3} 40%{opacity:1} }`}</style>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px", background: "#fff",
        borderTop: "1px solid #E8E8E1", display: "flex", alignItems: "flex-end", gap: "8px",
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Ask a question…"
          disabled={sending}
          rows={1}
          style={{
            flex: 1, resize: "none", border: "1px solid #E0E0D8",
            borderRadius: "12px", padding: "9px 12px",
            fontSize: "13px", lineHeight: "1.45",
            color: "#1a1a1a", background: "#F7F7F4",
            outline: "none", fontFamily: "inherit",
            overflowY: "hidden", minHeight: "38px",
            transition: "border-color 0.12s",
          }}
          onFocus={e => { e.target.style.borderColor = "#0B0B0B"; }}
          onBlur={e => { e.target.style.borderColor = "#E0E0D8"; }}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: input.trim() && !sending ? "#0B0B0B" : "#E8E8E1",
            color: input.trim() && !sending ? "#fff" : "#999",
            border: "none", cursor: input.trim() && !sending ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
