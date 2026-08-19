export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-2xl italic text-ink">No site here</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Either this domain isn&rsquo;t connected to a Bandly site, or the site hasn&rsquo;t been published yet.
      </p>
    </div>
  );
}
