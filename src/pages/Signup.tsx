import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('PB')
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signUp({ fullName, email, password, phone, city, state, notifyEnabled })
    setLoading(false)
    if (error) { setError(error); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="center-note" style={{ paddingTop: '3rem' }}>
        <h1 style={{ color: 'var(--tinta)' }}>Quase lá!</h1>
        <p>Enviamos um e-mail de confirmação. Confirme sua conta e depois entre para registrar avistamentos.</p>
        <button className="btn btn-primary" style={{ maxWidth: 240, margin: '0 auto' }} onClick={() => navigate('/entrar')}>Ir para o login</button>
      </div>
    )
  }

  return (
    <div>
      <h1>Cadastro gratuito</h1>
      <p>Cadastre-se para registrar avistamentos, enviar fotos e acompanhar suas contribuições.</p>
      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label>Nome completo</label>
          <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Senha</label>
          <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="field">
          <label>Telefone</label>
          <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(83) 9xxxx-xxxx" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
          <div className="field">
            <label>Cidade</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="field">
            <label>Estado</label>
            <input className="input" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
          </div>
        </div>
        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={notifyEnabled} onChange={(e) => setNotifyEnabled(e.target.checked)} />
            Quero receber notificações de novos registros
          </label>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Criando conta…' : 'Criar conta'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.88rem' }}>
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </div>
  )
}
