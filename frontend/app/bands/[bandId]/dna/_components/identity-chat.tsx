"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { apiFetch, ApiError } from "@/shared/api/client";
import type {
  ArtistDnaVersionResponse,
  BandResponse,
  ChatReplyResponse,
  ChatTurn,
  GeneratedAssetResponse,
  SiteContentData,
} from "@/shared/api/types";
import { useAuth } from "@/shared/auth/auth-context";
import { resizeImageFile, type ResizedImage } from "@/shared/lib/image";
import {
  listenOnce,
  speak,
  speechRecognitionSupported,
  speechSynthesisSupported,
  stopSpeaking,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from "@/shared/lib/speech";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { IconCamera, IconMicrophone, IconSpeaker, IconSpeakerMuted } from "@/shared/ui/icons";
import { DnaResults } from "./dna-results";

const OPENING_MESSAGES: Record<LanguageCode, string> = {
  en: "Hi — I'm Bandly. I want to get to know you as an artist so everything I help you write actually sounds like you, not generic. No wrong answers here. What made you start making music?",
  nl: "Hoi — ik ben Bandly. Ik wil je leren kennen als artiest, zodat alles wat ik straks help schrijven ook echt naar jou klinkt. Geen foute antwoorden. Wat bracht je ertoe om muziek te gaan maken?",
  de: "Hallo — ich bin Bandly. Ich möchte dich als Künstler kennenlernen, damit alles, wobei ich dir später helfe, wirklich nach dir klingt. Es gibt keine falschen Antworten. Was hat dich dazu gebracht, Musik zu machen?",
};

const MIN_TURNS_BEFORE_FINISH = 3;

type Phase = "chatting" | "summarizing" | "generating" | "signature" | "done";

/**
 * The conversational alternative to a static form (IdentityQuestions is
 * still what gets extracted into, on the backend — see
 * IdentityChatService.summarize) — built accessibly from the start, not
 * retrofitted: the transcript is a proper aria-live log so screen reader
 * users hear Bandly's replies as they arrive, voice output/input are real
 * (Web Speech API — see shared/lib/speech.ts) not just visual affordances,
 * and every control works from the keyboard alone. Euregio launch market:
 * Dutch, German, and English, both for the conversation and — via
 * IdentityProfile.language on the backend — for the DNA generated from it.
 */
export function IdentityChat({ bandId }: { bandId: string }) {
  const { accessToken } = useAuth();
  const [language, setLanguage] = useState<LanguageCode>("nl");
  const [messages, setMessages] = useState<ChatTurn[]>([{ role: "assistant", content: OPENING_MESSAGES.nl }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("chatting");
  const [assets, setAssets] = useState<GeneratedAssetResponse[] | null>(null);
  const [version, setVersion] = useState<ArtistDnaVersionResponse | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContentData | null>(null);
  const [bandName, setBandName] = useState("");
  const [speakReplies, setSpeakReplies] = useState(true);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [pendingImage, setPendingImage] = useState<ResizedImage | null>(null);
  const [imageStatus, setImageStatus] = useState("");

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const ttsSupported = speechSynthesisSupported();
  const sttSupported = speechRecognitionSupported();

  const userTurnCount = messages.filter((m) => m.role === "user").length;
  const canFinish = userTurnCount >= MIN_TURNS_BEFORE_FINISH && phase === "chatting";

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Only needed for the reveal screen's signature wordmark — the chat
  // itself never shows the artist's name back to them.
  useEffect(() => {
    if (!accessToken) return;
    apiFetch<BandResponse[]>("/api/v1/bands", { token: accessToken })
      .then((bands) => {
        const band = bands.find((b) => b.id === bandId);
        if (band) setBandName(band.name);
      })
      .catch(() => {});
  }, [accessToken, bandId]);

  // Still just the opening line, nothing typed yet — switching language
  // before the conversation starts should switch the greeting too.
  function handleLanguageChange(next: LanguageCode) {
    setLanguage(next);
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([{ role: "assistant", content: OPENING_MESSAGES[next] }]);
    }
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if ((!text && !pendingImage) || sending || !accessToken) return;

    const nextMessages: ChatTurn[] = [
      ...messages,
      {
        role: "user",
        content: text,
        imageBase64: pendingImage?.base64,
        imageMimeType: pendingImage?.mimeType,
      },
    ];
    setMessages(nextMessages);
    setInput("");
    setInterimTranscript("");
    setPendingImage(null);
    setError(null);
    setSending(true);
    try {
      const response = await apiFetch<ChatReplyResponse>(`/api/v1/bands/${bandId}/dna/chat`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ history: nextMessages, language }),
      });
      setMessages((current) => [...current, { role: "assistant", content: response.reply }]);
      if (speakReplies && ttsSupported) speak(response.reply, language);
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

  function toggleSpeakReplies() {
    if (speakReplies) stopSpeaking();
    setSpeakReplies((value) => !value);
  }

  function startListening() {
    if (listening) return;
    stopSpeaking(); // don't talk over yourself while the artist is trying to speak
    setError(null);
    setListening(true);
    setInterimTranscript("");
    const handle = listenOnce(language, {
      onInterim: (text) => setInterimTranscript(text),
      onFinal: (text) => {
        setInterimTranscript("");
        if (text) sendMessage(text);
      },
      onError: (message) => {
        setError(message);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    stopListeningRef.current = handle.stop;
  }

  function stopListening() {
    stopListeningRef.current?.();
    setListening(false);
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be picked again later
    if (!file) return;
    try {
      const resized = await resizeImageFile(file);
      setPendingImage(resized);
      setImageStatus("Photo attached — it'll go with your next message.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that photo — try another one.");
    }
  }

  function removePendingImage() {
    setPendingImage(null);
    setImageStatus("Photo removed.");
  }

  async function finishAndBuildDna() {
    if (!accessToken) return;
    setError(null);
    setPhase("summarizing");
    try {
      await apiFetch(`/api/v1/bands/${bandId}/dna/chat/summarize`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ history: messages, language }),
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

      setPhase("signature");
      try {
        const content = await apiFetch<SiteContentData>(`/api/v1/bands/${bandId}/site/logo/generate`, {
          method: "POST",
          token: accessToken,
        });
        setSiteContent(content);
      } catch {
        // The signature wordmark is a flourish on top of the DNA text and
        // colors, not a requirement — the reveal still stands without it.
      }
      setPhase("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't build your DNA from this conversation — try again.");
      setPhase("chatting");
    }
  }

  if (phase === "done" && assets) {
    return (
      <DnaResults
        bandId={bandId}
        bandName={bandName}
        assets={assets}
        version={version}
        logoMark={siteContent?.logoMark ?? null}
      />
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-6 py-8">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">Artist DNA</h1>
          <p className="mt-1 text-sm text-ink-muted">
            A conversation, not a form — talk to Bandly about who you are as an artist, then turn it into your DNA
            whenever you&apos;re ready.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex gap-1 rounded-md bg-surface p-1" role="radiogroup" aria-label="Conversation language">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={language === lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  language === lang.code ? "bg-surface-raised text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
          {ttsSupported ? (
            <button
              type="button"
              onClick={toggleSpeakReplies}
              aria-pressed={speakReplies}
              title={speakReplies ? "Bandly's voice is on" : "Bandly's voice is off"}
              className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {speakReplies ? <IconSpeaker className="size-4" /> : <IconSpeakerMuted className="size-4" />}
              <span className="sr-only">{speakReplies ? "Turn off Bandly's voice" : "Turn on Bandly's voice"}</span>
            </button>
          ) : null}
        </div>
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
                className={`group relative max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-accent text-on-accent"
                    : "bg-surface-raised text-ink"
                }`}
              >
                <span className="sr-only">{message.role === "user" ? "You said: " : "Bandly says: "}</span>
                {message.imageBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`data:${message.imageMimeType};base64,${message.imageBase64}`}
                    alt="Photo you shared with Bandly"
                    className="mb-2 max-h-48 w-full rounded-lg object-cover"
                  />
                ) : null}
                {message.content}
                {message.role === "assistant" && ttsSupported ? (
                  <button
                    type="button"
                    onClick={() => speak(message.content, language)}
                    className="ml-2 inline-flex size-5 items-center justify-center rounded text-ink-faint opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <IconSpeaker className="size-3.5" />
                    <span className="sr-only">Replay this message aloud</span>
                  </button>
                ) : null}
              </p>
            </div>
          ))}
          <p aria-live="polite" className="sr-only">
            {sending ? "Bandly is typing…" : listening ? "Listening…" : ""}
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
          <p aria-live="polite" className="sr-only">
            {imageStatus}
          </p>
          {pendingImage ? (
            <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-border bg-paper p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage.dataUrl} alt="" className="size-10 rounded object-cover" />
              <span className="flex-1 text-xs text-ink-muted">Photo attached — sent with your next message.</span>
              <button
                type="button"
                onClick={removePendingImage}
                className="rounded px-2 py-1 text-xs font-medium text-ink-muted hover:text-attention"
              >
                Remove
              </button>
            </div>
          ) : null}
          <div className="flex items-end gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhotoSelected}
              className="sr-only"
              id="chat-photo-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Add a photo of yourself"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
            >
              <IconCamera className="size-4" />
              <span className="sr-only">Add a photo of yourself, for Bandly to see</span>
            </button>
            {sttSupported ? (
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                aria-pressed={listening}
                title={listening ? "Stop listening" : "Speak your answer"}
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  listening
                    ? "border-attention bg-attention-soft text-attention"
                    : "border-border text-ink-muted hover:border-border-strong hover:text-ink"
                }`}
              >
                <IconMicrophone className="size-4" />
                <span className="sr-only">{listening ? "Stop listening" : "Speak your answer"}</span>
              </button>
            ) : null}
            <textarea
              id="chat-input"
              ref={inputRef}
              value={listening ? interimTranscript : input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              readOnly={listening}
              rows={1}
              placeholder={listening ? "Listening…" : "Type your answer…"}
              className="max-h-32 flex-1 resize-none rounded-lg border border-border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
            <Button type="submit" size="md" loading={sending} disabled={(!input.trim() && !pendingImage) || listening}>
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
          loading={phase === "summarizing" || phase === "generating" || phase === "signature"}
        >
          {phase === "summarizing"
            ? "Reading back what you said…"
            : phase === "generating"
              ? "Writing your DNA…"
              : phase === "signature"
                ? "Composing your signature…"
                : "Finish & build my DNA"}
        </Button>
      </div>
    </div>
  );
}
