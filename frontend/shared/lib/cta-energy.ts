/**
 * The auth CTA ("Enter your universe") tells the DnaFieldCanvas nebula to
 * surge — strands brighten, the field quickens — while it's hovered or
 * focused. Decoupled through a window event so the button never needs a
 * handle on the canvas, and so it's a no-op anywhere the canvas isn't
 * mounted. See DnaFieldCanvas for the listener.
 */
export const CTA_ENERGY_EVENT = "bandly:cta-energy";

export function signalCtaEnergy(active: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CTA_ENERGY_EVENT, { detail: active }));
}

/** Spread onto the auth submit button so hover/focus (and their exits)
 * both drive the surge, keyboard included. */
export const ctaEnergyHandlers = {
  onMouseEnter: () => signalCtaEnergy(true),
  onMouseLeave: () => signalCtaEnergy(false),
  onFocus: () => signalCtaEnergy(true),
  onBlur: () => signalCtaEnergy(false),
};
