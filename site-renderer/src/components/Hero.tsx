"use client";

import { motion } from "framer-motion";
import type { ArtistInfo, SiteImages } from "@/lib/types";

/**
 * The reference site's Hero doubles as the live-stage player entry point
 * (WebRTC "GO LIVE" viewer/admin wiring) — deliberately not ported here,
 * per the brief this module came out of ("without the live feature"). This
 * is the hero on its own: name, tagline, a way into the music.
 */
export function Hero({ artist, images }: { artist: ArtistInfo; images: SiteImages }) {
  return (
    <section
      id="home"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 pt-16"
    >
      {images.heroBackground ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${images.heroBackground})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-paper/60 to-paper" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-5xl italic text-ink sm:text-7xl"
        >
          {artist.name || "Your artist name"}
        </motion.h1>
        {artist.tagline ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="mt-5 text-lg text-ink-muted"
          >
            {artist.tagline}
          </motion.p>
        ) : null}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10"
        >
          <a
            href="#music"
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent-strong"
          >
            Listen now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
