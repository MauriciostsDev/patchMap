/* screen-form.jsx — Cadastrar / editar ponto em campo */

function Label({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--muted)' }}>{children}</span>
      {hint && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
  background: 'var(--surface)', borderRadius: 12, padding: '0 14px', height: 48,
  fontSize: 15.5, color: 'var(--text)', fontFamily: 'inherit',
  boxShadow: 'inset 0 0 0 1px var(--border)',
};

function PickChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} type="button" style={{
      cursor: 'pointer', border: 'none', borderRadius: 999, padding: '9px 15px',
      fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
      color: active ? 'var(--accent-ink)' : 'var(--text)',
      background: active ? 'var(--accent)' : 'var(--chip)',
      boxShadow: active ? 'none' : 'inset 0 0 0 1px var(--border)',
    }}>{label}</button>
  );
}

function Segmented({ options, value, onChange, render }) {
  return (
    <div style={{ display: 'flex', gap: 6, background: 'var(--chip)', borderRadius: 12, padding: 4, boxShadow: 'inset 0 0 0 1px var(--border)' }}>
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            flex: 1, cursor: 'pointer', border: 'none', borderRadius: 9, padding: '9px 4px',
            fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: on ? 'var(--surface)' : 'transparent',
            color: on ? (o.color || 'var(--text)') : 'var(--muted)',
            boxShadow: on ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
          }}>{render ? render(o, on) : o.label}</button>
        );
      })}
    </div>
  );
}

function FormScreen({ initial, sectors, panels, onCancel, onSave }) {
  const isEdit = !!initial;
  const [f, setF] = React.useState(() => initial || {
    id: '', sector: '', patchPanel: 'A', patchPort: '', sw: 'CORE', swPort: '',
    vlan: null, vlanName: null, device: 'Desktop', status: 'ativo', point: '', obs: '',
  });
  const [newSector, setNewSector] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  function pickSector(name) {
    const meta = window.SECTORS.find(s => s.name === name);
    setF(prev => ({ ...prev, sector: name, vlan: meta ? meta.vlan : prev.vlan, vlanName: meta ? meta.vlanName : prev.vlanName }));
  }

  function pickVlan(v) {
    const meta = window.VLANS.find(x => x.id === v);
    setF(prev => ({ ...prev, vlan: v, vlanName: meta ? meta.name : null }));
  }

  const portNum = parseInt(f.patchPort, 10);
  const valid = !isNaN(portNum) && portNum > 0;

  function save() {
    setTouched(true);
    if (!valid) return;
    const sw = f.swPort || `Gi1/0/${portNum}`;
    onSave({
      ...f,
      id: isEdit ? f.id : portNum,
      patchPort: portNum,
      swPort: sw,
      sector: f.sector || null,
      device: f.device || '—',
      updatedAt: '2026-06-10',
    });
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', paddingBottom: 30 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: 4, padding: '8px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onCancel} style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: 44, height: 44, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
          <Icon name="close" size={23} />
        </button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{isEdit ? `Editar ponto ${String(f.id).padStart(2, '0')}` : 'Novo ponto'}</div>
        <button onClick={save} style={{
          border: 'none', cursor: 'pointer', borderRadius: 999, padding: '9px 18px', marginRight: 4,
          background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 14.5, fontWeight: 700,
        }}>Salvar</button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Setor */}
        <div>
          <Label hint="VLAN preenchida automaticamente">Setor</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sectors.map(s => <PickChip key={s} label={s} active={f.sector === s} onClick={() => pickSector(s)} />)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input value={newSector} onChange={e => setNewSector(e.target.value)} placeholder="+ Novo setor" style={inputStyle} />
            <button type="button" disabled={!newSector.trim()} onClick={() => { pickSector(newSector.trim()); setNewSector(''); }} style={{
              border: 'none', cursor: newSector.trim() ? 'pointer' : 'default', borderRadius: 12, padding: '0 18px', height: 48,
              background: newSector.trim() ? 'var(--accent)' : 'var(--chip)', color: newSector.trim() ? 'var(--accent-ink)' : 'var(--muted)',
              fontSize: 14.5, fontWeight: 600, flexShrink: 0,
            }}>Usar</button>
          </div>
        </div>

        {/* Tomada / Dispositivo */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Label>Etiqueta da tomada</Label>
            <input value={f.point || ''} onChange={e => set('point', e.target.value)} placeholder="Ex: GSA-05" style={inputStyle} />
          </div>
        </div>
        <div>
          <Label>Dispositivo conectado</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {window.DEVICES.map(d => <PickChip key={d} label={d === '—' ? 'Nenhum' : d} active={f.device === d} onClick={() => set('device', d)} />)}
          </div>
        </div>

        {/* Patch panel + porta */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Label>Patch Panel</Label>
            <Segmented
            options={(panels && panels.length ? panels : [{ id: 'A' }]).map(p => ({ value: p.id, label: p.id }))}
            value={f.patchPanel}
            onChange={v => set('patchPanel', v)}
          />
          </div>
          <div style={{ width: 120 }}>
            <Label>Porta</Label>
            <input value={f.patchPort} onChange={e => set('patchPort', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="1–48"
              style={{ ...inputStyle, fontFamily: 'var(--mono)', fontWeight: 700, textAlign: 'center', boxShadow: touched && !valid ? 'inset 0 0 0 1.5px #dc2626' : inputStyle.boxShadow }} />
          </div>
        </div>
        {touched && !valid && <div style={{ fontSize: 12.5, color: '#dc2626', marginTop: -12 }}>Informe o número da porta do patch panel.</div>}

        {/* Switch + porta */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Label>Switch</Label>
            <input value={f.sw} onChange={e => set('sw', e.target.value)} placeholder="CORE" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <Label hint="auto">Porta switch</Label>
            <input value={f.swPort} onChange={e => set('swPort', e.target.value)} placeholder={valid ? `Gi1/0/${portNum}` : 'Gi1/0/…'} style={{ ...inputStyle, fontFamily: 'var(--mono)' }} />
          </div>
        </div>

        {/* VLAN */}
        <div>
          <Label>VLAN</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <PickChip label="Sem VLAN" active={f.vlan == null} onClick={() => setF(prev => ({ ...prev, vlan: null, vlanName: null }))} />
            {window.VLANS.map(v => <PickChip key={v.id} label={`${v.id} · ${v.name}`} active={f.vlan === v.id} onClick={() => pickVlan(v.id)} />)}
          </div>
        </div>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <Segmented
            options={window.STATUSES.map(s => ({ value: s, label: STATUS_META[s].label, color: STATUS_META[s].color }))}
            value={f.status} onChange={v => set('status', v)}
            render={(o, on) => (<><span style={{ width: 8, height: 8, borderRadius: 999, background: o.color }} />{o.label}</>)}
          />
        </div>

        {/* Observações */}
        <div>
          <Label>Observações</Label>
          <textarea value={f.obs} onChange={e => set('obs', e.target.value)} placeholder="Anote algo útil para a manutenção…" rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '12px 14px', lineHeight: 1.5, resize: 'none' }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FormScreen, Segmented, PickChip, Label });
