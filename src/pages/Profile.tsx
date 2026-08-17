import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { LogOut, Trash2, ShieldCheck, Pencil, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { STATUS_LABELS, type SightingStatus } from '../lib/types'

const EDITABLE_STATUSES: SightingStatus[] = ['aguardando_revisao', 'correcao_solicitada']

interface MySighting {
  id: string
  status: SightingStatus
  municipio: string | null
  observation_date: string | null
  created_at: string
  suggested: { common_name: string } | null
  confirmed: { common_name: string } | null
  photo?: string | null
}

const STATUS_COLORS: Record<SightingStatus, string> = {
  aguardando_revisao: 'var(--cinza-aguardando-bg)',
  em_revisao: 'var(--cinza-aguardando-bg)',
  correcao_solicitada: 'var(--vermelho-perigo-bg)',
  revisao_especialista: 'var(--cinza-aguardando-bg)',
  aprovado: 'var(--verde-seguro-bg)',
  rejeitado: 'var(--vermelho-perigo-bg)',
}

export default function Profile() {
  const { profile, session, signOut, refreshProfile, isModeratorOrAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'meus-registros' ? 'meus-registros' : 'perfil'

  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('PB')
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [phonePublic, setPhonePublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [sightings, setSightings] = useState<MySighting[]>([])
  const [loadingSightings, setLoadingSightings] = useState(true)

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone ?? '')
      setCity(profile.city ?? '')
      setState(profile.state ?? 'PB')
      setNotifyEnabled(profile.notify_enabled)
      setPhonePublic(profile.phone_public)
    }
  }, [profile])

  useEffect(() => {
    if (tab !== 'meus-registros' || !session) return
    setLoadingSightings(true)
    supabase
      .from('sightings')
      .select('id, status, municipio, observation_date, created_at, suggested:species!sightings_species_id_fkey(common_name), confirmed:species!sightings_confirmed_species_id_fkey(common_name), sighting_photos(url, is_primary, order_index)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = ((data as unknown as (MySighting & { sighting_photos: { url: string; is_primary: boolean; order_index: number }[] })[]) ?? []).map((r) => {
          const photos = [...(r.sighting_photos ?? [])].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.order_index - b.order_index)
          return { ...r, photo: photos[0]?.url ?? null }
        })
        setSightings(rows)
        setLoadingSightings(false)
      })
  }, [tab, session])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').update({
      phone, city, state, notify_enabled: notifyEnabled, phone_public: phonePublic,
    }).eq('id', profile.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
  }

  async function deleteSighting(id: string) {
    if (!window.confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return
    await supabase.from('sightings').delete().eq('id', id)
    setSightings((s) => s.filter((x) => x.id !== id))
  }

  return (
    <div>
      <h1>Perfil</h1>

      <div className="tab-row">
        <button className={tab === 'perfil' ? 'active' : ''} onClick={() => setParams({ tab: 'perfil' })}>Meus dados</button>
        <button className={tab === 'meus-registros' ? 'active' : ''} onClick={() => setParams({ tab: 'meus-registros' })}>Meus registros</button>
      </div>

      {isModeratorOrAdmin && (
        <Link to="/moderacao" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          <ShieldCheck size={16} /> Painel de moderação
        </Link>
      )}

      {tab === 'perfil' && (
        <form onSubmit={saveProfile} className="card">
          <div className="field">
            <label>Nome</label>
            <input className="input" value={profile?.full_name ?? ''} disabled />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" value={session?.user.email ?? ''} disabled />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
              Receber notificações de novos registros
            </label>
          </div>
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={phonePublic} onChange={(e) => setPhonePublic(e.target.checked)} />
              Permitir que outros usuários cadastrados vejam meu telefone
            </label>
          </div>
          {saved && <p className="hint" style={{ color: 'var(--verde-mata)' }}>Perfil atualizado.</p>}
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
        </form>
      )}

      {tab === 'meus-registros' && (
        <div>
          {loadingSightings && <p className="center-note">Carregando…</p>}
          {!loadingSightings && sightings.length === 0 && (
            <p className="center-note">Você ainda não registrou nenhum avistamento.</p>
          )}
          {sightings.map((s) => (
            <div className="card" key={s.id} style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div className="list-row" style={{ padding: 0, border: 'none', flex: 1 }}>
                <div className="thumb">{s.photo && <img src={s.photo} alt="" />}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{s.confirmed?.common_name ?? s.suggested?.common_name ?? 'Espécie não informada'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--tinta-fraca)' }}>
                    {s.municipio ?? '—'} · {s.observation_date ? new Date(s.observation_date).toLocaleDateString('pt-BR') : ''}
                  </div>
                  <span className="status-tag" style={{ background: STATUS_COLORS[s.status], marginTop: '0.3rem', display: 'inline-block' }}>
                    {STATUS_LABELS[s.status]}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <Link to={`/registro/${s.id}`} className="btn btn-outline btn-sm btn-auto" aria-label="Visualizar">
                  <Eye size={14} />
                </Link>
                {EDITABLE_STATUSES.includes(s.status) && (
                  <Link to={`/registrar/${s.id}`} className="btn btn-outline btn-sm btn-auto" aria-label="Editar">
                    <Pencil size={14} />
                  </Link>
                )}
                <button className="btn btn-danger btn-sm btn-auto" onClick={() => deleteSighting(s.id)} aria-label="Excluir">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => signOut()}>
        <LogOut size={16} /> Sair da conta
      </button>
    </div>
  )
}
