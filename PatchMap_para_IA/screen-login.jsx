/* screen-login.jsx — Tela de login */

function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  function submit() {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1100);
  }

  const fieldBase = {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--surface)', borderRadius: 14, padding: '0 14px', height: 52,
  };
  const inputBase = {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontSize: 15, color: 'var(--text)', fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100%', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 22px 20px',
    }}>
      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        width: '100%', maxWidth: 340, paddingBottom: 8,
      }}>
        {/* Logo */}
        <img
          src="icon.png" alt="PatchMap"
          style={{ width: 88, height: 88, borderRadius: 22, display: 'block', marginBottom: 18, boxShadow: '0 12px 36px rgba(0,0,0,0.18)' }}
        />
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.6, marginBottom: 4 }}>
          PatchMap
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 38, fontWeight: 500 }}>
          Rastreador de Conexões de Rede
        </div>

        {/* Form */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 11 }}>

          {/* E-mail */}
          <div style={{ ...fieldBase, boxShadow: 'inset 0 0 0 1px var(--border)' }}>
            <Icon name="mail" size={19} color="var(--muted)" />
            <input
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="usuario@orgao.gov.br"
              type="email"
              autoComplete="email"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={inputBase}
            />
          </div>

          {/* Senha */}
          <div style={{
            ...fieldBase,
            boxShadow: error ? 'inset 0 0 0 1.5px #ef4444' : 'inset 0 0 0 1px var(--border)',
          }}>
            <Icon name="lock" size={19} color="var(--muted)" />
            <input
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Senha"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={inputBase}
            />
            <button
              onClick={() => setShowPass(s => !s)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
            >
              <Icon name={showPass ? 'eyeoff' : 'eye'} size={18} color="var(--muted)" />
            </button>
          </div>

          {/* Erro */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 10,
              background: 'rgba(239,68,68,0.10)', color: '#ef4444',
              fontSize: 13.5, fontWeight: 500,
            }}>
              <Icon name="alert" size={16} color="#ef4444" stroke={2.5} />
              {error}
            </div>
          )}

          {/* Botão entrar */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              height: 52, cursor: loading ? 'default' : 'pointer',
              border: 'none', borderRadius: 14,
              background: 'var(--accent)', color: 'var(--accent-ink)',
              fontSize: 15.5, fontWeight: 700, marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.85 : 1, transition: 'opacity .2s',
            }}
          >
            {loading ? (
              <>
                <span className="spin" style={{
                  width: 18, height: 18, borderRadius: 999,
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', display: 'inline-block',
                }} />
                Autenticando…
              </>
            ) : 'Entrar'}
          </button>

          {/* Esqueci a senha */}
          <button style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--accent)', fontSize: 14, fontWeight: 600,
            padding: '6px 0', textAlign: 'center',
          }}>
            Esqueci a senha
          </button>
        </div>
      </div>

      {/* Rodapé */}
      <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', opacity: 0.65 }}>
        PatchMap v1.0 · Gestão de Rede Interna
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
