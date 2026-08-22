"use client";

import { useRef, useState, type CSSProperties } from "react";
import { apiFetch, ApiError } from "@/shared/api/client";
import type { GeneratedAssetResponse } from "@/shared/api/types";
import { useAuth } from "@/shared/auth/auth-context";
import { cn } from "@/shared/lib/cn";
import { IconCheck, IconPencil, IconRefresh } from "@/shared/ui/icons";

/**
 * One DNA field, editable and regenerable in place — the "next level"
 * beyond a flat read-only summary: if the bio is right but the tone-of-
 * voice note isn't, this rewrites just that one field (POST
 * .../assets/{id}/regenerate) instead of forcing a full DNA reroll, or
 * takes the artist's own rewrite directly (PATCH .../assets/{id}).
 */
export function AssetCard({
  bandId,
  label,
  asset,
  style,
  onUpdated,
}: {
  bandId: string;
  label: string;
  asset: GeneratedAssetResponse;
  style?: CSSProperties;
  onUpdated: (asset: GeneratedAssetResponse) => void;
}) {
  const { accessToken } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(asset.content);
  const [busy, setBusy] = useState<"idle" | "regenerating" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEditing() {
    setDraft(asset.content);
    setError(null);
    setEditing(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
  }

  async function saveEdit() {
    if (!accessToken || draft.trim() === "") return;
    setBusy("saving");
    setError(null);
    try {
      const updated = await apiFetch<GeneratedAssetResponse>(`/api/v1/bands/${bandId}/dna/assets/${asset.id}`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ content: draft.trim() }),
      });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save that edit — try again.");
    } finally {
      setBusy("idle");
    }
  }

  async function regenerate() {
    if (!accessToken) return;
    setBusy("regenerating");
    setError(null);
    try {
      const updated = await apiFetch<GeneratedAssetResponse>(
        `/api/v1/bands/${bandId}/dna/assets/${asset.id}/regenerate`,
        { method: "POST", token: accessToken },
      );
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't regenerate that — try again.");
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div
      className={cn(
        "group relative rounded-[28px] bg-surface/70 p-6 backdrop-blur-xl transition-shadow duration-300",
        "shadow-[0_1px_2px_rgba(36,32,26,0.04),0_16px_40px_-24px_rgba(36,32,26,0.18)]",
        "hover:shadow-[0_1px_2px_rgba(36,32,26,0.05),0_24px_56px_-24px_rgba(36,32,26,0.24)]",
        "motion-safe:animate-[rise-in_0.5s_cubic-bezier(0.2,0.8,0.2,1)]",
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</h2>
        {!editing ? (
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            {asset.status === "EDITED" ? (
              <span className="mr-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent-strong">
                Edited
              </span>
            ) : null}
            <button
              type="button"
              onClick={regenerate}
              disabled={busy !== "idle"}
              title="Rewrite this field"
              className="flex size-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink disabled:opacity-40"
            >
              <IconRefresh className={cn("size-3.5", busy === "regenerating" && "animate-spin")} />
              <span className="sr-only">Rewrite this field</span>
            </button>
            <button
              type="button"
              onClick={startEditing}
              disabled={busy !== "idle"}
              title="Edit this field"
              className="flex size-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-raised hover:text-ink disabled:opacity-40"
            >
              <IconPencil className="size-3.5" />
              <span className="sr-only">Edit this field</span>
            </button>
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={Math.max(3, Math.ceil(draft.length / 60))}
            className="w-full resize-none rounded-2xl border border-border bg-paper p-3 text-sm leading-relaxed text-ink focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={saveEdit}
              disabled={busy !== "idle" || draft.trim() === ""}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-50"
            >
              <IconCheck className="size-3.5" />
              {busy === "saving" ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={busy !== "idle"}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className={cn(
            "mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-ink transition-opacity duration-200",
            busy === "regenerating" && "opacity-40",
          )}
        >
          {asset.content}
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-2 text-xs text-attention">
          {error}
        </p>
      ) : null}
    </div>
  );
}
