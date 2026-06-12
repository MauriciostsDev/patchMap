// api/client.ts — wrapper de fetch com JWT, refresh automático e erros tipados.
//
// Fluxo:
//   request() injeta o access token no header Authorization.
//   Se a resposta for 401 e houver refresh token, tenta POST /auth/refresh uma
//   única vez, re-grava o access e refaz a requisição original. Se o refresh
//   falhar, dispara onUnauthorized() (logout) e propaga ApiError.

import { API_BASE_URL } from './config';
import { loadTokens, saveTokens, clearTokens } from './storage';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Callback de logout, injetado pela camada de auth para quebrar o ciclo de import.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // injeta Authorization (default true)
  signal?: AbortSignal;
}

async function rawFetch(
  path: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth !== false && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
}

async function tryRefresh(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string };
    if (!data.access) return null;
    await saveTokens({ access: data.access, refresh });
    return data.access;
  } catch {
    return null;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === 'string') return d.detail;
    // erros de validação do DRF: { campo: ["msg"] }
    const first = Object.values(d)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
  }
  return `Erro ${status}`;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const tokens = await loadTokens();
  let access = tokens?.access ?? null;

  let res = await rawFetch(path, options, access);

  // Refresh transparente no 401 (apenas em chamadas autenticadas).
  if (res.status === 401 && options.auth !== false && tokens?.refresh) {
    const newAccess = await tryRefresh(tokens.refresh);
    if (newAccess) {
      access = newAccess;
      res = await rawFetch(path, options, access);
    } else {
      await clearTokens();
      onUnauthorized?.();
    }
  }

  const data = await parseBody(res);
  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.();
    throw new ApiError(res.status, errorMessage(data, res.status), data);
  }
  return data as T;
}
