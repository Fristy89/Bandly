import type { bandContext } from "@/shared/data/mock";

type ContextStripProps = {
  context: typeof bandContext;
};

export function ContextStrip({ context }: ContextStripProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface px-6 py-5 sm:flex-row sm:items-center sm:gap-10">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          Next release
        </p>
        <p className="text-sm text-ink">
          &ldquo;{context.nextRelease.title}&rdquo;{" "}
          <span className="text-ink-muted">— {context.nextRelease.type}</span>
        </p>
        <p className="font-mono text-xs text-ink-muted">
          {context.nextRelease.date}
        </p>
      </div>

      <div
        className="hidden h-10 w-px bg-border sm:block"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          Next confirmed show
        </p>
        <p className="text-sm text-ink">
          {context.nextShow.venue}{" "}
          <span className="text-ink-muted">— {context.nextShow.city}</span>
        </p>
        <p className="font-mono text-xs text-ink-muted">
          {context.nextShow.date}
        </p>
      </div>
    </div>
  );
}
