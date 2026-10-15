import { Anton, Caveat, Playfair_Display } from "next/font/google";
import { cn } from "@/shared/lib/cn";

// Three of the same curated fonts LogoService picks from on the backend
// (sites/domain/SiteContentData.kt) — not a coincidence, this panel exists
// to show what that feature actually produces. Caveat/coastal-grey is the
// real result from an actual generation run earlier in development, not a
// mockup; the other two are invented to show range across mood.
const caveat = Caveat({ subsets: ["latin"], weight: "400" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: "400", style: "italic" });
const anton = Anton({ subsets: ["latin"], weight: "400" });

const EXAMPLES = [
  // Marlow Bend's font + color are the real output of an actual generation
  // run — left as-is. The other two are invented to show range, so they
  // ride the Artist DNA palette (violet, electric coral) here.
  { name: "Marlow Bend", font: caveat.className, color: "#8FA3AC", mood: "warm, coastal indie folk" },
  { name: "Aurelia Sky", font: playfair.className, color: "#8B6FD9", mood: "elegant, orchestral pop" },
  { name: "IRON VEIL", font: anton.className, color: "#FF5C5C", mood: "heavy, aggressive metal" },
];

/**
 * Demonstrates the DNA -> signature pipeline (LogoService on the backend)
 * on Bandly's own login screen — this is proof, not a mockup: Marlow Bend's
 * font and color are the actual output of a real generation run, reasoned
 * from a real Identity Profile, not hand-picked for this component.
 */
export function DnaSignatureShowcase({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      {EXAMPLES.map((example) => (
        <div key={example.name} className="flex items-baseline gap-3">
          <span
            className={cn(example.font, "text-2xl leading-none")}
            style={{ color: example.color }}
          >
            {example.name}
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {example.mood}
          </span>
        </div>
      ))}
    </div>
  );
}
