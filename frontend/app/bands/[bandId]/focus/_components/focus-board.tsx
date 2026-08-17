"use client";

import { useEffect, useState } from "react";
import type { LaterTask, Task } from "@/shared/data/mock";
import { Disclosure } from "@/shared/ui/disclosure";
import { IconPlus } from "@/shared/ui/icons";
import { TaskRow, type TaskStatus } from "@/shared/ui/task-row";

type WeekItem = Task & { done: boolean };

const WEEK_CAP = 5;

function displayStatus(item: WeekItem): TaskStatus {
  return item.done ? "done" : item.status;
}

export function FocusBoard({
  initialWeekTasks,
  initialLaterTasks,
}: {
  initialWeekTasks: Task[];
  initialLaterTasks: LaterTask[];
}) {
  const [weekTasks, setWeekTasks] = useState<WeekItem[]>(() =>
    initialWeekTasks.map((task) => ({ ...task, done: false })),
  );
  const [laterTasks, setLaterTasks] = useState<LaterTask[]>(initialLaterTasks);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function toggleTask(id: string) {
    setWeekTasks((tasks) =>
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    if (weekTasks.length >= WEEK_CAP) {
      setLaterTasks((tasks) => [
        { id: `added-${Date.now()}`, title, module: "Added by you" },
        ...tasks,
      ]);
      setNotice("This week's already full — added to Later instead.");
    } else {
      setWeekTasks((tasks) => [
        ...tasks,
        {
          id: `added-${Date.now()}`,
          title,
          module: "Added by you",
          dueLabel: "This week",
          status: "upcoming",
          done: false,
        },
      ]);
      setNotice(null);
    }
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-1 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-display-md text-ink">
            This Week
          </h2>
          <span className="font-mono text-xs text-ink-muted">
            {weekTasks.length} of {WEEK_CAP}
          </span>
        </div>
        <p className="mb-4 text-sm text-ink-muted">
          Ranked, not sorted by module — what actually needs you first.
        </p>

        <div className="rounded-2xl border border-border bg-surface">
          {weekTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
              <p className="text-sm text-ink">Nothing needs you this week.</p>
              <p className="text-sm text-ink-muted">
                Add something below if it comes up.
              </p>
            </div>
          ) : (
            <ul className="px-5">
              {weekTasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  index={index + 1}
                  title={task.title}
                  module={task.module}
                  dueLabel={task.dueLabel}
                  status={displayStatus(task)}
                  onToggle={() => toggleTask(task.id)}
                />
              ))}
            </ul>
          )}

          <form
            onSubmit={handleAdd}
            className="flex items-center gap-3 border-t border-border px-5 py-3"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-ink-faint">
              <IconPlus className="size-3.5" />
            </span>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add something to this week…"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint"
            />
            <button
              type="submit"
              className="shrink-0 text-sm font-medium text-accent transition-colors hover:text-accent-strong disabled:cursor-not-allowed disabled:text-ink-faint"
              disabled={!draft.trim()}
            >
              Add
            </button>
          </form>
        </div>
        {notice ? (
          <p className="mt-2 animate-[rise-in_0.2s_ease-out] text-xs text-ink-muted">
            {notice}
          </p>
        ) : null}
      </section>

      <section>
        <Disclosure label="Later" count={laterTasks.length}>
          <ul className="rounded-2xl border border-border bg-surface px-5">
            {laterTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-b-0"
              >
                <span className="truncate text-ink-muted">{task.title}</span>
                <span className="shrink-0 text-xs text-ink-faint">
                  {task.module}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-muted">
            Sitting here on purpose — nothing to do with these yet.
          </p>
        </Disclosure>
      </section>
    </div>
  );
}
