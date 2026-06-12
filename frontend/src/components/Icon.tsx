// Icon.tsx — ícones stroke (port fiel do ICON_PATHS de components.jsx).
// Os paths SVG são copiados 1:1 do protótipo. Renderizamos com os primitivos
// (Svg/Path/Circle/Rect/Line) em vez de SvgXml: o build web do react-native-svg
// 15.2.0 não exporta SvgXml, o que derrubava o app no navegador (tela branca).

import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export const ICON_PATHS: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  outlet: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="10" r="1.3"/><circle cx="15" cy="10" r="1.3"/><path d="M9 15h6"/>',
  panel: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 6v12M11 6v12M15 6v12"/>',
  switch: '<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>',
  vlan: '<path d="M12 3v6M5.5 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18.5 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 9c0 3-6.5 3-6.5 6M12 9c0 3 6.5 3 6.5 6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h.01M13 7h.01M9 11h.01M13 11h.01M9 15h6v6"/>',
  desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  notebook: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/>',
  phone: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 18h4"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="1.5"/><path d="M8 17h8v4H8z"/>',
  ap: '<path d="M5 12a7 7 0 0 1 14 0"/><path d="M8.5 12a3.5 3.5 0 0 1 7 0"/><circle cx="12" cy="12" r="1"/>',
  camera: '<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M8 7l1.5-2h5L16 7"/>',
  dash: '<rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><rect x="3" y="17" width="8" height="4" rx="1.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  pulse: '<path d="M3 12h4l2 6 4-14 2 8h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
  style?: StyleProp<ViewStyle>;
}

const TAGS = { path: Path, circle: Circle, rect: Rect, line: Line } as const;

// Converte a string interna do ICON_PATHS (ex.: '<circle cx="11" .../><path .../>')
// nos componentes primitivos do react-native-svg, plataforma-agnóstico.
function parseInner(inner: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tagRe = /<(path|circle|rect|line)\b([^>]*?)\/?>/g;
  const attrRe = /([a-zA-Z0-9-]+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = tagRe.exec(inner))) {
    const Comp = TAGS[m[1] as keyof typeof TAGS];
    const props: Record<string, string> = {};
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(m[2]))) props[a[1]] = a[2];
    nodes.push(<Comp key={key++} {...props} />);
  }
  return nodes;
}

export function Icon({ name, size = 22, color = '#000', stroke = 2, style }: IconProps) {
  const inner = ICON_PATHS[name] || '';
  const svg = (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {parseInner(inner)}
    </Svg>
  );
  return style ? <View style={style}>{svg}</View> : svg;
}
