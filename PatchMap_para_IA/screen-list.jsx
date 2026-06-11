/* screen-list.jsx — Tela principal: lista + busca de todos os pontos */

function StatPill({ label, value, color, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 0, border: 'none', cursor: 'pointer', textAlign: 'left',
      background: active ? 'var(--surface)' : 'transparent',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10), inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--border)',
      borderRadius: 12, padding: '9px 11px', transition: 'all .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {color && <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />}
        <span style={{ fontSize: 21, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1, fontWeight: 500 }}>{label}</div>
    </button>
  );
}

function Chip({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, cursor: 'pointer', border: 'none', borderRadius: 999,
      padding: '7px 13px', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      color: active ? 'var(--accent-ink)' : 'var(--text)',
      background: active ? 'var(--accent)' : 'var(--chip)',
      boxShadow: active ? 'none' : 'inset 0 0 0 1px var(--border)',
      transition: 'all .15s',
    }}>
      {label}
      {count != null && <span style={{
        fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--mono)',
        opacity: active ? 0.85 : 0.6,
      }}>{count}</span>}
    </button>
  );
}

function PointRow({ p, density, onOpen }) {
  const compact = density === 'compact';
  const comfy = density === 'comfy';
  const sc = statusColor(p.status);
  return (
    <button onClick={() => onOpen(p.id)} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
      background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 13,
      padding: compact ? '9px 14px' : comfy ? '15px 16px' : '12px 15px',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* ID + Patch Panel */}
      <div style={{
        width: compact ? 40 : 46, height: compact ? 42 : 50, borderRadius: 12, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--chip)', border: '1px solid var(--border)', position: 'relative', gap: 1,
      }}>
        <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--muted)', lineHeight: 1, letterSpacing: 0.5 }}>
          PP{p.patchPanel}
        </span>
        <span style={{ fontSize: compact ? 14 : 17, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)', lineHeight: 1 }}>
          {String(p.id).padStart(2, '0')}
        </span>
        <span style={{
          position: 'absolute', top: -3, right: -3, width: 12, height: 12, borderRadius: 999,
          background: sc, border: '2px solid var(--surface)',
        }} />
      </div>

      {/* corpo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {p.device !== '—' && DEVICE_ICON[p.device] && (
            <Icon name={DEVICE_ICON[p.device]} size={15} color="var(--muted)" stroke={2} />
          )}
          <span style={{
            fontSize: comfy ? 16 : 15, fontWeight: 600, color: p.sector ? 'var(--text)' : 'var(--muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: p.sector ? 'normal' : 'italic',
          }}>{p.sector || 'Não atribuído'}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>PP {p.patchPanel}·{p.patchPort}</span>
          <Icon name="arrow" size={12} color="var(--border-strong)" stroke={2.5} />
          <span>{p.sw} {p.swPort}</span>
        </div>
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <VlanTag vlan={p.vlan} name={comfy ? p.vlanName : null} mono="var(--mono)" />
          </div>
        )}
      </div>

      {/* status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {compact
          ? <span style={{ width: 9, height: 9, borderRadius: 999, background: sc }} />
          : <StatusBadge status={p.status} size="sm" />}
        <Icon name="chevron" size={18} color="var(--border-strong)" />
      </div>
    </button>
  );
}

function ListScreen({ points, density, onOpen }) {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('todos');
  const [sector, setSector] = React.useState('todos');
  const [group, setGroup] = React.useState(false);

  const counts = React.useMemo(() => ({
    total: points.length,
    ativo: points.filter(p => p.status === 'ativo').length,
    problema: points.filter(p => p.status === 'problema').length,
    inativo: points.filter(p => p.status === 'inativo').length,
  }), [points]);

  const sectorNames = React.useMemo(() => {
    const set = [...new Set(points.map(p => p.sector).filter(Boolean))];
    return set.sort();
  }, [points]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return points.filter(p => {
      if (status !== 'todos' && p.status !== status) return false;
      if (sector === '__none' && p.sector) return false;
      if (sector !== 'todos' && sector !== '__none' && p.sector !== sector) return false;
      if (!term) return true;
      const hay = [
        String(p.id), p.sector, p.point, p.device, p.swPort, p.sw,
        `pp ${p.patchPanel} ${p.patchPort}`, p.vlan ? `vlan ${p.vlan}` : '', p.vlanName,
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(term);
    });
  }, [points, q, status, sector]);

  const grouped = React.useMemo(() => {
    if (!group) return null;
    const map = {};
    filtered.forEach(p => {
      const k = p.sector || 'Não atribuído';
      (map[k] = map[k] || []).push(p);
    });
    return Object.keys(map).sort((a, b) => (a === 'Não atribuído') - (b === 'Não atribuído') || a.localeCompare(b))
      .map(k => [k, map[k]]);
  }, [filtered, group]);

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>
      {/* Header sticky */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg)', padding: '14px 15px 10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <img src="icon.png" alt="" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>PatchMap</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>Rastreador de Conexões</div>
            </div>
          </div>
          <button onClick={() => setGroup(g => !g)} title="Agrupar por setor" style={{
            border: 'none', cursor: 'pointer', borderRadius: 10, width: 40, height: 40, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: group ? 'var(--accent-ink)' : 'var(--text)',
            background: group ? 'var(--accent)' : 'var(--chip)',
            boxShadow: group ? 'none' : 'inset 0 0 0 1px var(--border)',
          }}>
            <Icon name={group ? 'building' : 'list'} size={20} />
          </button>
        </div>

        {/* Resumo / filtros rápidos */}
        <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
          <StatPill label="Total"    value={counts.total}    active={status === 'todos'}    onClick={() => setStatus('todos')} />
          <StatPill label="Ativos"   value={counts.ativo}    color="#16a34a" active={status === 'ativo'}    onClick={() => setStatus(s => s === 'ativo' ? 'todos' : 'ativo')} />
          <StatPill label="Problema" value={counts.problema} color="#dc2626" active={status === 'problema'} onClick={() => setStatus(s => s === 'problema' ? 'todos' : 'problema')} />
          <StatPill label="Livres"   value={counts.inativo}  color="#64748b" active={status === 'inativo'}  onClick={() => setStatus(s => s === 'inativo' ? 'todos' : 'inativo')} />
        </div>

        {/* Busca */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9, marginTop: 11,
          background: 'var(--surface)', borderRadius: 12, padding: '0 13px', height: 44,
          boxShadow: 'inset 0 0 0 1px var(--border)',
        }}>
          <Icon name="search" size={19} color="var(--muted)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar setor, ID, VLAN, switch…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit' }} />
          {q && <button onClick={() => setQ('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}><Icon name="close" size={17} color="var(--muted)" /></button>}
        </div>

        {/* Chips de setor */}
        <div style={{ display: 'flex', gap: 8, marginTop: 11, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          <Chip label="Todos os setores" active={sector === 'todos'} onClick={() => setSector('todos')} />
          {sectorNames.map(s => (
            <Chip key={s} label={s} count={points.filter(p => p.sector === s).length} active={sector === s} onClick={() => setSector(s)} />
          ))}
          <Chip label="Sem setor" count={points.filter(p => !p.sector).length} active={sector === '__none'} onClick={() => setSector('__none')} />
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
          <Icon name="search" size={34} color="var(--border-strong)" />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Nenhum ponto encontrado</div>
          <div style={{ fontSize: 13.5, marginTop: 3 }}>Ajuste a busca ou os filtros.</div>
        </div>
      ) : group ? (
        grouped.map(([name, rows]) => {
          const meta = window.SECTORS.find(s => s.name === name);
          return (
            <div key={name}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 7px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{rows.length}</span>
                </div>
                {meta && <VlanTag vlan={meta.vlan} mono="var(--mono)" />}
              </div>
              {rows.map(p => <PointRow key={p.id} p={p} density={density} onOpen={onOpen} />)}
            </div>
          );
        })
      ) : (
        filtered.map(p => <PointRow key={p.id} p={p} density={density} onOpen={onOpen} />)
      )}

      <div style={{ height: 90 }} />
    </div>
  );
}

Object.assign(window, { ListScreen, PointRow, Chip, StatPill });
