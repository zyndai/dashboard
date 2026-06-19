"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import "./chat-widget.css";

const BASE = "https://docs-rag.zynd.ai";
const STREAM_RENDER_MS = 200;

type Source = {
  type?: string;
  github_url?: string;
  file?: string;
  source?: string;
  start_line?: number;
  score?: number;
  url?: string;
  href?: string;
  link?: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  renderedContent?: string;
  streaming?: boolean;
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

function stripTrailingSources(text: string): string {
  const lines = text.split("\n");
  let cut = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    const headerPattern = /^#{1,6}\s+(Sources|Source|Citations|References)\s*$/i;
    const altPattern = /^\*{1,2}\s*(Sources|Source|Citations|References)\s*\*{0,2}\s*:?\s*$/i;
    const colonLine = /^(Sources|Source|Citations|References)\s*:?\s*$/i;
    if (headerPattern.test(line) || altPattern.test(line) || colonLine.test(line)) {
      cut = i;
      break;
    }
    const isSourceLine = /^[-*+]\s*\[/.test(line) || /^[-*+]\s*https?:\/\//.test(line) || /^[-*+]\s*</.test(line) || /^\d+\.\s+\[/.test(line) || /^\d+\.\s+https?:\/\//.test(line) || /^https?:\/\//.test(line) || /^\[.+?\]:\s+\S/.test(line) || /^\S{1,60}$/.test(line);
    if (isSourceLine) {
      continue;
    }
    break;
  }
  return lines.slice(0, cut).join("\n").trim();
}

function isGithubHost(hostname: string): boolean {
  return hostname === "github.com" || hostname.endsWith(".github.com");
}

function makeDocUrl(
  src: string | undefined,
  url: string | undefined,
  href: string | undefined,
  link: string | undefined,
): string | null {
  const raw = url || href || link || src;
  if (!raw) return null;

  const cleaned = raw.replace(/[\x00-\x1f\x7f\s]/g, "");
  if (cleaned.startsWith("//")) return null;

  const driveMatch = cleaned.match(/^[a-zA-Z]:(?:\\|\/)/);
  let path = cleaned;
  if (driveMatch) {
    path = cleaned.slice(2);
  } else {
    const schemeMatch = cleaned.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/i);
    if (schemeMatch) {
      const scheme = schemeMatch[1].toLowerCase();
      if (scheme === "http" || scheme === "https") {
        try {
          const u = new URL(cleaned);
          const allowed = ["docs.zynd.ai", "www.zynd.ai", "zynd.ai"];
          if (allowed.includes(u.hostname)) {
            return `https://docs.zynd.ai${u.pathname}${u.search}${u.hash}`;
          }
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  let normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("./")) normalized = normalized.slice(2);

  const fragIdx = normalized.indexOf("#");
  let fragment = "";
  if (fragIdx !== -1) {
    fragment = normalized.slice(fragIdx);
    normalized = normalized.slice(0, fragIdx);
  }

  const vMatch = normalized.match(/(\/v[12]\/.*)/i);
  if (vMatch) {
    normalized = vMatch[1];
  } else {
    const docsMatch = normalized.match(/(?:^|\/)docs\/(.*)/i);
    if (docsMatch) {
      normalized = "/" + docsMatch[1];
    }
  }

  normalized = normalized.replace(/^\//, "");
  normalized = normalized.replace(/\.(md|html)$/i, "");
  if (normalized.endsWith("/index")) normalized = normalized.slice(0, -6);
  if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);

  return `https://docs.zynd.ai/${normalized}${fragment}`;
}

function makeGithubUrl(src: Source): string | null {
  const raw = src.github_url;
  if (!raw) return null;
  const cleaned = raw.replace(/[\x00-\x1f\x7f\s]/g, "");
  try {
    const u = new URL(cleaned);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!isGithubHost(u.hostname)) return null;
    if (src.start_line && !u.hash) {
      u.hash = `#L${src.start_line}`;
    }
    return u.toString();
  } catch {
    return null;
  }
}

function makeSourceChipHref(src: Source): string | null {
  if (src.type === "code") return makeGithubUrl(src);
  return makeDocUrl(src.source, src.url, src.href, src.link);
}

function sourceKey(s: Source, fallback: number): string {
  return (
    s.github_url ||
    s.file ||
    s.source ||
    s.url ||
    s.href ||
    s.link ||
    String(fallback)
  );
}

function safeLinkHref(href: string | undefined): string | null {
  if (!href) return null;
  const cleaned = href.replace(/[\x00-\x1f\x7f\s]/g, "");
  const schemeMatch = cleaned.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/i);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme === "http" || scheme === "https") {
      try {
        const u = new URL(cleaned);
        return u.toString();
      } catch {
        return null;
      }
    }
    return null;
  }
  if (cleaned.startsWith("//")) return null;
  return makeDocUrl(cleaned, undefined, undefined, undefined);
}

function CodeBoard({ className, children }: { className?: string; children?: React.ReactNode }) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = (className?.replace("language-", "").match(/[\w.\-+]+/) || [""])[0];
  const handleCopy = useCallback(() => {
    const text = codeRef.current?.textContent || "";
    const fallbackCopy = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch { /* clipboard unavailable */ }
    };
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);
  return (
    <div className="zynd-chat-codeboard">
      <div className="zynd-chat-codeboard-header">
        <span className="zynd-chat-codeboard-lang">{lang || "code"}</span>
        <button className="zynd-chat-codeboard-copy" onClick={handleCopy} aria-label="Copy code">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={codeRef} className={className}>
        {children}
      </pre>
    </div>
  );
}

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => {
    const safe = safeLinkHref(href);
    if (!safe) {
      return <span {...props}>{children}</span>;
    }
    return (
      <a href={safe} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, ...props }) => {
    if (className) {
      return <CodeBoard className={className}>{children}</CodeBoard>;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

let nextMsgId = 1;
function newMessageId(): number {
  return nextMsgId++;
}

function cancelStreamTimer(timer: { current: ReturnType<typeof setTimeout> | null }) {
  if (timer.current) {
    clearTimeout(timer.current);
    timer.current = null;
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const historyRef = useRef<HistoryItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const userScrolledUp = useRef(false);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullTextRef = useRef<string>("");
  const lastRenderRef = useRef<number>(0);
  const metaReceivedRef = useRef(false);
  const erroredRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zynd-chat-theme");
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch { /* localStorage unavailable */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("zynd-chat-theme", theme);
    } catch { /* localStorage unavailable */ }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

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

  const patchById = useCallback(
    (msgId: number, fn: (m: Message) => Message) => {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? fn(m) : m)));
    },
    [],
  );

  const scheduleStreamRender = useCallback(
    (msgId: number) => {
      if (erroredRef.current) return;
      const now = Date.now();
      const elapsed = now - lastRenderRef.current;
      const doRender = () => {
        streamTimerRef.current = null;
        if (erroredRef.current) return;
        lastRenderRef.current = Date.now();
        const full = fullTextRef.current;
        patchById(msgId, (m) => ({
          ...m,
          content: full,
          renderedContent: full,
          streaming: true,
        }));
        scrollToBottom();
      };
      if (elapsed >= STREAM_RENDER_MS) {
        cancelStreamTimer(streamTimerRef);
        doRender();
      } else if (!streamTimerRef.current) {
        streamTimerRef.current = setTimeout(doRender, STREAM_RENDER_MS - elapsed);
      }
    },
    [scrollToBottom, patchById],
  );

  const finalizeStreamRender = useCallback(
    (msgId: number) => {
      cancelStreamTimer(streamTimerRef);
      if (erroredRef.current) return;
      lastRenderRef.current = Date.now();
      const full = fullTextRef.current;
      patchById(msgId, (m) => ({
        ...m,
        content: full,
        renderedContent: full,
        streaming: false,
        loading: false,
      }));
      scrollToBottom();
    },
    [scrollToBottom, patchById],
  );

  const send = useCallback(
    async (override?: string) => {
      const q = (override ?? question).trim();
      if (!q || loading) return;

      setQuestion("");
      const assistantId = newMessageId();
      const userId = newMessageId();
      const userMsg: Message = { id: userId, role: "user", content: q };
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        renderedContent: "",
        loading: true,
        streaming: false,
        sources: [],
        sub_queries: [],
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setLoading(true);
      userScrolledUp.current = false;

      scrollToBottom(true);
      autoResizeInput();

      fullTextRef.current = "";
      lastRenderRef.current = Date.now();
      metaReceivedRef.current = false;
      erroredRef.current = false;

      const localPatch = (fn: (m: Message) => Message) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)));

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
          erroredRef.current = true;
          cancelStreamTimer(streamTimerRef);
          localPatch((m) => ({
            ...m,
            content: `Error ${resp.status}: ${resp.statusText}`,
            error: true,
            loading: false,
            streaming: false,
            sources: [],
            renderedContent: undefined,
          }));
          setLoading(false);
          return;
        }

        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let currentEvent: string | null = null;

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
                fullTextRef.current += JSON.parse(raw);
                scheduleStreamRender(assistantId);
              } else if (currentEvent === "meta") {
                metaReceivedRef.current = true;
                finalizeStreamRender(assistantId);
                const meta = JSON.parse(raw);
                localPatch((m) => ({
                  ...m,
                  sources: meta.sources || [],
                  related: meta.related || [],
                  sub_queries: meta.sub_queries || [],
                }));
                historyRef.current = [
                  ...historyRef.current,
                  { role: "user" as const, content: q },
                  {
                    role: "assistant" as const,
                    content: stripTrailingSources(fullTextRef.current),
                  },
                ].slice(-20);
              } else if (currentEvent === "error") {
                erroredRef.current = true;
                cancelStreamTimer(streamTimerRef);
                const err = JSON.parse(raw);
                localPatch((m) => ({
                  ...m,
                  content: err.detail || "Something went wrong.",
                  error: true,
                  loading: false,
                  streaming: false,
                  sources: [],
                  renderedContent: undefined,
                }));
              }
              currentEvent = null;
            }
          }
        }

        if (!metaReceivedRef.current && !erroredRef.current) {
          historyRef.current = [
            ...historyRef.current,
            { role: "user" as const, content: q },
            {
              role: "assistant" as const,
              content: stripTrailingSources(fullTextRef.current),
            },
          ].slice(-20);
        }
      } catch (e) {
        erroredRef.current = true;
        cancelStreamTimer(streamTimerRef);
        const err = e as Error;
        if (err.name !== "AbortError") {
          localPatch((m) => ({
            ...m,
            content: err.message || "Request failed.",
            error: true,
            loading: false,
            streaming: false,
            sources: [],
            renderedContent: undefined,
          }));
        }
      } finally {
        if (!erroredRef.current) {
          finalizeStreamRender(assistantId);
        }
        localPatch((m) => ({
          ...m,
          loading: false,
          streaming: false,
        }));
        setLoading(false);
      }
    },
    [
      question,
      loading,
      scrollToBottom,
      autoResizeInput,
      scheduleStreamRender,
      finalizeStreamRender,
    ],
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
    return () => {
      if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const rootClass = `zynd-chat-root chatbot--${theme}`;

  return (
    <div className={rootClass}>
      {!open && (
        <button className="zynd-chat-fab" onClick={toggle} aria-label="Ask AI">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
          </svg>
        </button>
      )}

      {open && (
        <div className="zynd-chat-modal" role="dialog" aria-label="Ask the Zynd AI">
          <div className="zynd-chat-header">
            <div className="zynd-chat-header-info">
              <div className="zynd-chat-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                </svg>
              </div>
              <div>
                <div className="zynd-chat-header-title-row">
                  <span className="zynd-chat-title">Ask Zynd Docs</span>
                  <span className="zynd-chat-online"></span>
                </div>
                <div className="zynd-chat-subtitle">AI-powered documentation assistant</div>
              </div>
            </div>
            <div className="zynd-chat-header-actions">
              <button
                className="zynd-chat-theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button className="zynd-chat-close" onClick={toggle} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="zynd-chat-messages" ref={containerRef} onScroll={onScroll}>
            {messages.length === 0 && (
              <div className="zynd-chat-empty">
                <div className="zynd-chat-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                  </svg>
                </div>
                <p className="zynd-chat-empty-text">
                  Ask anything about Zynd agents, SDKs, APIs, or deployment.
                </p>
                <div className="zynd-chat-suggestions">
                  <button onClick={() => send("How do I register an agent?")}>
                    How do I register an agent?
                  </button>
                  <button onClick={() => send("How does x402 payment work?")}>
                    How does x402 payment work?
                  </button>
                  <button onClick={() => send("How do I call another agent?")}>
                    How do I call another agent?
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const displayContent = msg.renderedContent ?? msg.content;
              return (
                <div key={msg.id} className={`zynd-chat-message zynd-chat-message--${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="zynd-chat-msg-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                        <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                      </svg>
                    </div>
                  )}

                  <div className={`zynd-chat-msg-body${msg.error ? " zynd-chat-msg-body--error" : ""}`}>
                    {msg.loading && !displayContent ? (
                      <div className="zynd-chat-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : displayContent ? (
                      <div className="zynd-chat-msg-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {stripTrailingSources(displayContent)}
                        </ReactMarkdown>
                      </div>
                    ) : null}

                    {!msg.loading && !msg.streaming && msg.sources && msg.sources.length > 0 && (
                      <div className="zynd-chat-sources">
                        <div className="zynd-chat-sources-label">Sources</div>
                        <div className="zynd-chat-sources-list">
                          {msg.sources.slice(0, 6).map((s, si) => {
                            const href = makeSourceChipHref(s);
                            const skey = sourceKey(s, si);
                            if (href) {
                              return (
                                <a
                                  key={skey}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="zynd-chat-source-chip zynd-chat-source-chip--link"
                                >
                                  <span className={`zynd-source-badge ${s.type === "code" ? "zynd-source-badge--code" : "zynd-source-badge--doc"}`}>
                                    {s.type === "code" ? "code" : "docs"}
                                  </span>
                                  <span className="zynd-source-name">
                                    {s.type === "code"
                                      ? `${s.file?.split("/").slice(-1)[0]}${s.start_line ? `:${s.start_line}` : ""}`
                                      : shortPath(s.source || s.url || s.href || s.link)}
                                  </span>
                                  {s.score != null && (
                                    <span className="zynd-source-score">{Math.round(s.score * 100)}%</span>
                                  )}
                                </a>
                              );
                            }
                            return (
                              <span key={skey} className="zynd-chat-source-chip">
                                <span
                                  className={`zynd-source-badge ${s.type === "code" ? "zynd-source-badge--code" : "zynd-source-badge--doc"}`}
                                >
                                  {s.type === "code" ? "code" : "docs"}
                                </span>
                                <span className="zynd-source-name">
                                  {s.type === "code"
                                    ? s.file?.split("/").slice(-1)[0]
                                    : shortPath(s.source || s.url || s.href || s.link)}
                                </span>
                                {s.score != null && (
                                  <span className="zynd-source-score">{Math.round(s.score * 100)}%</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="zynd-chat-input-area">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                autoResizeInput();
              }}
              onKeyDown={onKeydown}
              placeholder="Ask about Zynd AI..."
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
