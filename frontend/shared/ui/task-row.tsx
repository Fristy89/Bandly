import { cn } from "@/shared/lib/cn";
import { IconCheck } from "./icons";

export type TaskStatus = "overdue" | "soon" | "upcoming" | "done";

export type TaskRowProps = {
  index: number;
  title: string;
  module: string;
  dueLabel: string;
  status: TaskStatus;
  onToggle?: () => void;
};

const statusDot: Record<TaskStatus, string> = {
  overdue: "bg-attention",
  soon: "bg-accent",
  upcoming: "bg-ink-faint",
  done: "bg-good",
};

const statusText: Record<TaskStatus, string> = {
  overdue: "text-attention",
  soon: "text-ink",
  upcoming: "text-ink-muted",
  done: "text-good",
};

export function TaskRow({
  index,
  title,
  module,
  dueLabel,
  status,
  onToggle,
}: TaskRowProps) {
  const done = status === "done";

  return (
    <li className="group flex flex-wrap items-start gap-x-4 gap-y-1.5 border-b border-border py-3.5 transition-colors last:border-b-0 hover:bg-surface-raised sm:flex-nowrap sm:items-center">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Mark "${title}" not done` : `Mark "${title}" done`}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          done
            ? "border-good/40 bg-good-soft text-good"
            : "border-border text-ink-faint group-hover:border-accent/60 group-hover:text-accent/80 hover:border-accent hover:text-accent",
        )}
      >
        {done ? (
          <IconCheck className="size-3.5" strokeWidth={2} />
        ) : (
          String(index).padStart(2, "0")
        )}
      </button>

      <div className="min-w-0 flex-1 basis-52">
        <p
          className={cn(
            "text-[15px] leading-snug",
            done ? "text-ink-faint line-through" : "text-ink",
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">{module}</p>
      </div>

      <div className="ml-12 flex shrink-0 items-center gap-1.5 font-mono text-xs sm:ml-0">
        <span
          className={cn("size-1.5 rounded-full", statusDot[status])}
          aria-hidden="true"
        />
        <span className={statusText[status]}>{done ? "Done" : dueLabel}</span>
      </div>
    </li>
  );
}
