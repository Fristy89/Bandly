"use client";

import { motion } from "framer-motion";
import { SignatureMark } from "./SignatureMark";
import type { LogoMark } from "@/lib/types";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "music", label: "Music" },
  { id: "shows", label: "Shows" },
  { id: "bio", label: "Bio" },
  { id: "contact", label: "Contact" },
];

export function Navbar({ artistName, logoMark }: { artistName: string; logoMark: LogoMark | null }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-paper/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="#home">
          <SignatureMark name={artistName} logoMark={logoMark} className="text-lg" />
        </a>
        <div className="hidden gap-8 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted sm:flex">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="transition-colors hover:text-accent-strong">
              {section.label}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
