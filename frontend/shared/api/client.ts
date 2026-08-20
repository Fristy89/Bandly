const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ApiFetchOptions = RequestInit & { token?: string | null };

/**
 * Every backend call goes through here. `credentials: "include"` is what
 * lets the browser send/receive the httpOnly bandly_refresh_token cookie
 * across the localhost:3000 -> localhost:8080 boundary (see AuthController
 * on the backend) — without it, silent session refresh on page load can't
 * work. Errors are parsed as RFC 7807 problem+json (blueprint §08) so
 * callers get the backend's actual message, not just a status code.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText || `Request failed (${response.status})`;
    try {
      const problem = await response.json();
      message = problem.detail ?? problem.title ?? message;
    } catch {
      // Body wasn't JSON — keep the status text.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** Same request/auth/error handling as apiFetch, for the one endpoint that
 * returns audio bytes instead of JSON (speech synthesis) — see
 * shared/lib/speech.ts. */
export async function apiFetchBlob(path: string, options: ApiFetchOptions = {}): Promise<Blob> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText || `Request failed (${response.status})`;
    try {
      const problem = await response.json();
      message = problem.detail ?? problem.title ?? message;
    } catch {
      // Body wasn't JSON — keep the status text.
    }
    throw new ApiError(response.status, message);
  }

  return response.blob();
}
