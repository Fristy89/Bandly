import "server-only";
import type { PublicSiteResponse } from "./types";

const API_BASE = process.env.BANDLY_API_URL ?? "http://localhost:8080";

/**
 * Resolves the site to render for an incoming request's Host header. On a
 * real deployment, `domain` is a real (sub)domain and this is the whole
 * story. Locally there's no wildcard DNS for *.bandly.site, so a
 * `?site=<subdomain>` override is supported when the host is localhost —
 * dev-only, never consulted otherwise.
 */
export async function resolveSite(host: string, siteOverride?: string): Promise<PublicSiteResponse | null> {
  const isLocalHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const domain = isLocalHost && siteOverride ? siteOverride : host;

  const response = await fetch(`${API_BASE}/api/v1/public/sites/by-domain?domain=${encodeURIComponent(domain)}`, {
    // Site content changes when the band edits it in Bandly's admin UI —
    // this is a public marketing site, not a live app, so a short cache is
    // the right default rather than no-store on every visitor request.
    next: { revalidate: 30 },
  });

  if (!response.ok) return null;
  return (await response.json()) as PublicSiteResponse;
}
