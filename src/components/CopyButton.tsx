"use client";

import { useState, useCallback } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
      aria-label={copied ? "Copied" : `Copy ${label || "to clipboard"}`}
      className={`inline-flex items-center justify-center min-w-[32px] min-h-[32px] text-xs px-2 py-1 rounded transition-colors ${
        copied
          ? "bg-[#8B5CF633] text-[#8B5CF6]"
          : "bg-[#ffffff1a] text-[#ffffff66] hover:text-[#E0E7FF] hover:bg-[#ffffff26]"
      } ${className}`}
      title={copied ? "Copied!" : label ? `Copy ${label}` : "Copy to clipboard"}
    >
      {copied ? "Copied" : label || (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}
