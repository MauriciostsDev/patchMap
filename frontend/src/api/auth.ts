// api/auth.ts — login/logout e sessão atual.

import { request } from './client';
import { saveTokens, clearTokens, loadTokens } from './storage';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface LoginResponse {
  token: string;
  refresh: string;
  user: AuthUser;
}

// POST /auth/login → grava tokens e devolve o usuário.
export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  await saveTokens({ access: data.token, refresh: data.refresh });
  return data.user;
}

export async function logout(): Promise<void> {
  await clearTokens();
}

// Há sessão persistida? (usado no boot para pular a tela de login).
export async function hasSession(): Promise<boolean> {
  return (await loadTokens()) !== null;
}
