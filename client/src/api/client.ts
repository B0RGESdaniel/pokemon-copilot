const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3333/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    // Content-Type só faz sentido quando existe corpo — mandar em requests
    // sem body (ex: POST /battle pra iniciar) faz o Fastify rejeitar com
    // "Body cannot be empty when content-type is set to 'application/json'".
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, (body as { error?: string }).error ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
export const put = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined });
export const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const del = (path: string) => request<void>(path, { method: "DELETE" });
