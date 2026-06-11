/* app.jsx — App principal: navegação, tema, login, painéis, tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2563eb",
  "dark": false,
  "font": "Plus Jakarta Sans",
  "density": "regular"
}/*EDITMODE-END*/;

const FONTS = {
  'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, sans-serif",
  'Manrope': "'Manrope', system-ui, sans-serif",
  'Sistema': "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

function buildTheme(t) {
  const accent = t.accent;
  const dark = t.dark;
  const base = dark ? {
    '--bg': '#0f1419', '--surface': '#181f29', '--text': '#e8edf2', '--muted': '#8b97a6',
    '--border': '#283341', '--border-strong': '#3a4757', '--chip': '#212a36',
    '--accent-soft': accent + '30',
  } : {
    '--bg': '#f3f5f8', '--surface': '#ffffff', '--text': '#0f172a', '--muted': '#64748b',
    '--border': '#e7ebf0', '--border-strong': '#cbd5e1', '--chip': '#f1f4f8',
    '--accent-soft': accent + '1c',
  };
  return {
    ...base,
    '--accent': accent,
    '--accent-ink': '#ffffff',
    '--mono': "'IBM Plex Mono', ui-monospace, monospace",
    '--font': FONTS[t.font] || FONTS['Plus Jakarta Sans'],
  };
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, cursor: 'pointer', border: 'none', background: 'transparent',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0',
    }}>
      <div style={{
        width: 56, height: 30, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--accent-soft)' : 'transparent', transition: 'background .15s',
      }}>
        <Icon name={icon} size={22} color={active ? 'var(--accent)' : 'var(--muted)'} stroke={active ? 2.3 : 2} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--muted)' }}>
        {label}
      </span>
    </button>
  );
}

// ── Chaves de localStorage ────────────────────────────────────────────
const KEY_POINTS  = 'rastreador.points.v1';
const KEY_PANELS  = 'rastreador.panels.v1';
const KEY_AUTH    = 'rastreador.auth.v1';

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = buildTheme(t);

  // ── Autenticação ─────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    try { return localStorage.getItem(KEY_AUTH) === 'true'; } catch (e) { return false; }
  });

  // ── Pontos de conexão ────────────────────────────────────────────
  const [points, setPoints] = React.useState(() => {
    try { const s = localStorage.getItem(KEY_POINTS); if (s) return JSON.parse(s); } catch (e) {}
    return window.SEED_POINTS;
  });
  React.useEffect(() => {
    try { localStorage.setItem(KEY_POINTS, JSON.stringify(points)); } catch (e) {}
  }, [points]);

  // ── Patch Panels ─────────────────────────────────────────────────
  const [panels, setPanels] = React.useState(() => {
    try { const s = localStorage.getItem(KEY_PANELS); if (s) return JSON.parse(s); } catch (e) {}
    return window.PATCH_PANELS_DEF;
  });
  React.useEffect(() => {
    try { localStorage.setItem(KEY_PANELS, JSON.stringify(panels)); } catch (e) {}
  }, [panels]);

  // ── Navegação ────────────────────────────────────────────────────
  const [tab, setTab]     = React.useState('pontos');
  const [stack, setStack] = React.useState([]);
  const top = stack[stack.length - 1];

  const push        = (s)  => setStack(st => [...st, s]);
  const pop         = ()   => setStack(st => st.slice(0, -1));
  const openDetail  = (id) => push({ t: 'detail', id });
  const openForm    = (id) => push({ t: 'form', id });
  const openNew     = ()   => push({ t: 'form' });
  const byId        = (id) => points.find(p => p.id === id);

  // ── Adicionar painel ─────────────────────────────────────────────
  function addPanel(def) {
    const maxId = Math.max(0, ...points.map(p => p.id));
    const newPoints = Array.from({ length: def.ports }, (_, i) => ({
      id: maxId + i + 1,
      sector: null,
      patchPanel: def.id,
      patchPort: i + 1,
      sw: def.sw,
      swPort: `Gi1/0/${i + 1}`,
      vlan: null, vlanName: null,
      device: '—', status: 'inativo',
      point: null, obs: '', updatedAt: '2026-06-10',
    }));
    setPanels(prev => [...prev, def]);
    setPoints(prev => [...prev, ...newPoints]);
  }

  // ── CRUD pontos ──────────────────────────────────────────────────
  function savePoint(np) {
    setPoints(prev => {
      const exists = prev.some(p => p.id === np.id);
      return exists ? prev.map(p => p.id === np.id ? np : p) : [...prev, np];
    });
    setStack(st => [...st.slice(0, -1), { t: 'detail', id: np.id }]);
  }
  function changePoint(np) { setPoints(prev => prev.map(p => p.id === np.id ? np : p)); }
  function deletePoint(id) { setPoints(prev => prev.filter(p => p.id !== id)); pop(); }

  const allSectors = React.useMemo(() =>
    [...new Set([...window.SECTORS.map(s => s.name), ...points.map(p => p.sector).filter(Boolean)])],
    [points]
  );

  const isTab = !top;

  // ── Renderização de telas ────────────────────────────────────────
  function renderMain() {
    if (top && top.t === 'detail') {
      const p = byId(top.id);
      if (!p) return null;
      return <DetailScreen p={p} onBack={pop} onEdit={openForm} onChange={changePoint} onDelete={deletePoint} />;
    }
    if (top && top.t === 'form') {
      return (
        <FormScreen
          initial={top.id != null ? byId(top.id) : null}
          sectors={allSectors}
          panels={panels}
          onCancel={pop}
          onSave={savePoint}
        />
      );
    }
    if (tab === 'pontos') return <ListScreen  points={points} density={t.density} onOpen={openDetail} />;
    if (tab === 'vlans')  return <VlanScreen  points={points} density={t.density} onOpen={openDetail} />;
    if (tab === 'painel') return <PanelScreen points={points} panels={panels}     onOpen={openDetail} onAddPanel={addPanel} />;
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: t.dark ? '#070a0e' : '#dfe4ea', padding: 20,
    }}>
      <AndroidDevice bg={theme['--bg']} barFg={theme['--text']} dark={t.dark}>
        <div
          key={t.dark ? 'd' : 'l'}
          style={{
            ...theme, height: '100%', display: 'flex', flexDirection: 'column',
            position: 'relative', background: 'var(--bg)',
            color: 'var(--text)', fontFamily: 'var(--font)',
          }}
        >
          {/* ── Conteúdo principal ───────────────────────────────── */}
          <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {!isLoggedIn
              ? <LoginScreen onLogin={() => {
                  localStorage.setItem(KEY_AUTH, 'true');
                  setIsLoggedIn(true);
                }} />
              : renderMain()
            }
          </div>

          {/* ── FAB ─────────────────────────────────────────────── */}
          {isLoggedIn && isTab && (
            <button onClick={openNew} style={{
              position: 'absolute', right: 16, bottom: 80,
              width: 60, height: 60, borderRadius: 18,
              border: 'none', cursor: 'pointer',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 22px ' + t.accent + '66', zIndex: 8,
            }}>
              <Icon name="plus" size={28} stroke={2.4} />
            </button>
          )}

          {/* ── Bottom nav ─────────────────────────────────────── */}
          {isLoggedIn && isTab && (
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', padding: '4px 8px',
              background: 'var(--surface)', borderTop: '1px solid var(--border)',
            }}>
              <NavBtn icon="list"  label="Pontos" active={tab === 'pontos'} onClick={() => setTab('pontos')} />
              <NavBtn icon="vlan"  label="VLANs"  active={tab === 'vlans'}  onClick={() => setTab('vlans')}  />
              <NavBtn icon="panel" label="Painel" active={tab === 'painel'} onClick={() => setTab('painel')} />
            </div>
          )}
        </div>
      </AndroidDevice>

      {/* ── Tweaks ──────────────────────────────────────────────── */}
      <TweaksPanel>
        <TweakSection label="Aparência" />
        <TweakColor
          label="Cor de destaque" value={t.accent}
          options={['#2563eb', '#0d9488', '#7c3aed', '#ea580c', '#db2777']}
          onChange={v => setTweak('accent', v)}
        />
        <TweakToggle label="Modo escuro" value={t.dark} onChange={v => setTweak('dark', v)} />
        <TweakSection label="Tipografia" />
        <TweakSelect
          label="Fonte" value={t.font}
          options={['Plus Jakarta Sans', 'Manrope', 'Sistema']}
          onChange={v => setTweak('font', v)}
        />
        <TweakSection label="Lista" />
        <TweakRadio
          label="Densidade" value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={v => setTweak('density', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
