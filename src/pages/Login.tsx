import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'
    navigate(from, { replace: true })
  }

  return (
    <div>
      <h1>Entrar</h1>
      <p>Entre para registrar avistamentos e acompanhar seus registros.</p>
      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label>E-mail</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Senha</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.88rem' }}>
        Não tem conta? <Link to="/cadastrar">Cadastre-se gratuitamente</Link>
      </p>
    </div>
  )
}
