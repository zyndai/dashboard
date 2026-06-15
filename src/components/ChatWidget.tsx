"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import "./chat-widget.css";

const BASE = "https://docs-rag.zynd.ai";

type Source = {
  type?: string;
  github_url?: string;
  file?: string;
  source?: string;
  start_line?: number;
  score?: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
  error?: boolean;
  sources?: Source[];
  related?: unknown[];
  sub_queries?: unknown[];
};

type HistoryItem = { role: "user" | "assistant"; content: string };

function shortPath(src?: string): string {
  if (!src) return "";
  const parts = src.split("/");
  return parts.slice(-2).join("/");
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const historyRef = useRef<HistoryItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const userScrolledUp = useRef(false);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    userScrolledUp.current = scrollHeight - scrollTop - clientHeight > 80;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      if (force || !userScrolledUp.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, []);

  const autoResizeInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  const send = useCallback(
    async (override?: string) => {
      const q = (override ?? question).trim();
      if (!q || loading) return;

      setQuestion("");
      const assistantIdx = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        { role: "user", content: q },
        { role: "assistant", content: "", loading: true, sources: [], sub_queries: [] },
      ]);
      setLoading(true);
      userScrolledUp.current = false;

      scrollToBottom(true);
      autoResizeInput();

      const patch = (fn: (m: Message) => Message) =>
        setMessages((prev) => prev.map((m, i) => (i === assistantIdx ? fn(m) : m)));

      try {
        const abortController = new AbortController();
        abortRef.current = abortController;
        const resp = await fetch(`${BASE}/ask/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, history: historyRef.current }),
          signal: abortController.signal,
        });

        if (!resp.ok) {
          patch((m) => ({ ...m, content: `Error ${resp.status}: ${resp.statusText}`, error: true, loading: false }));
          return;
        }

        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let currentEvent: string | null = null;
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const raw = line.slice(6);
              if (!raw) continue;

              if (currentEvent === "token") {
                full += JSON.parse(raw);
                patch((m) => ({ ...m, content: full, loading: false }));
                scrollToBottom();
              } else if (currentEvent === "meta") {
                const meta = JSON.parse(raw);
                patch((m) => ({
                  ...m,
                  sources: meta.sources || [],
                  related: meta.related || [],
                  sub_queries: meta.sub_queries || [],
                }));
                historyRef.current = [
                  ...historyRef.current,
                  { role: "user" as const, content: q },
                  { role: "assistant" as const, content: full },
                ].slice(-20);
              } else if (currentEvent === "error") {
                const err = JSON.parse(raw);
                patch((m) => ({ ...m, content: err.detail || "Something went wrong.", error: true }));
              }
              currentEvent = null;
            }
          }
        }
      } catch (e) {
        const err = e as Error;
        if (err.name !== "AbortError") {
          patch((m) => ({ ...m, content: err.message || "Request failed.", error: true }));
        }
      } finally {
        patch((m) => ({ ...m, loading: false }));
        setLoading(false);
        scrollToBottom();
      }
    },
    [question, loading, messages.length, scrollToBottom, autoResizeInput],
  );

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(() => {
          scrollToBottom(true);
          inputRef.current?.focus();
        });
      }
      return next;
    });
  }, [scrollToBottom]);

  const onKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className="zynd-chat-root">
      {/* FAB */}
      <button className="zynd-chat-fab" onClick={toggle} aria-label={open ? "Close chat" : "Ask AI"}>
        {!open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="zynd-chat-modal" role="dialog" aria-label="Ask the Zynd AI">
          {/* Header */}
          <div className="zynd-chat-header">
            <div className="zynd-chat-header-info">
              <div className="zynd-chat-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                </svg>
              </div>
              <div>
                <div className="zynd-chat-title">Ask Zynd</div>
                <div className="zynd-chat-subtitle">AI-powered search</div>
              </div>
            </div>
            <button className="zynd-chat-close" onClick={toggle} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="zynd-chat-messages" ref={containerRef} onScroll={onScroll}>
            {messages.length === 0 && (
              <div className="zynd-chat-empty">
                <div className="zynd-chat-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                  </svg>
                </div>
                <p className="zynd-chat-empty-text">Ask anything about the Zynd network, agents, SDK, or deployment.</p>
                <div className="zynd-chat-suggestions">
                  <button onClick={() => send("How do I register an agent?")}>How do I register an agent?</button>
                  <button onClick={() => send("How does x402 micropayment work?")}>How does x402 work?</button>
                  <button onClick={() => send("What is the gossip mesh?")}>What is the gossip mesh?</button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`zynd-chat-message zynd-chat-message--${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="zynd-chat-msg-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                      <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                      <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                    </svg>
                  </div>
                )}

                <div className={`zynd-chat-msg-body${msg.error ? " zynd-chat-msg-body--error" : ""}`}>
                  {msg.loading && !msg.content ? (
                    <div className="zynd-chat-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : msg.content ? (
                    <div className="zynd-chat-msg-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : null}

                  {!msg.loading && msg.sources && msg.sources.length > 0 && (
                    <div className="zynd-chat-sources">
                      <div className="zynd-chat-sources-label">Sources</div>
                      <div className="zynd-chat-sources-list">
                        {msg.sources.slice(0, 6).map((s, si) =>
                          s.type === "code" && s.github_url ? (
                            <a
                              key={si}
                              href={s.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="zynd-chat-source-chip zynd-chat-source-chip--link"
                            >
                              <span className="zynd-source-badge zynd-source-badge--code">code</span>
                              <span className="zynd-source-name">
                                {s.file?.split("/").slice(-1)[0]}:{s.start_line}
                              </span>
                              {s.score != null && (
                                <span className="zynd-source-score">{Math.round(s.score * 100)}%</span>
                              )}
                            </a>
                          ) : (
                            <span key={si} className="zynd-chat-source-chip">
                              <span
                                className={`zynd-source-badge ${
                                  s.type === "code" ? "zynd-source-badge--code" : "zynd-source-badge--doc"
                                }`}
                              >
                                {s.type}
                              </span>
                              <span className="zynd-source-name">
                                {s.type === "code" ? s.file?.split("/").slice(-1)[0] : shortPath(s.source)}
                              </span>
                              {s.score != null && (
                                <span className="zynd-source-score">{Math.round(s.score * 100)}%</span>
                              )}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="zynd-chat-input-area">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                autoResizeInput();
              }}
              onKeyDown={onKeydown}
              placeholder="Ask about Zynd AI…"
              rows={1}
              disabled={loading}
              className="zynd-chat-input"
            />
            <button
              onClick={() => send()}
              disabled={loading || !question.trim()}
              className="zynd-chat-send"
              aria-label="Send"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
