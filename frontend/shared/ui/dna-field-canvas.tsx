"use client";

import { useEffect, useRef } from "react";
import { CTA_ENERGY_EVENT } from "@/shared/lib/cta-energy";
import { DNA_PALETTE_EVENT } from "@/shared/lib/platform";

/** "#6d28d9" -> "109, 40, 217", or null if it isn't a 6-digit hex. */
function hexToRgbTriplet(hex: string): string | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [m[1], m[2], m[3]].map((h) => parseInt(h, 16)).join(", ");
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  hue: "accent" | "gold" | "ink";
  twinklePhase: number;
};

// Default DNA-strand colors — Deep Violet + Fresh Teal from the "Identity
// in Color" palette (the same pair ArtistDnaService falls back to), not the
// app's chrome blue/gold. Overridden at runtime by DNA_PALETTE_EVENT once
// Bandly's own platform DNA has a generated palette (PlatformEcho on the
// login screen dispatches it). Key names stay "accent"/"gold" to avoid churn.
const DEFAULT_ACCENT = "109, 40, 217"; // #6d28d9 — rgb triplets, so template strings can set alpha per-draw
const DEFAULT_GOLD = "20, 184, 166"; // #14b8a6
const INK = "237, 228, 255"; // #ede4ff — lavender dust for the rare neutral particle
const GRID = "167, 139, 250"; // #a78bfa — faint violet, for the rungs and the software grid

const PARTICLE_COUNT = 110;
const POINTER_RADIUS = 190; // px within which the cursor bends the dust

/**
 * The "Galactic Strand" — a generative cosmic field for the login screen:
 * a deep-space expanse with a double-helix of glowing particle streams, a
 * faint "generative software" grid, and celestial dust. It reacts: the
 * dust bends and brightens around the pointer, and the whole field surges
 * while the auth CTA is hovered/focused (CTA_ENERGY_EVENT). Cheap enough
 * to hold 60fps on a plain 2D canvas, and still cheap to recolor per band
 * from their own DNA palette later.
 *
 * Deliberately dim and never centered: the calm zone (see
 * distanceFromCalmZone) is where the auth panel sits, and the point is
 * that it stays readable. prefers-reduced-motion gets one still frame with
 * no pointer reactivity at all.
 */
export function DnaFieldCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let animationFrame = 0;
    let paused = document.hidden;

    // Pointer influence decays to 0 when the mouse stops moving, so a
    // still cursor doesn't hold a permanent dent in the field.
    const pointer = { x: -9999, y: -9999, influence: 0 };
    // Surge eases toward its target (1 while the CTA is hovered/focused,
    // 0 otherwise) so the field swells and settles rather than snapping.
    let surge = 0;
    let surgeTarget = 0;

    // Swapped when the platform DNA palette arrives (DNA_PALETTE_EVENT).
    let accentRgb = DEFAULT_ACCENT;
    let goldRgb = DEFAULT_GOLD;

    // Pre-render particle textures to offscreen canvases to avoid expensive
    // radial gradient creation on every frame — vital for 60fps on high-DPR
    // screens where filling 100+ gradients per frame would peg the GPU.
    const particleTextures: Record<Particle["hue"], HTMLCanvasElement | null> = {
      accent: null,
      gold: null,
      ink: null,
    };

    function createParticleTexture(hue: Particle["hue"]) {
      const size = 32;
      const canvas = document.createElement("canvas");
      canvas.width = size * 2; // Extra room for the soft falloff
      canvas.height = size * 2;
      const tctx = canvas.getContext("2d");
      if (!tctx) return null;

      const grad = tctx.createRadialGradient(size, size, 0, size, size, size);
      grad.addColorStop(0, `rgba(${colorFor(hue)}, 1)`);
      grad.addColorStop(1, `rgba(${colorFor(hue)}, 0)`);
      tctx.fillStyle = grad;
      tctx.fillRect(0, 0, size * 2, size * 2);
      return canvas;
    }

    function initTextures() {
      particleTextures.accent = createParticleTexture("accent");
      particleTextures.gold = createParticleTexture("gold");
      particleTextures.ink = createParticleTexture("ink");
    }

    function resize() {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const vx = (Math.random() - 0.5) * 0.12;
        const vy = (Math.random() - 0.5) * 0.12;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          radius: 0.6 + Math.random() * 1.8,
          hue: Math.random() < 0.45 ? "accent" : Math.random() < 0.8 ? "gold" : "ink",
          twinklePhase: Math.random() * Math.PI * 2,
        };
      });
    }

    function colorFor(hue: Particle["hue"]) {
      return hue === "accent" ? accentRgb : hue === "gold" ? goldRgb : INK;
    }

    /** Deep-space wash — a radial from indigo near the strand out to almost
     * black at the edges, repainted each frame so it also clears. */
    function paintBackground() {
      const g = ctx!.createRadialGradient(
        width * 0.34,
        height * 0.4,
        0,
        width * 0.34,
        height * 0.4,
        Math.max(width, height) * 0.85,
      );
      g.addColorStop(0, "#151027");
      g.addColorStop(0.55, "#0c0a16");
      g.addColorStop(1, "#07060d");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, width, height);
    }

    /** Faint geometric grid — the "generative software" texture. Drifts
     * very slowly so it reads as alive, brightens a touch on surge. */
    function drawGrid(time: number) {
      const spacing = 88;
      const drift = (time * 0.004) % spacing;
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = `rgba(${GRID}, ${0.022 + surge * 0.02})`;
      ctx!.beginPath();
      for (let x = -spacing + drift; x <= width + spacing; x += spacing) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
      }
      for (let y = -spacing + drift; y <= height + spacing; y += spacing) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
      }
      ctx!.stroke();
    }

    /** Two intertwining strands, phase-shifted from each other — the DNA
     * structure the brief asked for, not literal geometry, just the idea
     * of two related lines weaving around a shared axis. Glow and weight
     * scale with surge. */
    function drawStrands(time: number) {
      const axisX = width * 0.32;
      const amplitude = Math.min(120, width * 0.09) * (0.85 + 0.15 * Math.sin(time * 0.00012));
      const wavelength = height / 2.4;

      ctx!.shadowBlur = 8 + surge * 26;

      [0, Math.PI].forEach((phaseOffset, i) => {
        const rgb = colorFor(i === 0 ? "accent" : "gold");
        ctx!.beginPath();
        for (let y = -40; y <= height + 40; y += 8) {
          const t = (y / wavelength) * Math.PI * 2 + time * 0.00018 + phaseOffset;
          const x = axisX + Math.sin(t) * amplitude;
          if (y === -40) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(${rgb}, ${0.16 + surge * 0.24})`;
        ctx!.shadowColor = `rgba(${rgb}, ${0.5})`;
        ctx!.lineWidth = 1.4 + surge * 1.2;
        ctx!.stroke();
      });

      ctx!.shadowBlur = 0;

      // Faint rungs between the two strands, like a real double helix —
      // sparse, so they read as texture, not a grid.
      for (let y = -40; y <= height + 40; y += 46) {
        const t1 = (y / wavelength) * Math.PI * 2 + time * 0.00018;
        const t2 = t1 + Math.PI;
        const x1 = axisX + Math.sin(t1) * amplitude;
        const x2 = axisX + Math.sin(t2) * amplitude;
        ctx!.beginPath();
        ctx!.moveTo(x1, y);
        ctx!.lineTo(x2, y);
        ctx!.strokeStyle = `rgba(${GRID}, ${0.06 + surge * 0.08})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }

    function drawParticles(time: number) {
      const pointerActive = !reduceMotion && pointer.influence > 0.02;
      for (const p of particles) {
        if (pointerActive) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < POINTER_RADIUS) {
            // Gentle push outward from the cursor, strongest up close.
            const f = ((POINTER_RADIUS - dist) / POINTER_RADIUS) * pointer.influence;
            p.vx += (dx / dist) * f * 0.18;
            p.vy += (dy / dist) * f * 0.18;
          }
        }
        // Spring back toward the particle's lazy base drift so a swept
        // cursor stirs the field without permanently scattering it.
        p.vx += (p.baseVx - p.vx) * 0.02;
        p.vy += (p.baseVy - p.vy) * 0.02;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.0009 + p.twinklePhase);
        const calmDistance = distanceFromCalmZone(p.x, p.y);
        let opacity = (0.15 + twinkle * 0.35 * calmDistance) * (1 + surge * 0.5);

        if (pointerActive) {
          const near = Math.max(0, 1 - Math.hypot(p.x - pointer.x, p.y - pointer.y) / POINTER_RADIUS);
          opacity += near * pointer.influence * 0.5;
        }

        const texture = particleTextures[p.hue];
        if (texture) {
          const drawSize = p.radius * 12; // Radius * 6 * 2 (diameter)
          ctx!.globalAlpha = Math.min(1, opacity);
          ctx!.drawImage(texture, p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize);
        }
      }
      ctx!.globalAlpha = 1.0;
    }

    /** Soft violet bloom trailing the cursor — the "this universe is alive"
     * tell. Skipped entirely under reduced motion. */
    function drawPointerGlow() {
      if (reduceMotion || pointer.influence <= 0.02) return;
      const r = 210;
      const g = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, r);
      g.addColorStop(0, `rgba(${accentRgb}, ${0.1 * pointer.influence})`);
      g.addColorStop(1, `rgba(${accentRgb}, 0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(pointer.x - r, pointer.y - r, r * 2, r * 2);
    }

    /** 0 near the auth panel (calm), 1 far from it — the "keep the center
     * readable" requirement, as a soft falloff rather than a hard mask. */
    function distanceFromCalmZone(x: number, y: number) {
      const calmX = width * 0.72;
      const calmY = height * 0.5;
      const calmRadius = Math.max(width, height) * 0.42;
      const d = Math.hypot(x - calmX, y - calmY) / calmRadius;
      return Math.min(1, Math.max(0.25, d));
    }

    function frame(time: number) {
      if (paused) {
        animationFrame = requestAnimationFrame(frame);
        return;
      }
      pointer.influence *= 0.94; // decay when the cursor stops moving
      surge += (surgeTarget - surge) * 0.08;

      paintBackground();
      drawGrid(time);
      drawStrands(time);
      drawParticles(time);
      drawPointerGlow();
      animationFrame = requestAnimationFrame(frame);
    }

    function handleVisibility() {
      paused = document.hidden;
    }

    function handleResize() {
      resize();
      seedParticles();
    }

    function handlePointerMove(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.influence = 1;
    }

    function handlePointerLeave() {
      pointer.influence = 0;
    }

    function handleCtaEnergy(event: Event) {
      surgeTarget = (event as CustomEvent<boolean>).detail ? 1 : 0;
    }

    function handleDnaPalette(event: Event) {
      const detail = (event as CustomEvent<{ primary: string; secondary: string } | null>).detail;
      accentRgb = (detail && hexToRgbTriplet(detail.primary)) || DEFAULT_ACCENT;
      goldRgb = (detail && hexToRgbTriplet(detail.secondary)) || DEFAULT_GOLD;
      initTextures(); // particle glow textures are baked from these colors
      if (reduceMotion) {
        paintBackground();
        drawGrid(0);
        drawStrands(0);
        drawParticles(0);
      }
    }

    resize();
    initTextures();
    seedParticles();
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(CTA_ENERGY_EVENT, handleCtaEnergy);
    window.addEventListener(DNA_PALETTE_EVENT, handleDnaPalette);
    if (!reduceMotion) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.addEventListener("pointerleave", handlePointerLeave);
    }

    if (reduceMotion) {
      // One still frame — the field exists, nothing moves.
      paintBackground();
      drawGrid(0);
      drawStrands(0);
      drawParticles(0);
    } else {
      animationFrame = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(CTA_ENERGY_EVENT, handleCtaEnergy);
      window.removeEventListener(DNA_PALETTE_EVENT, handleDnaPalette);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
