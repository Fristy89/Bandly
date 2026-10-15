import { Suspense } from "react";
import { AuthPanel } from "@/shared/ui/auth-panel";
import { OAuthCallbackContent } from "./_components/oauth-callback-content";

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthPanel className="text-center">
          <p className="text-sm text-ink-muted">Finishing sign-in…</p>
        </AuthPanel>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
