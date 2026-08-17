import { BrandMark } from "@/shared/ui/brand-mark";
import { ButtonLink } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <BrandMark />
      <h1 className="font-display text-display-lg text-ink">Nothing here.</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        That page doesn&rsquo;t exist, or hasn&rsquo;t been built yet.
      </p>
      <ButtonLink href="/login" variant="secondary" size="sm" className="mt-2">
        Back to login
      </ButtonLink>
    </div>
  );
}
