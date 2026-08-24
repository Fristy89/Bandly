import { Suspense } from "react";
import { Card } from "@/shared/ui/card";
import { OAuthCallbackContent } from "./_components/oauth-callback-content";

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Card className="p-8 text-center">
          <p className="text-sm text-ink-muted">Finishing sign-in…</p>
        </Card>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
