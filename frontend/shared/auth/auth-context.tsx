"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/shared/api/client";
import type { AuthResponse } from "@/shared/api/types";

type AuthUser = { id: string; email: string };
type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  loginWithOAuthCode: (code: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Wraps the whole app (see app/layout.tsx). Holds the access token in
 * memory only, never localStorage (blueprint §10/§15) — persistence
 * across a page reload comes from silently calling /auth/refresh on
 * mount, which works off the httpOnly refresh cookie the backend already
 * sets on login/register, not from anything readable by JS.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  // An absolute timestamp, not a delay — moving this forward is what tells
  // the effect below to (re)schedule a fresh timer, so every applySession
  // call cleanly replaces any refresh still pending from the last one.
  const [refreshAt, setRefreshAt] = useState<number | null>(null);

  const applySession = useCallback((session: AuthResponse) => {
    setUser({ id: session.userId, email: session.email });
    setAccessToken(session.accessToken);
    setStatus("authenticated");
    setRefreshAt(Date.now() + Math.max((session.accessTokenExpiresInSeconds - 60) * 1000, 5000));
    return session;
  }, []);

  useEffect(() => {
    apiFetch<AuthResponse>("/api/v1/auth/refresh", { method: "POST" })
      .then(applySession)
      .catch(() => setStatus("anonymous"));
  }, [applySession]);

  // The access token expires in 15 minutes (JwtProperties) — without this,
  // apiFetch has no retry-on-401 logic anywhere, so any tab left open past
  // that point starts failing every request with a bare "Request failed
  // (401)" until the artist manually reloads the page. Refreshing a minute
  // ahead of the real expiry (applySession moves refreshAt forward, which
  // re-triggers this effect) means that 401 should never happen in normal
  // use — the actual timer/network side effect lives here, not inside
  // applySession itself, since applySession is just state-setting.
  useEffect(() => {
    if (refreshAt === null) return;
    const timer = setTimeout(() => {
      apiFetch<AuthResponse>("/api/v1/auth/refresh", { method: "POST" })
        .then(applySession)
        .catch(() => {
          setUser(null);
          setAccessToken(null);
          setStatus("anonymous");
        });
    }, Math.max(refreshAt - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [refreshAt, applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await apiFetch<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return applySession(session);
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const session = await apiFetch<AuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return applySession(session);
    },
    [applySession],
  );

  /** Redeems the one-time code /oauth-callback got redirected here with
   * after a Google sign-in (see OAuth2LoginSuccessHandler on the backend) —
   * the real session was never in that URL, just this single-use code. */
  const loginWithOAuthCode = useCallback(
    async (code: string) => {
      const session = await apiFetch<AuthResponse>("/api/v1/auth/oauth/exchange", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      return applySession(session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    setRefreshAt(null); // cancels the pending refresh via the effect's own cleanup
    await apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {
      // Best-effort — even if this fails, forget the local session below.
    });
    setUser(null);
    setAccessToken(null);
    setStatus("anonymous");
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, status, login, register, loginWithOAuthCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
