import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Share2, Check, Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { SightingPublic, SightingPhoto } from '../lib/types'
import { ANIMAL_CONDITION_LABELS, BEHAVIOR_LABELS, STATUS_LABELS, type SightingStatus } from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'

const REPORT_REASONS = [
  'Localização incorreta',
  'Espécie incorreta',
  'Foto não corresponde ao registro',
  'Conteúdo inadequado ou spam',
  'Registro duplicado',
  'Outro motivo',
]

export default function RecordDetail() {
  const { id } = useParams()
  const { isModeratorOrAdmin, session } = useAuth()
  const [record, setRecord] = useState<(SightingPublic & { status?: SightingStatus }) | null>(null)
  const [photos, setPhotos] = useState<SightingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [shared, setShared] = useState(false)

  const [showReport, setShowReport] = useState(false)
  const [alreadyReported, setAlreadyReported] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetail, setReportDetail] = useState('')
  const [reportBusy, setReportBusy] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  async function share() {
    const url = window.location.href
    const title = 'É uma cobra venenosa?'
    const text = `Avistamento de ${record?.species_display_name ?? record?.reported_name ?? 'serpente'} em ${record?.municipio ?? 'Paraíba'}`
    if (navigator.share) { try { await navigator.share({ title, text, url }); return } catch { return } }
    await navigator.clipboard.writeText(url)
    setShared(true); setTimeout(() => setShared(false), 2000)
  }

  async function submitReport() {
    if (!session || !id || !reportReason) return
    setReportBusy(true); setReportError(null)
    const reason = reportDetail.trim() ? `${reportReason} — ${reportDetail.trim()}` : reportReason
    const { error } = await supabase.from('reports').insert({ sighting_id: id, reporter_id: session.user.id, reason })
    setReportBusy(false)
    if (error) { setReportError('Não foi possível enviar a denúncia. Tente novamente.'); return }
    setAlreadyReported(true); setShowReport(false)
  }

  useEffect(() => {
    if (!id) return
    let mounted = true
    async function load() {
      const pub = await supabase.from('sightings_public').select('*').eq('id', id).maybeSingle()
      if (pub.data) { if (!mounted) return; setRecord(pub.data as SightingPublic) }
      else {
        const own = await supabase.from('sightings').select('*,suggested:species!sightings_species_id_fkey(common_name,venomous),confirmed:species!sightings_confirmed_species_id_fkey(common_name,venomous)').eq('id', id).is('deleted_at', null).maybeSingle()
        if (!mounted) return
        if (!own.data) { setNotFound(true); setLoading(false); return }
        const d = own.data as unknown as Record<string, unknown> & { suggested: { common_name: string; venomous: boolean } | null; confirmed: { common_name: string; venomous: boolean } | null }
        setRecord({ id: d.id as string, municipio: d.municipio as string | null, localidade: d.localidade as string | null, location_type: d.location_type as string | null, latitude: d.latitude as number | null, longitude: d.longitude as number | null, observation_date: d.observation_date as string | null, observation_time: d.observation_time as string | null, vegetation_type: d.vegetation_type as string | null, season: d.season as string | null, weather_condition: d.weather_condition as string | null, day_period: d.day_period as string | null, animal_condition: d.animal_condition as SightingPublic['animal_condition'], behavior: d.behavior as SightingPublic['behavior'], notes: d.notes as string | null, reported_name: d.reported_name as string | null, dont_know_species: d.dont_know_species as boolean, suggested_species_id: d.suggested_species_id as string | null, confirmed_species_id: d.confirmed_species_id as string | null, species_display_name: d.confirmed?.common_name ?? d.suggested?.common_name ?? null, venomous_display: d.confirmed?.venomous ?? d.suggested?.venomous ?? null, identification_confirmed: !!d.confirmed_species_id, author_name: null, created_at: d.created_at as string, view_count: (d.view_count as number) ?? 0, primary_photo_url: null, status: d.status as SightingStatus })
      }
      const ph = await supabase.from('sighting_photos').select('*').eq('sighting_id', id).order('order_index')
      if (mounted) { setPhotos((ph.data as SightingPhoto[]) ?? []); setLoading(false) }
    }
    load(); return () => { mounted = false }
  }, [id])

  useEffect(() => {
    if (!id || !session) return
    supabase.from('reports').select('id').eq('sighting_id', id).eq('reporter_id', session.user.id).maybeSingle().then(({ data }) => { if (data) setAlreadyReported(true) })
  }, [id, session])

  if (loading) return <p className="center-note">Carregando…</p>
  if (notFound || !record) return <p className="center-note">Registro não encontrado.</p>
  return (
    <div>
      <div style={{ background: 'var(--branco)' }}>
        {photos.length > 0
          ? (<div style={{ display: 'grid', gridTemplateColumns: photos.length === 1 ? '1fr' : '1fr 1fr', gap: 2 }}>{photos.map((p) => (<div key={p.id} style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--fundo)' }}>{p.media_type === 'video' ? <video src={p.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div>))}</div>)
          : (<div style={{ height: 180, background: 'var(--fundo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cinza-fraco)', fontSize: '0.88rem' }}>Sem foto</div>)
        }
      </div>
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem' }}>
          <SpeciesStamp venomous={record.venomous_display} confirmed={record.identification_confirmed} />
          <button onClick={share} className="btn btn-outline btn-sm btn-auto" style={{ borderRadius: '999px', flexShrink: 0 }}>
            {shared ? <><Check size={14} /> Link copiado</> : <><Share2 size={14} /> Compartilhar</>}
          </button>
        </div>
        {record.status && isModeratorOrAdmin && <span className="status-tag" style={{ marginLeft: '0.5rem', background: 'var(--amarelo-bg)', color: 'var(--amarelo-alerta)' }}>{STATUS_LABELS[record.status]}</span>}
        <h1 style={{ marginTop: '0.5rem' }}>{record.species_display_name ?? record.reported_name ?? 'Espécie não informada'}</h1>
        {!record.identification_confirmed && <p style={{ fontSize: '0.82rem', color: 'var(--cinza-fraco)', margin: '0 0 1rem' }}>Sugestão do usuário — não confirmada oficialmente.</p>}
        <div style={{ display: 'grid', gap: '0.4rem', marginBottom: '1rem' }}>
          <R l="Município">{record.municipio ?? '—'}</R>
          {record.localidade && <R l="Localidade">{record.localidade}</R>}
          <R l="Data">{record.observation_date ? new Date(record.observation_date).toLocaleDateString('pt-BR') : '—'}</R>
          {record.vegetation_type && <R l="Vegetação">{record.vegetation_type}</R>}
          {record.animal_condition && <R l="Condição">{ANIMAL_CONDITION_LABELS[record.animal_condition]}</R>}
          {record.behavior && <R l="Comportamento">{BEHAVIOR_LABELS[record.behavior]}</R>}
          {record.author_name && <R l="Registrado por">{record.author_name}</R>}
        </div>
        {record.notes && (<div style={{ marginTop: '0.5rem' }}><h3 style={{ color: 'var(--cinza-fraco)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Observações</h3><p>{record.notes}</p></div>)}
        <Link to="/explorar?tab=registros" style={{ fontSize: '0.82rem', fontWeight: 600 }}>← Registros</Link>

        {session && (
          <div style={{ marginTop: '1.4rem', paddingTop: '0.9rem', borderTop: '1px solid var(--cinza-linha)' }}>
            {alreadyReported ? (
              <p className="hint">Você já denunciou este registro. Nossa equipe vai revisar.</p>
            ) : showReport ? (
              <div className="card">
                <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.6rem' }}>Por que você está denunciando este registro?</strong>
                <div className="field">
                  <select className="input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                    <option value="">Selecione um motivo</option>
                    {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <textarea className="input" placeholder="Detalhes (opcional)" rows={3} value={reportDetail} onChange={(e) => setReportDetail(e.target.value)} />
                </div>
                {reportError && <p className="hint" style={{ color: 'var(--vermelho)' }}>{reportError}</p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary btn-sm btn-auto" style={{ borderRadius: '8px' }} disabled={!reportReason || reportBusy} onClick={submitReport}>{reportBusy ? 'Enviando…' : 'Enviar denúncia'}</button>
                  <button className="btn btn-outline btn-sm btn-auto" style={{ borderRadius: '8px' }} onClick={() => setShowReport(false)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-outline btn-sm btn-auto" style={{ borderRadius: '8px', color: 'var(--cinza-fraco)' }} onClick={() => setShowReport(true)}><Flag size={13} /> Denunciar registro</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
function R({ l, children }: { l: string; children: React.ReactNode }) { return (<div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--cinza-linha)', fontSize: '0.88rem' }}><span style={{ color: 'var(--cinza-fraco)', fontWeight: 600 }}>{l}</span><span style={{ fontWeight: 700, textAlign: 'right' }}>{children}</span></div>) }
