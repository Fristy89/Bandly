export function Footer({ artistName }: { artistName: string }) {
  return (
    <footer className="border-t border-border px-6 py-10 text-center text-xs text-ink-muted">
      <p>
        © {new Date().getFullYear()} {artistName}. Site by{" "}
        <a href="https://bandly.app" className="underline decoration-border underline-offset-4 hover:text-accent-strong">
          Bandly
        </a>
        .
      </p>
    </footer>
  );
}
