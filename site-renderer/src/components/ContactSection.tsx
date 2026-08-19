import type { ArtistInfo } from "@/lib/types";

/**
 * The reference site's Contact.tsx posts to /api/contact (Nodemailer, SMTP
 * env vars). No email-sending infrastructure exists yet in Bandly, so
 * rather than ship a form that silently goes nowhere, this points bookings
 * to Instagram — a real, working next step (Nodemailer/SMTP) once needed.
 */
export function ContactSection({ artist }: { artist: ArtistInfo }) {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="font-display text-3xl italic text-ink">Get in touch</h2>
      <p className="mx-auto mt-4 max-w-md text-ink-muted">
        For bookings and press, the fastest way to reach {artist.name || "the artist"} is a message on Instagram.
      </p>
      {artist.instagramUrl ? (
        <a
          href={artist.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent-strong"
        >
          Message on Instagram
        </a>
      ) : null}
    </section>
  );
}
