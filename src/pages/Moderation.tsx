import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, MessageSquareWarning, Stethoscope, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Species, SightingStatus } from '../lib/types'
import { STATUS_LABELS } from '../lib/types'

const PENDING_STATUSES: SightingStatus[] = ['aguardando_revisao', 'em_revisao', 'correcao_solicitada', 'revisao_especialista']

interface Item {
  id: string
  status: SightingStatus
  municipio: string | null
  observation_date: string | null
  notes: string | null
  reported_name: string | null
  dont_know_species: boolean
  confirmed_species_id: string | null
  suggested: { common_name: string } | null
  photo?: string
}

export default function Moderation() {
  const { session, isModeratorOrAdmin, isAdmin } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmChoice, setConfirmChoice] = useState<Record<string, string>>({})

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('sightings')
      .select('id, status, municipio, observation_date, notes, reported_name, dont_know_species, confirmed_species_id, suggested:species!sightings_species_id_fkey(common_name)')
      .in('status', PENDING_STATUSES)
      .order('created_at', { ascending: true })
    setItems(((data as unknown as Item[]) ?? []))
    setLoading(false)
  }

  useEffect(() => {
    if (!isModeratorOrAdmin) return
    load()
    supabase.from('species').select('*').eq('active', true).order('common_name').then(({ data }) => setSpecies((data as Species[]) ?? []))
  }, [isModeratorOrAdmin])

  async function act(id: string, status: SightingStatus, action: string, message?: string) {
    if (!session) return
    setBusyId(id)
    await supabase.from('sightings').update({ status, reviewed_by: session.user.id, review_note: message ?? null }).eq('id', id)
    await supabase.from('moderation_actions').insert({ sighting_id: id, actor_id: session.user.id, action, message: message ?? null })
    setItems((prev) => prev.filter((i) => i.id !== id))
    setBusyId(null)
  }

  async function requestCorrection(id: string) {
    const message = window.prompt('O que precisa ser corrigido?')
    if (!message) return
    await act(id, 'correcao_solicitada', 'correcao_solicitada', message)
  }

  async function confirmSpecies(id: string) {
    const speciesId = confirmChoice[id]
    if (!speciesId || !session) return
    setBusyId(id)
    await supabase.from('sightings').update({ confirmed_species_id: speciesId, identified_by: session.user.id }).eq('id', id)
    await supabase.from('moderation_actions').insert({ sighting_id: id, actor_id: session.user.id, action: 'identificacao_confirmada' })
    setBusyId(null)
    load()
  }

  if (!isModeratorOrAdmin) {
    return <p className="center-note">Esta área é restrita a moderadores e administradores.</p>
  }

  return (
    <div>
      <span className="eyebrow">Área restrita</span>
      <h1><ShieldCheck size={20} style={{ verticalAlign: '-4px' }} /> Painel de moderação</h1>
      <p>Registros aguardando revisão, correção ou encaminhamento a especialista.</p>

      {loading && <p className="center-note">Carregando…</p>}
      {!loading && items.length === 0 && <p className="center-note">Nenhum registro pendente. 🎉</p>}

      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {items.map((it) => (
          <div className="card" key={it.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{it.dont_know_species ? (it.reported_name || 'Não identificada pelo usuário') : it.suggested?.common_name}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--tinta-fraca)' }}>
                  {it.municipio ?? '—'} · {it.observation_date ? new Date(it.observation_date).toLocaleDateString('pt-BR') : ''}
                </div>
              </div>
              <span className="status-tag" style={{ background: 'var(--pergaminho-2)' }}>{STATUS_LABELS[it.status]}</span>
            </div>

            {it.notes && <p style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>{it.notes}</p>}

            <Link to={`/registro/${it.id}`} style={{ fontSize: '0.78rem' }}>Ver registro completo →</Link>

            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.4rem', margin: '0.7rem 0' }}>
                <select className="input" style={{ flex: 1 }} value={confirmChoice[it.id] ?? ''}
                  onChange={(e) => setConfirmChoice((c) => ({ ...c, [it.id]: e.target.value }))}>
                  <option value="">Confirmar espécie oficial…</option>
                  {species.map((s) => <option key={s.id} value={s.id}>{s.common_name} ({s.venomous ? 'peçonhenta' : 'não peçonhenta'})</option>)}
                </select>
                <button className="btn btn-secondary btn-sm btn-auto" disabled={!confirmChoice[it.id] || busyId === it.id} onClick={() => confirmSpecies(it.id)}>
                  Confirmar
                </button>
              </div>
            )}
            {it.confirmed_species_id && <p className="hint" style={{ color: 'var(--verde-mata)' }}>Espécie já confirmada.</p>}

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
              <button className="btn btn-primary btn-sm btn-auto" disabled={busyId === it.id} onClick={() => act(it.id, 'aprovado', 'aprovado')}>
                <Check size={14} /> Aprovar
              </button>
              <button className="btn btn-outline btn-sm btn-auto" disabled={busyId === it.id} onClick={() => requestCorrection(it.id)}>
                <MessageSquareWarning size={14} /> Solicitar correção
              </button>
              <button className="btn btn-outline btn-sm btn-auto" disabled={busyId === it.id} onClick={() => act(it.id, 'revisao_especialista', 'revisao_especialista')}>
                <Stethoscope size={14} /> Encaminhar especialista
              </button>
              <button className="btn btn-danger btn-sm btn-auto" disabled={busyId === it.id} onClick={() => act(it.id, 'rejeitado', 'rejeitado')}>
                <X size={14} /> Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
