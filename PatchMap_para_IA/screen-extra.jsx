/* screen-extra.jsx — VLANs (accordion VLAN→Setor→Pontos) e Painel multi-panel */

const SECTOR_COLORS = {
  'GSAD': '#6366f1', 'GAB': '#0d9488', 'GAB Recepção': '#d97706', 'Secretaria': '#db2777',
};
function sectorColor(name) { return SECTOR_COLORS[name] || '#0ea5e9'; }

const VLAN_COLORS = { 10: '#0d9488', 11: '#d97706', 20: '#6366f1', 30: '#db2777', 99: '#64748b' };
function vlanColor(id) { return VLAN_COLORS[id] || '#0ea5e9'; }

// ── Mini barra de status ────────────────────────────────────────────
function MiniBar({ rows }) {
  const total = rows.length || 1;
  const pct = (s) => rows.filter(r => r.status === s).length / total * 100;
  return (
    <div style={{ display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', background: 'var(--border)' }}>
      <div style={{ width: `${pct('ativo')}%`,    background: '#16a34a', transition: 'width .3s' }} />
      <div style={{ width: `${pct('problema')}%`, background: '#dc2626', transition: 'width .3s' }} />
    </div>
  );
}

// ── Tela VLANs (accordion duplo: VLAN → Setor → Pontos) ───────────
function VlanScreen({ points, density, onOpen }) {
  const [openVlan,   setOpenVlan]   = React.useState(null);
  const [openSector, setOpenSector] = React.useState(null);

  const vlanData = React.useMemo(() => {
    return window.VLANS.map(v => {
      const vpts = points.filter(p => p.vlan === v.id);
      const sectorNames = [...new Set(vpts.map(p => p.sector).filter(Boolean))];
      return {
        ...v,
        points: vpts,
        sectors: sectorNames.map(name => ({
          name,
          points: vpts.filter(p => p.sector === name).sort((a, b) => a.id - b.id),
        })),
      };
    });
  }, [points]);

  const unassigned = React.useMemo(
    () => points.filter(p => p.vlan == null && p.sector),
    [points]
  );
  const totalCfg = points.filter(p => p.vlan != null).length;

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>
      <div style={{ padding: '16px 16px 6px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.4 }}>VLANs</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>
          {window.VLANS.length} VLANs · {totalCfg} pontos configurados
        </div>
      </div>

      <div style={{ padding: '8px 14px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {vlanData.map(v => {
          const isOpen = openVlan === v.id;
          const prob   = v.points.filter(p => p.status === 'problema').length;
          const col    = vlanColor(v.id);

          return (
            <div key={v.id} style={{
              background: 'var(--surface)', borderRadius: 16,
              boxShadow: 'inset 0 0 0 1px var(--border)', overflow: 'hidden',
            }}>
              {/* Cabeçalho da VLAN */}
              <button
                onClick={() => {
                  setOpenVlan(isOpen ? null : v.id);
                  if (isOpen) setOpenSector(null);
                }}
                style={{ width: '100%', cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left', padding: 15 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: withAlpha(col, '1f'), display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="vlan" size={22} color={col} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: col }}>VLAN {v.id}</span>
                      <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text)' }}>{v.name}</span>
                      {prob > 0 && (
                        <span style={{
                          fontSize: 11.5, fontWeight: 700, color: '#dc2626',
                          background: withAlpha('#dc2626', '1f'), padding: '2px 7px', borderRadius: 999,
                        }}>
                          {prob} prob.
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                      {v.sectors.length} {v.sectors.length === 1 ? 'setor' : 'setores'} · {v.points.length} {v.points.length === 1 ? 'ponto' : 'pontos'}
                    </div>
                  </div>
                  <Icon name="chevron" size={20} color="var(--border-strong)"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                </div>
                {v.points.length > 0 && <div style={{ marginTop: 12 }}><MiniBar rows={v.points} /></div>}
              </button>

              {/* Setores dentro da VLAN */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {v.sectors.length === 0 ? (
                    <div style={{ padding: '18px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                      Nenhum ponto configurado nesta VLAN
                    </div>
                  ) : v.sectors.map(sec => {
                    const secKey  = `${v.id}:${sec.name}`;
                    const secOpen = openSector === secKey;
                    const secCol  = sectorColor(sec.name);
                    const secProb = sec.points.filter(p => p.status === 'problema').length;
                    return (
                      <div key={sec.name} style={{ borderBottom: '1px solid var(--border)' }}>
                        {/* Cabeçalho do setor */}
                        <button
                          onClick={() => setOpenSector(secOpen ? null : secKey)}
                          style={{
                            width: '100%', cursor: 'pointer', border: 'none',
                            background: 'var(--bg)', textAlign: 'left',
                            padding: '11px 16px 11px 20px',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                            background: withAlpha(secCol, '1f'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon name="building" size={17} color={secCol} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{sec.name}</span>
                              {secProb > 0 && (
                                <span style={{
                                  fontSize: 11, fontWeight: 700, color: '#dc2626',
                                  background: withAlpha('#dc2626', '1f'), padding: '2px 6px', borderRadius: 999,
                                }}>{secProb}</span>
                              )}
                            </div>
                            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                              {sec.points.length} {sec.points.length === 1 ? 'ponto' : 'pontos'}
                            </span>
                          </div>
                          <Icon name="chevron" size={17} color="var(--border-strong)"
                            style={{ transform: secOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                        </button>
                        {/* Pontos do setor */}
                        {secOpen && sec.points.map(p => (
                          <PointRow key={p.id} p={p} density={density} onOpen={onOpen} />
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Pontos sem VLAN */}
        {unassigned.length > 0 && (
          <div style={{
            background: 'var(--surface)', borderRadius: 16,
            boxShadow: 'inset 0 0 0 1px var(--border)',
            padding: 15, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'var(--chip)', boxShadow: 'inset 0 0 0 1px var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="outlet" size={22} color="var(--muted)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}>Sem VLAN</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>
                {unassigned.length} {unassigned.length === 1 ? 'ponto sem' : 'pontos sem'} segmentação
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Porta visual do patch panel ─────────────────────────────────────
function Port({ p, colorBy, onOpen }) {
  const sc     = statusColor(p.status);
  const base   = colorBy === 'status' ? sc : (p.sector ? sectorColor(p.sector) : '#64748b');
  const filled = !!p.sector || p.status === 'problema';
  return (
    <button onClick={() => onOpen(p.id)} style={{
      cursor: 'pointer', border: 'none', borderRadius: 7, padding: '7px 0 6px', position: 'relative',
      background: filled ? withAlpha(base, '30') : 'rgba(148,163,184,0.12)',
      boxShadow: `inset 0 0 0 1.5px ${filled ? base : 'rgba(148,163,184,0.4)'}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minHeight: 46,
    }}>
      <div style={{ display: 'flex', gap: 1.5 }}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} style={{ width: 2, height: 6, borderRadius: 1, background: filled ? base : 'rgba(148,163,184,0.6)' }} />
        ))}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: filled ? base : '#94a3b8', lineHeight: 1 }}>
        {String(p.patchPort).padStart(2, '0')}
      </span>
      <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: 999, background: sc }} />
    </button>
  );
}

// ── Tela Painel (multi-painel + criar novo) ─────────────────────────
function PanelScreen({ points, panels, onOpen, onAddPanel }) {
  const [colorBy,     setColorBy]     = React.useState('setor');
  const [selectedId,  setSelectedId]  = React.useState(() => panels[0]?.id || 'A');
  const [addSheet,    setAddSheet]    = React.useState(false);
  const [newPanel,    setNewPanel]    = React.useState({ id: '', ports: 24, sw: 'CORE' });
  const [nameErr,     setNameErr]     = React.useState(false);

  React.useEffect(() => {
    if (!panels.find(p => p.id === selectedId) && panels.length > 0) {
      setSelectedId(panels[0].id);
    }
  }, [panels]);

  const currentDef   = panels.find(p => p.id === selectedId) || panels[0] || { id: 'A', label: 'Painel A', ports: 32, sw: 'CORE' };
  const panel        = points.filter(p => p.patchPanel === selectedId).sort((a, b) => a.patchPort - b.patchPort);
  const used         = panel.filter(p => p.sector).length;
  const sectorsInPanel = [...new Set(panel.map(p => p.sector).filter(Boolean))];

  const nextLetter = React.useMemo(() => {
    const ids = panels.map(p => p.id).filter(id => /^[A-Z]$/.test(id)).sort();
    if (!ids.length) return 'B';
    const last = ids[ids.length - 1];
    return last < 'Z' ? String.fromCharCode(last.charCodeAt(0) + 1) : 'A2';
  }, [panels]);

  function openAdd() {
    setNewPanel({ id: nextLetter, ports: 24, sw: 'CORE' });
    setNameErr(false);
    setAddSheet(true);
  }

  function confirmAdd() {
    const id = newPanel.id.trim().toUpperCase();
    if (!id || panels.find(p => p.id === id)) { setNameErr(true); return; }
    onAddPanel({ id, label: `Painel ${id}`, ports: newPanel.ports, sw: newPanel.sw || 'CORE' });
    setSelectedId(id);
    setAddSheet(false);
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 6px' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.4 }}>
          {currentDef.label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>
          {used}/{panel.length} portas em uso · Switch {currentDef.sw}
        </div>
      </div>

      {/* Seletor de painéis */}
      <div style={{
        display: 'flex', gap: 8, padding: '4px 14px 0',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {panels.map(def => (
          <button key={def.id} onClick={() => setSelectedId(def.id)} style={{
            flexShrink: 0, cursor: 'pointer', border: 'none', borderRadius: 999,
            padding: '7px 16px', fontSize: 13.5, fontWeight: 600,
            color: selectedId === def.id ? 'var(--accent-ink)' : 'var(--text)',
            background: selectedId === def.id ? 'var(--accent)' : 'var(--chip)',
            boxShadow: selectedId === def.id ? 'none' : 'inset 0 0 0 1px var(--border)',
            transition: 'all .15s',
          }}>{def.label}</button>
        ))}
        <button onClick={openAdd} style={{
          flexShrink: 0, cursor: 'pointer', border: 'none', borderRadius: 999,
          padding: '7px 14px', fontSize: 13.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 5,
          color: 'var(--muted)', background: 'var(--chip)',
          boxShadow: 'inset 0 0 0 1px var(--border)',
        }}>
          <Icon name="plus" size={15} /> Novo
        </button>
      </div>

      {/* Segmented view */}
      <div style={{ padding: '10px 14px 0' }}>
        <Segmented
          options={[{ value: 'setor', label: 'Por setor' }, { value: 'status', label: 'Por status' }]}
          value={colorBy}
          onChange={setColorBy}
        />
      </div>

      {/* Rack visual */}
      <div style={{ margin: '14px 14px 0', borderRadius: 16, overflow: 'hidden', background: '#1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#22d3ee', boxShadow: '0 0 8px #22d3ee' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5, fontFamily: 'var(--mono)' }}>
              PATCH PANEL {selectedId} · {currentDef.ports}P
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'var(--mono)' }}>1U</span>
        </div>
        <div style={{ padding: 12 }}>
          {panel.length === 0 ? (
            <div style={{ padding: '18px 0', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              Nenhuma porta cadastrada
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
              {panel.map(p => <Port key={p.id} p={p} colorBy={colorBy} onOpen={onOpen} />)}
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 9 }}>
          {colorBy === 'status' ? 'Status' : 'Setores'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px 16px' }}>
          {colorBy === 'status'
            ? window.STATUSES.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: STATUS_META[s].color }} />
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{STATUS_META[s].label}</span>
              </div>
            ))
            : sectorsInPanel.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: sectorColor(s) }} />
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{s}</span>
              </div>
            ))
          }
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: 'rgba(148,163,184,0.3)', boxShadow: 'inset 0 0 0 1.5px rgba(148,163,184,0.6)' }} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Livre</span>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 14, lineHeight: 1.5 }}>
          O ponto colorido no canto de cada porta indica o status. Toque para ver os detalhes.
        </div>
      </div>

      {/* Bottom sheet: criar painel */}
      {addSheet && (
        <div
          onClick={() => setAddSheet(false)}
          style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.42)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '10px 16px 28px' }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 18 }}>Novo Patch Panel</div>

            {/* Identificador */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 7 }}>
                Identificador
              </div>
              <input
                value={newPanel.id}
                onChange={e => { setNewPanel(p => ({ ...p, id: e.target.value.toUpperCase() })); setNameErr(false); }}
                maxLength={4}
                placeholder={nextLetter}
                style={{
                  width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
                  background: 'var(--bg)', borderRadius: 12, padding: '0 14px', height: 48,
                  fontSize: 17, color: 'var(--text)', fontFamily: 'var(--mono)', fontWeight: 700,
                  boxShadow: nameErr ? 'inset 0 0 0 1.5px #dc2626' : 'inset 0 0 0 1px var(--border)',
                }}
              />
              {nameErr && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 5 }}>ID inválido ou já existente.</div>}
            </div>

            {/* Número de portas */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 7 }}>
                Número de portas
              </div>
              <Segmented
                options={[{ value: 16, label: '16' }, { value: 24, label: '24' }, { value: 32, label: '32' }, { value: 48, label: '48' }]}
                value={newPanel.ports}
                onChange={v => setNewPanel(p => ({ ...p, ports: v }))}
              />
            </div>

            {/* Switch */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 7 }}>
                Switch
              </div>
              <input
                value={newPanel.sw}
                onChange={e => setNewPanel(p => ({ ...p, sw: e.target.value }))}
                placeholder="CORE"
                style={{
                  width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
                  background: 'var(--bg)', borderRadius: 12, padding: '0 14px', height: 48,
                  fontSize: 15.5, color: 'var(--text)', fontFamily: 'inherit',
                  boxShadow: 'inset 0 0 0 1px var(--border)',
                }}
              />
            </div>

            <button onClick={confirmAdd} style={{
              width: '100%', cursor: 'pointer', border: 'none', borderRadius: 13, height: 50,
              background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 15.5, fontWeight: 700,
            }}>
              Criar painel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { VlanScreen, PanelScreen, SECTOR_COLORS, VLAN_COLORS, sectorColor, vlanColor });
