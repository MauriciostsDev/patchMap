/* screen-detail.jsx — Detalhe do ponto: trace físico, status, teste de conexão */

function InfoCell({ icon, label, value, mono }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
        {icon && <Icon name={icon} size={15} color="var(--muted)" stroke={2} />}
        <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text)', marginTop: 4, fontFamily: mono ? 'var(--mono)' : 'inherit' }}>{value}</div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 16, boxShadow: 'inset 0 0 0 1px var(--border)', ...style }}>
      {children}
    </div>
  );
}

function DetailScreen({ p, onBack, onEdit, onChange, onDelete }) {
  const [sheet, setSheet] = React.useState(false);
  const sc = statusColor(p.status);

  function setStatus(s) { onChange({ ...p, status: s, updatedAt: '2026-06-10' }); setSheet(false); }

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', paddingBottom: 30 }}>
      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: 4, padding: '8px 8px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
          <Icon name="back" size={24} />
        </button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Ponto de conexão</div>
        <button onClick={() => onEdit(p.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
          <Icon name="edit" size={21} />
        </button>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 76, height: 76, borderRadius: 18, flexShrink: 0, position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent-soft)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: 'var(--accent)', textTransform: 'uppercase' }}>ID</span>
            <span style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)', lineHeight: 1 }}>{String(p.id).padStart(2, '0')}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3 }}>{p.sector || 'Não atribuído'}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2, marginBottom: 8 }}>{p.point ? `Tomada ${p.point}` : 'Tomada sem etiqueta'}</div>
            <StatusBadge status={p.status} />
          </div>
        </div>

        {/* Mudar status */}
        <button onClick={() => setSheet(true)} style={{
          width: '100%', cursor: 'pointer', border: 'none', borderRadius: 12, height: 46,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'var(--chip)', color: 'var(--text)', fontSize: 14.5, fontWeight: 600,
          boxShadow: 'inset 0 0 0 1px var(--border)',
        }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: sc }} /> Mudar status
        </button>

        {/* Trace físico */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--muted)', margin: '4px 2px 12px' }}>Caminho físico</div>
          <Card>
            <TracePath p={p} mono="var(--mono)" />
          </Card>
        </div>

        {/* Info */}
        <Card>
          <div style={{ display: 'flex', gap: 12 }}>
            <InfoCell icon={DEVICE_ICON[p.device] || 'outlet'} label="Dispositivo" value={p.device === '—' ? 'Nenhum' : p.device} />
            <InfoCell icon="vlan" label="VLAN" value={p.vlan != null ? `${p.vlan} · ${p.vlanName}` : 'Nenhuma'} mono />
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <InfoCell icon="panel" label="Patch / Switch" value={`PP ${p.patchPanel}·${p.patchPort} → ${p.swPort}`} mono />
            <InfoCell icon="clock" label="Atualizado" value={p.updatedAt} mono />
          </div>
        </Card>

        {/* Observações */}
        <Card>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--muted)' }}>Observações</div>
          <div style={{ fontSize: 14.5, color: p.obs ? 'var(--text)' : 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
            {p.obs || 'Sem observações registradas.'}
          </div>
        </Card>

        <button onClick={() => onDelete(p.id)} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', color: '#dc2626',
          fontSize: 14, fontWeight: 600, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <Icon name="trash" size={18} /> Excluir ponto
        </button>
      </div>

      {/* Bottom sheet de status */}
      {sheet && (
        <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '10px 16px 22px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Mudar status do ponto</div>
            {window.STATUSES.map(s => {
              const m = STATUS_META[s];
              const on = p.status === s;
              return (
                <button key={s} onClick={() => setStatus(s)} style={{
                  width: '100%', cursor: 'pointer', border: 'none', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 12px', borderRadius: 12,
                  background: on ? withAlpha(m.color, '14') : 'transparent', marginBottom: 4,
                }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: withAlpha(m.color, '1f'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={m.icon} size={19} color={m.color} stroke={2.4} />
                  </span>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
                  {on && <Icon name="check" size={20} color={m.color} stroke={2.6} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DetailScreen, Card, InfoCell });
