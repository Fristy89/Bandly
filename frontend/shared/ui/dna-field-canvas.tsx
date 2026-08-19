"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: "accent" | "gold" | "ink";
  twinklePhase: number;
};

// The two DNA-strand colors — Bandly's own accent + gold, not invented for
// this component. Once a band's own brandPalette exists at login time
// (it doesn't yet — this page renders before any band is known), these are
// exactly the two values a per-artist version would swap in instead.
const ACCENT = "99, 149, 219"; // rgb triplets, so template strings can set alpha per-draw
const GOLD = "224, 145, 63";
const INK = "230, 224, 210";

const PARTICLE_COUNT = 70;

/**
 * A generative, slowly-breathing field standing in for the video background
 * requested for the login screen — real video would mean a fixed asset with
 * no relationship to any specific artist; this is cheap enough to run at
 * 60fps on a plain 2D canvas and, later, cheap to recolor per band from
 * their own DNA palette instead of the fixed accent/gold used here.
 *
 * Deliberately dim and slow, never centered: the calm zone (see
 * calmCenterX/Y below) is where the login card sits, and the whole point is
 * that it stays readable, not competed with.
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
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        radius: 0.6 + Math.random() * 1.8,
        hue: Math.random() < 0.45 ? "accent" : Math.random() < 0.8 ? "gold" : "ink",
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    }

    function colorFor(hue: Particle["hue"]) {
      return hue === "accent" ? ACCENT : hue === "gold" ? GOLD : INK;
    }

    /** Two intertwining strands, phase-shifted from each other — the DNA
     * structure the brief asked for, not literal geometry, just the idea
     * of two related lines weaving around a shared axis. */
    function drawStrands(time: number) {
      const axisX = width * 0.32;
      const amplitude = Math.min(120, width * 0.09) * (0.85 + 0.15 * Math.sin(time * 0.00012));
      const wavelength = height / 2.4;

      [0, Math.PI].forEach((phaseOffset, i) => {
        ctx!.beginPath();
        for (let y = -40; y <= height + 40; y += 8) {
          const t = (y / wavelength) * Math.PI * 2 + time * 0.00018 + phaseOffset;
          const x = axisX + Math.sin(t) * amplitude;
          if (y === -40) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(${colorFor(i === 0 ? "accent" : "gold")}, 0.16)`;
        ctx!.lineWidth = 1.4;
        ctx!.stroke();
      });

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
        ctx!.strokeStyle = "rgba(180, 170, 150, 0.05)";
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }
    }

    function drawParticles(time: number) {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.0009 + p.twinklePhase);
        const calmDistance = distanceFromCalmZone(p.x, p.y);
        const opacity = 0.15 + twinkle * 0.35 * calmDistance;

        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6);
        gradient.addColorStop(0, `rgba(${colorFor(p.hue)}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${colorFor(p.hue)}, 0)`);
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    /** 0 near the login card (calm), 1 far from it — the "keep the center
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
      ctx!.clearRect(0, 0, width, height);
      drawStrands(time);
      drawParticles(time);
      animationFrame = requestAnimationFrame(frame);
    }

    function handleVisibility() {
      paused = document.hidden;
    }

    function handleResize() {
      resize();
      seedParticles();
    }

    resize();
    seedParticles();
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    if (reduceMotion) {
      // One still frame — the field exists, nothing moves.
      drawStrands(0);
      drawParticles(0);
    } else {
      animationFrame = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
