export default function FocusLoading() {
  return (
    <div className="mx-auto max-w-[760px] px-8 py-12">
      <div className="mb-9 animate-pulse">
        <div className="mb-3 h-3 w-24 rounded bg-border" />
        <div className="h-11 w-64 rounded bg-border" />
        <div className="mt-4 h-4 w-96 max-w-full rounded bg-border" />
      </div>

      <div className="mb-10 h-[92px] animate-pulse rounded-2xl border border-border bg-surface" />

      <div className="animate-pulse rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 h-6 w-28 rounded bg-border" />
        {[0, 1, 2, 3, 4].map((row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b border-border py-3.5 last:border-b-0"
          >
            <div className="size-8 shrink-0 rounded-full bg-border" />
            <div className="h-3 flex-1 rounded bg-border" />
            <div className="h-3 w-16 shrink-0 rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
