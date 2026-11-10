"use client";

import { useState, useMemo } from "react";
import { Copy, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";

const formatDID = (did: string): string => {
  if (!did) return "";
  if (did.length <= 20) return did;
  return `${did.slice(0, 10)}...${did.slice(-10)}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return (
      date.toISOString().split("T")[0] +
      " " +
      date.toTimeString().split(" ")[0].slice(0, 5)
    );
  } catch {
    return "Invalid Date";
  }
};

type CredentialStatus = "active" | "expired" | "revoked";

const getCredentialStatus = (
  revoked: boolean,
  expirationDate: string
): CredentialStatus => {
  if (revoked) return "revoked";
  if (expirationDate && new Date() > new Date(expirationDate)) return "expired";
  return "active";
};

const STATUS_CONFIG: Record<
  CredentialStatus,
  {
    borderColor: string;
    icon: typeof ShieldCheck;
    iconColor: string;
    badgeVariant: "active" | "inactive" | "deprecated";
    text: string;
  }
> = {
  active: {
    borderColor: "border-[var(--color-accent)]/20",
    icon: ShieldCheck,
    iconColor: "text-[var(--color-accent)]",
    badgeVariant: "active",
    text: "Active",
  },
  expired: {
    borderColor: "border-yellow-500/20",
    icon: ShieldAlert,
    iconColor: "text-yellow-400",
    badgeVariant: "inactive",
    text: "Expired",
  },
  revoked: {
    borderColor: "border-red-500/20",
    icon: ShieldX,
    iconColor: "text-red-400",
    badgeVariant: "deprecated",
    text: "Revoked",
  },
};

interface CredentialData {
  id: string;
  revoked: boolean;
  vc: {
    expirationDate: string;
    issuanceDate: string;
    credentialSubject: string;
    issuer: string;
    type: string;
    didIdentifier: string;
  };
}

interface CredentialCardProps {
  credential: unknown;
  index: number;
  isDID: boolean;
}

export function CredentialCard({
  credential,
  index,
  isDID,
}: CredentialCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const credData = useMemo<CredentialData | null>(() => {
    if (!credential) return null;

    const cred = credential as Record<string, unknown> & { id?: string; revoked?: boolean; vc?: Record<string, unknown>; issuanceDate?: string; issuer?: string };
    let processedData: CredentialData;

    if (isDID) {
      processedData = {
        id: cred.id as string,
        revoked: false,
        vc: {
          expirationDate: "",
          issuanceDate: cred.issuanceDate as string,
          credentialSubject: "DID Document",
          issuer: cred.issuer as string,
          type: "DID Document",
          didIdentifier: cred.issuer as string,
        },
      };
    } else {
      const vc = cred.vc as Record<string, unknown>;
      const subject = vc.credentialSubject as Record<string, unknown>;
      processedData = {
        id: cred.id as string,
        revoked: cred.revoked as boolean,
        vc: {
          expirationDate: vc.expirationDate as string,
          issuanceDate: vc.issuanceDate as string,
          credentialSubject: subject.type as string,
          issuer: vc.issuer as string,
          type: subject.type as string,
          didIdentifier: subject.owner as string,
        },
      };
    }

    return processedData;
  }, [credential, isDID]);

  if (!credData) {
    return (
      <div className="h-48 w-full animate-pulse rounded-lg bg-white/5" />
    );
  }

  const status = getCredentialStatus(
    credData.revoked,
    credData.vc.expirationDate
  );
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  const handleCopyDID = () => {
    navigator.clipboard.writeText(credData.vc.didIdentifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
  };

  return (
    <>
      <div className={`group w-full rounded border ${config.borderColor} bg-white/[0.04] p-4 sm:p-5 transition-all hover:bg-white/[0.06]`}>
        <div className="mb-4 flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
          <h3 className="text-sm font-semibold text-white">
            {credData.vc.type}
          </h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wider text-white/30">Issuer</span>
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate font-mono text-xs text-white/60">
                {formatDID(credData.vc.issuer)}
              </span>
              <button
                onClick={handleCopyDID}
                className="cursor-pointer p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors hover:bg-white/[0.06]"
              >
                <Copy
                  className={`h-3.5 w-3.5 ${copied ? "text-[var(--color-accent)]" : "text-white/30"}`}
                />
              </button>
            </div>
          </div>

          <div className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wider text-white/30">Issued To</span>
            <span className="block truncate font-mono text-xs text-white/60">
              {formatDID(credData.vc.didIdentifier)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-white/30">
                Issued
              </span>
              <span className="text-xs text-white/60">
                {formatDate(credData.vc.issuanceDate)}
              </span>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-white/30">
                Expires
              </span>
              <span className="text-xs text-white/60">
                {isDID ? "—" : formatDate(credData.vc.expirationDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <Badge variant={config.badgeVariant}>{config.text}</Badge>
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="cursor-pointer border border-white/10 px-3 py-1.5 min-h-[44px] text-xs text-white/50 transition-colors hover:text-white"
          >
            Details
          </button>
        </div>
      </div>

      <Dialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Credential Details"
        className="max-w-4xl"
      >
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleCopyJSON}
            className="flex cursor-pointer items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy JSON
          </button>
        </div>
        <pre className="max-h-[60vh] overflow-auto rounded bg-black/50 p-3 sm:p-4 text-[10px] sm:text-xs text-white/70">
          <code>{JSON.stringify(credential, null, 2)}</code>
        </pre>
      </Dialog>
    </>
  );
}

export default CredentialCard;
