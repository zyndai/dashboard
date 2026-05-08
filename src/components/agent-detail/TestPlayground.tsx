"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { EntityRecord } from "@/lib/api/agentdns";

const C = {
  surface: "#0d1625",
  surfaceAlt: "#152033",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.15)",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  textFaint: "#64748b",
  accent: "#5b7cfa",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type Method = (typeof METHODS)[number];

interface AgentSkill {
  id?: string;
  name?: string;
  description?: string;
}

interface AgentCard {
  url?: string;
  preferredTransport?: string;
  skills?: AgentSkill[];
  protocolVersion?: string;
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
}

interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  target: string;
  method: string;
  durationMs: number;
}

interface ProxyError {
  error: string;
  detail?: string;
  durationMs?: number;
}

type Mode = "ask" | "raw";

type ParsedJson = unknown;

interface JsonRpcResponse {
  jsonrpc?: string;
  id?: string | number;
  result?: ParsedJson;
  error?: { code?: number; message?: string; data?: unknown };
}

interface MessagePart {
  kind?: string;
  text?: string;
  file?: { name?: string; mimeType?: string; bytes?: string; uri?: string };
}

interface MessageResult {
  kind?: string;
  parts?: MessagePart[];
  role?: string;
}

interface TaskArtifact {
  artifactId?: string;
  name?: string;
  parts?: MessagePart[];
}

interface TaskResult {
  kind?: string;
  id?: string;
  status?: { state?: string; timestamp?: string; message?: MessageResult };
  artifacts?: TaskArtifact[];
  history?: MessageResult[];
}

function pickEndpoint(card: AgentCard | null, agent: EntityRecord): string | null {
  return (
    card?.url ||
    agent.service_endpoint ||
    agent.entity_url ||
    agent.openapi_url ||
    null
  );
}

function tryParseJson(text: string): ParsedJson | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return C.green;
  if (status >= 300 && status < 400) return C.amber;
  return C.red;
}

function bytesToDataUri(bytes: string, mimeType: string): string {
  return `data:${mimeType || "application/octet-stream"};base64,${bytes}`;
}

function isImageMime(mime: string | undefined): boolean {
  return !!mime && mime.startsWith("image/");
}
function isAudioMime(mime: string | undefined): boolean {
  return !!mime && mime.startsWith("audio/");
}
function isVideoMime(mime: string | undefined): boolean {
  return !!mime && mime.startsWith("video/");
}

function buildA2AEnvelope(args: { messageId: string; text: string; skillId?: string }) {
  const metadata = args.skillId ? { metadata: { skillId: args.skillId } } : {};
  return {
    jsonrpc: "2.0",
    id: args.messageId,
    method: "message/send",
    params: {
      message: {
        kind: "message",
        messageId: args.messageId,
        role: "user",
        parts: [{ kind: "text", text: args.text }],
        ...metadata,
      },
    },
  };
}

export function TestPlayground({
  agent,
  onClose,
}: {
  agent: EntityRecord;
  onClose: () => void;
}) {
  const idPrefix = useId();
  const [card, setCard] = useState<AgentCard | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("ask");
  const [askText, setAskText] = useState("");
  const [skillId, setSkillId] = useState<string>("");
  const [method, setMethod] = useState<Method>("POST");
  const [path, setPath] = useState("");
  const [rawBody, setRawBody] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<ProxyResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch the agent card so we know transport, skills, and endpoint.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `/api/registry/entities/${encodeURIComponent(agent.entity_id)}/card`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const c = (await res.json()) as AgentCard;
        if (controller.signal.aborted) return;
        setCard(c);
        const firstSkill = c.skills?.[0];
        if (firstSkill?.id) setSkillId(firstSkill.id);
        // Only flip away from the friendly Ask mode when we positively know
        // the transport isn't JSON-RPC. AbortError on an interrupted fetch
        // (StrictMode dev double-mount) used to land here and silently flip
        // the user into Raw mode — keep Ask as the default.
        if (c.preferredTransport && c.preferredTransport !== "JSONRPC") {
          setMode("raw");
        }
      } catch {
        // Network or abort error — stay on whatever mode the user has.
      } finally {
        if (!controller.signal.aborted) setCardLoading(false);
      }
    })();
    return () => controller.abort();
  }, [agent.entity_id]);

  const endpoint = useMemo(() => pickEndpoint(card, agent), [card, agent]);
  const transport = card?.preferredTransport;
  const isA2A = transport === "JSONRPC";

  const send = useCallback(async (): Promise<void> => {
    setSending(true);
    setResponse(null);
    setErrorMsg(null);

    let bodyToSend: string | undefined;
    let methodToSend: Method = method;
    let pathToSend = path;

    if (mode === "ask") {
      if (!askText.trim()) {
        setErrorMsg("Type a message first.");
        setSending(false);
        return;
      }
      const messageId = `msg-${Date.now().toString(36)}`;
      bodyToSend = JSON.stringify(
        buildA2AEnvelope({ messageId, text: askText, skillId: skillId || undefined })
      );
      methodToSend = "POST";
      pathToSend = ""; // A2A endpoint is the card's url root
    } else {
      bodyToSend = rawBody || undefined;
    }

    try {
      const res = await fetch("/api/registry/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: agent.entity_id,
          method: methodToSend,
          path: pathToSend,
          body: bodyToSend,
        }),
      });
      const data = (await res.json()) as ProxyResponse | ProxyError;
      if (!res.ok || "error" in data) {
        const err = data as ProxyError;
        setErrorMsg(err.detail ? `${err.error}: ${err.detail}` : err.error);
      } else {
        setResponse(data as ProxyResponse);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSending(false);
    }
  }, [mode, method, path, rawBody, askText, skillId, agent.entity_id]);

  if (cardLoading) {
    return (
      <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.border}`, background: "rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="tp-spinner" />
          Loading agent card…
        </div>
        <PlaygroundStyles />
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.border}`, background: "rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: 13, color: C.amber, marginBottom: 8 }}>No callable endpoint</div>
        <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, margin: 0 }}>
          This entity has no <code style={codeChip}>url</code> on its card and no fallback service endpoint.
        </p>
        <button type="button" onClick={onClose} className="ad-btn-secondary" style={{ marginTop: 12 }}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, background: "rgba(0,0,0,0.15)" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textTransform: "uppercase", letterSpacing: 1.2 }}>
          Test Playground
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isA2A && (
            <div role="tablist" aria-label="Playground mode" style={tabBarStyle}>
              <ModeTab id={`${idPrefix}-ask`} active={mode === "ask"} onClick={() => setMode("ask")} label="Ask" />
              <ModeTab id={`${idPrefix}-raw`} active={mode === "raw"} onClick={() => setMode("raw")} label="Raw" />
            </div>
          )}
          <button type="button" onClick={onClose} aria-label="Close playground" style={iconBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <EndpointCard endpoint={endpoint} transport={transport} skillsCount={card?.skills?.length ?? 0} />

        {mode === "ask" ? (
          <AskForm
            value={askText}
            onChange={setAskText}
            skills={card?.skills ?? []}
            skillId={skillId}
            onSkillChange={setSkillId}
            inputModes={card?.defaultInputModes}
          />
        ) : (
          <RawForm
            method={method}
            onMethodChange={setMethod}
            path={path}
            onPathChange={setPath}
            body={rawBody}
            onBodyChange={setRawBody}
          />
        )}

        <button
          type="button"
          onClick={send}
          disabled={sending}
          className="ad-btn-primary"
          style={sendBtnStyle(sending)}
        >
          {sending ? (
            <>
              <span className="tp-spinner" />
              Sending…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              Send
            </>
          )}
        </button>

        {errorMsg && <ErrorBanner text={errorMsg} />}
        {response && <ResponseView response={response} />}
      </div>

      <PlaygroundStyles />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function EndpointCard({
  endpoint,
  transport,
  skillsCount,
}: {
  endpoint: string;
  transport: string | undefined;
  skillsCount: number;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>Endpoint</span>
        <div style={{ display: "flex", gap: 8 }}>
          {transport && <span style={{ fontFamily: C.mono, color: C.accent }}>{transport}</span>}
          {skillsCount > 0 && <span style={{ fontFamily: C.mono, color: C.textFaint }}>{skillsCount} skill{skillsCount === 1 ? "" : "s"}</span>}
        </div>
      </div>
      <div style={{ fontSize: 12, fontFamily: C.mono, color: C.text, wordBreak: "break-all", padding: "8px 10px", background: C.surfaceAlt, borderRadius: 6, border: `1px solid ${C.border}` }}>
        {endpoint}
      </div>
    </div>
  );
}

function ModeTab({ id, active, onClick, label }: { id: string; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background: active ? C.accent : "transparent",
        color: active ? "#fff" : C.textMuted,
        border: "none",
        padding: "5px 12px",
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 5,
        cursor: "pointer",
        transition: "background 0.12s, color 0.12s",
      }}
    >
      {label}
    </button>
  );
}

function AskForm({
  value,
  onChange,
  skills,
  skillId,
  onSkillChange,
  inputModes,
}: {
  value: string;
  onChange: (s: string) => void;
  skills: AgentSkill[];
  skillId: string;
  onSkillChange: (s: string) => void;
  inputModes: string[] | undefined;
}) {
  return (
    <>
      {skills.length > 1 && (
        <label style={fieldLabelStyle}>
          <span>Skill</span>
          <select
            value={skillId}
            onChange={(e) => onSkillChange(e.target.value)}
            style={inputStyle}
          >
            <option value="">(let the agent decide)</option>
            {skills.map((s, i) => (
              <option key={s.id ?? i} value={s.id ?? ""}>
                {s.name || s.id || `skill ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
      )}
      <label style={fieldLabelStyle}>
        <span>
          Message
          {inputModes && inputModes.length > 0 && (
            <span style={{ marginLeft: 8, color: C.textFaint, fontFamily: C.mono, fontSize: 10 }}>
              accepts: {inputModes.join(", ")}
            </span>
          )}
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask the agent something…"
          spellCheck={false}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>
    </>
  );
}

function RawForm({
  method,
  onMethodChange,
  path,
  onPathChange,
  body,
  onBodyChange,
}: {
  method: Method;
  onMethodChange: (m: Method) => void;
  path: string;
  onPathChange: (s: string) => void;
  body: string;
  onBodyChange: (s: string) => void;
}) {
  const showBody = method === "POST" || method === "PUT" || method === "PATCH";
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8 }}>
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value as Method)}
          style={{ ...inputStyle, fontWeight: 600, cursor: "pointer" }}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
          placeholder="path under endpoint  (optional)"
          spellCheck={false}
          style={inputStyle}
        />
      </div>
      {showBody && (
        <label style={fieldLabelStyle}>
          <span>Request body</span>
          <textarea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder='{"jsonrpc":"2.0","id":1,"method":"message/send","params":{...}}'
            spellCheck={false}
            rows={6}
            style={{ ...inputStyle, resize: "vertical", fontFamily: C.mono, fontSize: 12 }}
          />
        </label>
      )}
    </>
  );
}

function ErrorBanner({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 12, color: C.red, padding: "10px 12px", background: "rgba(239,68,68,0.08)", border: `1px solid rgba(239,68,68,0.25)`, borderRadius: 6 }}>
      {text}
    </div>
  );
}

function ResponseView({ response }: { response: ProxyResponse }) {
  const parsed = useMemo(() => tryParseJson(response.body), [response.body]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontSize: 12 }}>
        <span style={{ color: statusColor(response.status), fontFamily: C.mono, fontWeight: 700 }}>
          {response.status} {response.statusText}
        </span>
        <span style={{ color: C.textFaint, fontFamily: C.mono }}>{response.durationMs}ms</span>
        <span style={{ color: C.textFaint, fontFamily: C.mono, fontSize: 11, wordBreak: "break-all", flex: "1 1 200px" }}>
          {response.method} {response.target}
        </span>
      </div>
      <SmartResponseBody parsed={parsed} raw={response.body} />
    </div>
  );
}

function SmartResponseBody({ parsed, raw }: { parsed: ParsedJson | null; raw: string }) {
  if (parsed && typeof parsed === "object") {
    const rpc = parsed as JsonRpcResponse;
    if (rpc.error) return <JsonRpcErrorView error={rpc.error} raw={raw} />;
    if (rpc.result && typeof rpc.result === "object") {
      // A2A Task response — parts live inside artifacts[].
      const task = rpc.result as TaskResult;
      if (task.kind === "task" && Array.isArray(task.artifacts) && task.artifacts.length > 0) {
        return <TaskResultView task={task} raw={raw} />;
      }
      // Direct Message response — parts at top level.
      const result = rpc.result as MessageResult;
      if (Array.isArray(result.parts) && result.parts.length > 0) {
        return <MessagePartsView parts={result.parts} raw={raw} />;
      }
    }
  }

  return (
    <pre style={preStyle}>
      {parsed ? JSON.stringify(parsed, null, 2) : raw || "(empty body)"}
    </pre>
  );
}

function TaskResultView({ task, raw }: { task: TaskResult; raw: string }) {
  const state = task.status?.state ?? "unknown";
  const stateColor = state === "completed" ? C.green : state === "failed" || state === "canceled" ? C.red : C.amber;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textFaint }}>
        <span style={{ color: stateColor, fontFamily: C.mono, fontWeight: 700, textTransform: "uppercase" }}>
          {state}
        </span>
        {task.id && <span style={{ fontFamily: C.mono }}>{task.id}</span>}
      </div>
      {task.artifacts?.map((artifact, i) => (
        <div key={artifact.artifactId ?? i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {artifact.name && (
            <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.8 }}>
              {artifact.name}
            </div>
          )}
          {artifact.parts?.map((part, j) => <PartView key={j} part={part} />)}
        </div>
      ))}
      <details style={{ marginTop: 4 }}>
        <summary style={{ cursor: "pointer", color: C.textFaint, fontSize: 11 }}>raw response JSON</summary>
        <pre style={preStyle}>{raw}</pre>
      </details>
    </div>
  );
}

function JsonRpcErrorView({ error, raw }: { error: NonNullable<JsonRpcResponse["error"]>; raw: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ color: C.red, fontFamily: C.mono, fontSize: 12, fontWeight: 700 }}>
          JSON-RPC error{typeof error.code === "number" ? ` ${error.code}` : ""}
        </span>
        <span style={{ color: C.text, fontSize: 12 }}>{error.message ?? "(no message)"}</span>
      </div>
      <details>
        <summary style={{ cursor: "pointer", color: C.textFaint, fontSize: 11 }}>raw response</summary>
        <pre style={preStyle}>{raw}</pre>
      </details>
    </div>
  );
}

function MessagePartsView({ parts, raw }: { parts: MessagePart[]; raw: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {parts.map((part, i) => (
        <PartView key={i} part={part} />
      ))}
      <details style={{ marginTop: 4 }}>
        <summary style={{ cursor: "pointer", color: C.textFaint, fontSize: 11 }}>raw response JSON</summary>
        <pre style={preStyle}>{raw}</pre>
      </details>
    </div>
  );
}

function PartView({ part }: { part: MessagePart }) {
  if (part.kind === "text" || (typeof part.text === "string" && !part.file)) {
    // Many A2A agents stuff JSON into a "text" part — pretty-print if it parses.
    const text = part.text ?? "";
    const inner = tryParseJson(text);
    return (
      <div style={{ padding: "12px 14px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: inner ? C.mono : undefined }}>
        {inner ? JSON.stringify(inner, null, 2) : text}
      </div>
    );
  }
  if (part.file) {
    const f = part.file;
    const src = f.uri ?? (f.bytes ? bytesToDataUri(f.bytes, f.mimeType ?? "") : null);
    if (src && isImageMime(f.mimeType)) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={f.name ?? "agent output"} style={{ maxWidth: "100%", borderRadius: 6, border: `1px solid ${C.border}` }} />;
    }
    if (src && isAudioMime(f.mimeType)) {
      return <audio controls src={src} style={{ width: "100%" }} />;
    }
    if (src && isVideoMime(f.mimeType)) {
      return <video controls src={src} style={{ width: "100%", borderRadius: 6 }} />;
    }
    if (src) {
      return (
        <a href={src} download={f.name ?? "download"} style={{ color: C.accent, fontSize: 12, fontFamily: C.mono, textDecoration: "underline", padding: "10px 12px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6, display: "inline-block" }}>
          ↓ {f.name ?? f.mimeType ?? "file"}
        </a>
      );
    }
  }
  return (
    <pre style={preStyle}>{JSON.stringify(part, null, 2)}</pre>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const codeChip: React.CSSProperties = {
  background: C.surfaceAlt,
  padding: "1px 5px",
  borderRadius: 3,
  fontFamily: C.mono,
  fontSize: 11,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: C.surfaceAlt,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 13,
  boxSizing: "border-box",
  outline: "none",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 11,
  color: C.textFaint,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const tabBarStyle: React.CSSProperties = {
  display: "inline-flex",
  background: C.surfaceAlt,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: 2,
};

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: C.textMuted,
  cursor: "pointer",
  padding: 4,
  display: "inline-flex",
};

const preStyle: React.CSSProperties = {
  margin: 0,
  background: C.surfaceAlt,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: "10px 12px",
  fontSize: 11.5,
  fontFamily: C.mono,
  color: C.text,
  maxHeight: 360,
  overflow: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

function sendBtnStyle(sending: boolean): React.CSSProperties {
  return {
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 6,
    opacity: sending ? 0.6 : 1,
    cursor: sending ? "wait" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  };
}

function PlaygroundStyles() {
  return (
    <style>{`
      .tp-spinner {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255,255,255,0.25);
        border-top-color: #fff;
        border-radius: 50%;
        animation: tp-spin 0.8s linear infinite;
      }
      @keyframes tp-spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}
