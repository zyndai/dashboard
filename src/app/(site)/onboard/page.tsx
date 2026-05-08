"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AccentCorners } from "@/components/ui/AccentCorners";
import { GridTripod } from "@/components/ui/GridTripod";

type Step = "init" | "authenticating" | "approving" | "redirecting" | "done" | "error";

const STEP_LABELS: Record<Step, string> = {
  init: "Initializing...",
  authenticating: "Please sign in to continue",
  approving: "Approving developer registration...",
  redirecting: "Redirecting back to CLI...",
  done: "Registration complete! You can close this tab.",
  error: "Something went wrong",
};

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <OnboardContent />
    </Suspense>
  );
}

function OnboardContent() {
  const searchParams = useSearchParams();
  const { ready, authenticated, login } = useAuth();

  const callbackPort = searchParams.get("callback_port");
  const state = searchParams.get("state");
  const name = searchParams.get("name");

  const [step, setStep] = useState<Step>("init");
  const [errorMsg, setErrorMsg] = useState("");
  const approveCalledRef = useRef(false);

  const missingParams = !callbackPort || !state;

  const approve = useCallback(async () => {
    if (approveCalledRef.current) return;
    approveCalledRef.current = true;
    setStep("approving");

    try {
      const res = await fetch("/api/onboard/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Developer",
          state,
          callback_port: Number(callbackPort),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(data.error || `Approval failed (${res.status})`);
      }

      const { developer_id, private_key_enc } = await res.json();

      setStep("redirecting");

      const redirectUrl = new URL(`http://localhost:${callbackPort}/callback`);
      redirectUrl.searchParams.set("developer_id", developer_id);
      redirectUrl.searchParams.set("private_key_enc", private_key_enc);
      redirectUrl.searchParams.set("state", state!);

      window.location.href = redirectUrl.toString();

      setStep("done");
    } catch (err) {
      setStep("error");
      setErrorMsg((err as Error).message);
      approveCalledRef.current = false;
    }
  }, [name, state, callbackPort]);

  // Trigger login when ready but not authenticated
  useEffect(() => {
    if (!ready || missingParams) return;
    if (!authenticated) {
      setStep("authenticating");
    }
  }, [ready, authenticated, missingParams]);

  // After auth, trigger approve
  useEffect(() => {
    if (ready && authenticated && !missingParams && !approveCalledRef.current) {
      approve();
    }
  }, [ready, authenticated, missingParams, approve]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black">
        <div className="padding-global">
          <div className="container">
            <div
              className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center"
              style={{ paddingTop: "1.5rem", paddingBottom: "4rem" }}
            >
              <div className="w-full max-w-lg">
                <div
                  className="solution-card-wrap"
                  style={{ position: "relative", top: "auto", padding: 0 }}
                >
                  <div
                    className="solution-card"
                    style={{
                      display: "block",
                      gridTemplateColumns: "none",
                      minHeight: "auto",
                      gap: 0,
                      padding: 0,
                      position: "relative",
                      zIndex: 5,
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: 0,
                    }}
                  >
                    <div style={{ padding: "2.5rem" }}>
                      <div className="mb-8 text-center">
                        <p
                          style={{
                            fontSize: "clamp(1.5rem, 3vw, 2rem)",
                            fontWeight: 700,
                            color: "white",
                            margin: 0,
                            lineHeight: 1.2,
                          }}
                        >
                          Developer{" "}
                          <span style={{ color: "var(--color-accent)" }}>
                            Onboarding
                          </span>
                        </p>
                        <p className="mt-2 text-sm text-white/40">
                          AgentDNS CLI registration via ZyndAI
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-4 py-8">
                        {missingParams ? (
                          <p className="text-sm text-red-400">
                            Missing required parameters. Please use the CLI to
                            start the onboarding flow.
                          </p>
                        ) : (
                          <>
                            {(step === "init" ||
                              step === "approving" ||
                              step === "redirecting") && (
                              <div className="flex items-center gap-2 text-white/40">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[var(--color-accent)]" />
                                {STEP_LABELS[step]}
                              </div>
                            )}

                            {step === "authenticating" && (
                              <div className="flex w-full flex-col gap-3">
                                <div className="flex items-center gap-2 text-white/40 mb-2">
                                  {STEP_LABELS[step]}
                                </div>
                                <button
                                  onClick={login}
                                  className="flex w-full items-center justify-center gap-2 bg-[var(--color-accent)] py-3.5 text-sm font-bold text-white transition-all hover:brightness-110"
                                >
                                  Sign In with Google
                                </button>
                              </div>
                            )}

                            {step === "done" && (
                              <p className="text-sm text-green-400">
                                {STEP_LABELS.done}
                              </p>
                            )}

                            {step === "error" && (
                              <div className="flex flex-col items-center gap-3">
                                <p className="text-sm text-red-400">
                                  {errorMsg || STEP_LABELS.error}
                                </p>
                                <button
                                  onClick={approve}
                                  className="flex items-center justify-center gap-2 bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110"
                                >
                                  Retry
                                </button>
                              </div>
                            )}

                            {name && step !== "error" && (
                              <p className="mt-4 text-xs text-white/20">
                                Registering as:{" "}
                                <span className="text-white/40">{name}</span>
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="accent-border-overlay" />
                  <div className="accent-background" />
                  <div className="events-none absolute">
                    <AccentCorners />
                  </div>
                  <GridTripod corner="left-top-corner" />
                  <GridTripod corner="right-top-corner" />
                  <GridTripod corner="left-bottom-corner" />
                  <GridTripod corner="right-bottom-corner" />
                  <div className="main-hero-bottom-line" />
                  <div className="main-hero-top-line" />
                </div>
              </div>

              <div className="middle-hero-right-second-line is-hide-mb" />
              <div className="middle-hero-second-line is-hide-mb" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
