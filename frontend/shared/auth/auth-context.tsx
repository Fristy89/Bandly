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

  const applySession = useCallback((session: AuthResponse) => {
    setUser({ id: session.userId, email: session.email });
    setAccessToken(session.accessToken);
    setStatus("authenticated");
    return session;
  }, []);

  useEffect(() => {
    apiFetch<AuthResponse>("/api/v1/auth/refresh", { method: "POST" })
      .then(applySession)
      .catch(() => setStatus("anonymous"));
  }, [applySession]);

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
