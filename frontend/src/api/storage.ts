// api/storage.ts — persistência dos tokens JWT em AsyncStorage.
//
// Mantido fora do store Zustand de propósito: o client de API (camada de baixo
// nível) precisa ler/escrever o token sem depender do React/store, evitando
// ciclo de import (store → api → store).

import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'patchmap.auth.access';
const REFRESH_KEY = 'patchmap.auth.refresh';

export interface Tokens {
  access: string;
  refresh: string;
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_KEY, tokens.access],
    [REFRESH_KEY, tokens.refresh],
  ]);
}

export async function loadTokens(): Promise<Tokens | null> {
  const [[, access], [, refresh]] = await AsyncStorage.multiGet([
    ACCESS_KEY,
    REFRESH_KEY,
  ]);
  if (!access || !refresh) return null;
  return { access, refresh };
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}
