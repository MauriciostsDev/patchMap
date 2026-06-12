// api/config.ts — resolve a URL base do backend conforme a plataforma.
//
// No emulador Android, o host da máquina de desenvolvimento NÃO é localhost:
// o AVD enxerga o host em 10.0.2.2. Em web/iOS-sim, localhost resolve direto.
// Permite override por app.json → expo.extra.apiUrl (ou EXPO_PUBLIC_API_URL).

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEV_PORT = 8000;

function resolveBaseUrl(): string {
  // 1) Override explícito (build/produção): expo.extra.apiUrl
  const fromExtra =
    (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL;
  if (fromExtra) return fromExtra.replace(/\/+$/, '');

  // 2) Dev: deriva o host conforme a plataforma.
  if (Platform.OS === 'android') return `http://10.0.2.2:${DEV_PORT}`;
  return `http://localhost:${DEV_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
