import type { Metadata } from "next";
import {
  bandContext,
  bands,
  laterTasks,
  thisWeekTasks,
} from "@/shared/data/mock";
import { ContextStrip } from "./_components/context-strip";
import { FocusBoard } from "./_components/focus-board";

export const metadata: Metadata = {
  title: "Focus",
};

export default async function FocusPage({
  params,
}: {
  params: Promise<{ bandId: string }>;
}) {
  const { bandId } = await params;
  const band = bands.find((candidate) => candidate.id === bandId) ?? bands[0];
  const overdueCount = thisWeekTasks.filter(
    (task) => task.status === "overdue",
  ).length;

  return (
    <div className="mx-auto max-w-[760px] px-8 py-12">
      <header className="mb-9">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Aug 17 – 23
        </p>
        <h1 className="font-display text-display-2xl italic tracking-tight text-ink">
          {band.name}
        </h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted">
          {overdueCount > 0
            ? "One thing's overdue, four more are due before Friday — nothing else needs you this week."
            : "Everything's on track this week. Nothing else needs you yet."}
        </p>
      </header>

      <div className="mb-10">
        <ContextStrip context={bandContext} />
      </div>

      <FocusBoard
        initialWeekTasks={thisWeekTasks}
        initialLaterTasks={laterTasks}
      />
    </div>
  );
}
