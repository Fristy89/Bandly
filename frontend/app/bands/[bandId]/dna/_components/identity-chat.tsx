"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { apiFetch, ApiError } from "@/shared/api/client";
import type { ArtistDnaVersionResponse, ChatReplyResponse, ChatTurn, GeneratedAssetResponse } from "@/shared/api/types";
import { useAuth } from "@/shared/auth/auth-context";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { DnaResults } from "./dna-results";

const OPENING_MESSAGE =
  "Hi — I'm Bandly. I want to get to know you as an artist so everything I help you write actually sounds like you, not generic. No wrong answers here. What made you start making music?";

const MIN_TURNS_BEFORE_FINISH = 3;

type Phase = "chatting" | "summarizing" | "generating" | "done";

/**
 * The conversational alternative to a static form (IdentityQuestions is
 * still what gets extracted into, on the backend — see
 * IdentityChatService.summarize) — built accessibly from the start, not
 * retrofitted: the transcript is a proper aria-live log so screen reader
 * users hear Bandly's replies as they arrive, "Bandly is typing" is
 * announced through a separate live region rather than only shown
 * visually, and every control works from the keyboard alone.
 */
export function IdentityChat({ bandId }: { bandId: string }) {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<ChatTurn[]>([{ role: "assistant", content: OPENING_MESSAGE }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("chatting");
  const [assets, setAssets] = useState<GeneratedAssetResponse[] | null>(null);
  const [version, setVersion] = useState<ArtistDnaVersionResponse | null>(null);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userTurnCount = messages.filter((m) => m.role === "user").length;
  const canFinish = userTurnCount >= MIN_TURNS_BEFORE_FINISH && phase === "chatting";

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending || !accessToken) return;

    const nextMessages: ChatTurn[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const response = await apiFetch<ChatReplyResponse>(`/api/v1/bands/${bandId}/dna/chat`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ history: nextMessages }),
      });
      setMessages((current) => [...current, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Bandly didn't respond — try sending that again.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  async function finishAndBuildDna() {
    if (!accessToken) return;
    setError(null);
    setPhase("summarizing");
    try {
      await apiFetch(`/api/v1/bands/${bandId}/dna/chat/summarize`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ history: messages }),
      });
      setPhase("generating");
      const generatedVersion = await apiFetch<ArtistDnaVersionResponse>(`/api/v1/bands/${bandId}/dna/generate`, {
        method: "POST",
        token: accessToken,
      });
      const result = await apiFetch<GeneratedAssetResponse[]>(`/api/v1/bands/${bandId}/dna/current`, {
        token: accessToken,
      });
      setVersion(generatedVersion);
      setAssets(result);
      setPhase("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't build your DNA from this conversation — try again.");
      setPhase("chatting");
    }
  }

  if (phase === "done" && assets) {
    return <DnaResults bandId={bandId} assets={assets} version={version} />;
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <header className="mb-4">
        <h1 className="font-display text-display-md text-ink">Artist DNA</h1>
        <p className="mt-1 text-sm text-ink-muted">
          A conversation, not a form — talk to Bandly about who you are as an artist, then turn it into your DNA
          whenever you&apos;re ready.
        </p>
      </header>

      <Card className="flex min-h-0 flex-1 flex-col">
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversation with Bandly"
          className="flex-1 space-y-4 overflow-y-auto p-5"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {message.role === "assistant" ? (
                <span
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-signature text-sm text-accent-strong"
                  aria-hidden="true"
                >
                  B
                </span>
              ) : (
                <Avatar name="You" size="sm" />
              )}
              <p
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-accent text-on-accent"
                    : "bg-surface-raised text-ink"
                }`}
              >
                <span className="sr-only">{message.role === "user" ? "You said: " : "Bandly says: "}</span>
                {message.content}
              </p>
            </div>
          ))}
          <p aria-live="polite" className="sr-only">
            {sending ? "Bandly is typing…" : ""}
          </p>
          {sending ? (
            <div className="flex items-center gap-2.5" aria-hidden="true">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-signature text-sm text-accent-strong">
                B
              </span>
              <span className="flex gap-1 rounded-xl bg-surface-raised px-3.5 py-3">
                <span className="size-1.5 animate-pulse rounded-full bg-ink-faint [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-pulse rounded-full bg-ink-faint [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-pulse rounded-full bg-ink-faint" />
              </span>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <label htmlFor="chat-input" className="sr-only">
            Your message to Bandly
          </label>
          <div className="flex items-end gap-2.5">
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your answer…"
              className="max-h-32 flex-1 resize-none rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
            <Button type="submit" size="md" loading={sending} disabled={!input.trim()}>
              Send
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-attention">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-ink-faint">
          {canFinish
            ? "Whenever you're ready — Bandly has enough to work with."
            : `A few more exchanges and you'll be able to build your DNA (${userTurnCount}/${MIN_TURNS_BEFORE_FINISH}).`}
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={finishAndBuildDna}
          disabled={!canFinish}
          loading={phase === "summarizing" || phase === "generating"}
        >
          {phase === "summarizing"
            ? "Reading back what you said…"
            : phase === "generating"
              ? "Writing your DNA…"
              : "Finish & build my DNA"}
        </Button>
      </div>
    </div>
  );
}
