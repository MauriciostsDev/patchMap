// fonts.ts — mapeia peso → família carregada (RN não combina fontWeight + fontFamily).
// Plus Jakarta Sans no corpo/títulos · IBM Plex Mono em IDs/portas/VLANs/valores técnicos.

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';

export const fontAssets = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
};

type Weight = number | string | undefined;

function norm(w: Weight): number {
  if (w == null) return 400;
  const n = typeof w === 'string' ? parseInt(w, 10) : w;
  return isNaN(n) ? 400 : n;
}

// Família Plus Jakarta Sans para um dado peso (corpo / títulos).
export function sans(weight?: Weight): string {
  const w = norm(weight);
  if (w >= 800) return 'PlusJakartaSans_800ExtraBold';
  if (w >= 700) return 'PlusJakartaSans_700Bold';
  if (w >= 600) return 'PlusJakartaSans_600SemiBold';
  if (w >= 500) return 'PlusJakartaSans_500Medium';
  return 'PlusJakartaSans_400Regular';
}

// Família IBM Plex Mono para IDs, portas, VLANs e valores técnicos.
export function mono(weight?: Weight): string {
  const w = norm(weight);
  if (w >= 700) return 'IBMPlexMono_700Bold';
  if (w >= 600) return 'IBMPlexMono_600SemiBold';
  if (w >= 500) return 'IBMPlexMono_500Medium';
  return 'IBMPlexMono_400Regular';
}
