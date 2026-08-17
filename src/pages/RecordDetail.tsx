import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { SightingPublic, SightingPhoto } from '../lib/types'
import { ANIMAL_CONDITION_LABELS, BEHAVIOR_LABELS, STATUS_LABELS, type SightingStatus } from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'

export default function RecordDetail() {
  const { id } = useParams()
  const { isModeratorOrAdmin } = useAuth()
  const [record, setRecord] = useState<(SightingPublic & { status?: SightingStatus }) | null>(null)
  const [photos, setPhotos] = useState<SightingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    async function load() {
      const pub = await supabase.from('sightings_public').select('*').eq('id', id).maybeSingle()
      if (pub.data) {
        if (!mounted) return
        setRecord(pub.data as SightingPublic)
      } else {
        const own = await supabase
          .from('sightings')
          .select('*, suggested:species!sightings_species_id_fkey(common_name,venomous), confirmed:species!sightings_confirmed_species_id_fkey(common_name,venomous)')
          .eq('id', id)
          .maybeSingle()
        if (!mounted) return
        if (!own.data) { setNotFound(true); setLoading(false); return }
        const d = own.data as unknown as Record<string, unknown> & { suggested: { common_name: string; venomous: boolean } | null; confirmed: { common_name: string; venomous: boolean } | null }
        setRecord({
          id: d.id as string,
          municipio: d.municipio as string | null,
          localidade: d.localidade as string | null,
          location_type: d.location_type as string | null,
          latitude: d.latitude as number | null,
          longitude: d.longitude as number | null,
          observation_date: d.observation_date as string | null,
          observation_time: d.observation_time as string | null,
          vegetation_type: d.vegetation_type as string | null,
          season: d.season as string | null,
          weather_condition: d.weather_condition as string | null,
          day_period: d.day_period as string | null,
          animal_condition: d.animal_condition as SightingPublic['animal_condition'],
          behavior: d.behavior as SightingPublic['behavior'],
          notes: d.notes as string | null,
          reported_name: d.reported_name as string | null,
          dont_know_species: d.dont_know_species as boolean,
          suggested_species_id: d.suggested_species_id as string | null,
          confirmed_species_id: d.confirmed_species_id as string | null,
          species_display_name: d.confirmed?.common_name ?? d.suggested?.common_name ?? null,
          venomous_display: d.confirmed?.venomous ?? d.suggested?.venomous ?? null,
          identification_confirmed: !!d.confirmed_species_id,
          author_name: null,
          created_at: d.created_at as string,
          view_count: (d.view_count as number) ?? 0,
          status: d.status as SightingStatus,
        })
      }
      const ph = await supabase.from('sighting_photos').select('*').eq('sighting_id', id).order('order_index')
      if (mounted) setPhotos((ph.data as SightingPhoto[]) ?? [])
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <p className="center-note">Carregando…</p>
  if (notFound || !record) return <p className="center-note">Registro não encontrado ou ainda não publicado.</p>

  return (
    <div>
      <Link to="/explorar?tab=registros" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>&larr; Registros</Link>

      {photos.length > 0 ? (
        <div className="photo-grid" style={{ margin: '0.8rem 0' }}>
          {photos.map((p) => (
            <div className="photo-tile" key={p.id}>
              {p.media_type === 'video' ? <video src={p.url} controls /> : <img src={p.url} alt="" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', margin: '0.8rem 0', color: 'var(--tinta-fraca)' }}>Sem mídia anexada</div>
      )}

      <SpeciesStamp venomous={record.venomous_display} confirmed={record.identification_confirmed} />
      {record.status && isModeratorOrAdmin && (
        <span className="status-tag" style={{ marginLeft: '0.4rem', background: 'var(--pergaminho-2)' }}>{STATUS_LABELS[record.status]}</span>
      )}

      <h1 style={{ marginTop: '0.5rem' }}>{record.species_display_name ?? record.reported_name ?? 'Espécie não informada'}</h1>
      {!record.identification_confirmed && (
        <p className="hint">Espécie sugerida pelo usuário — ainda não confirmada oficialmente.</p>
      )}

      <div className="card" style={{ marginTop: '0.8rem' }}>
        <Row label="Município">{record.municipio ?? '—'}</Row>
        {record.localidade && <Row label="Localidade">{record.localidade}</Row>}
        <Row label="Data">{record.observation_date ? new Date(record.observation_date).toLocaleDateString('pt-BR') : '—'}</Row>
        {record.vegetation_type && <Row label="Vegetação">{record.vegetation_type}</Row>}
        {record.season && <Row label="Estação">{record.season}</Row>}
        {record.animal_condition && <Row label="Condição do animal">{ANIMAL_CONDITION_LABELS[record.animal_condition]}</Row>}
        {record.behavior && <Row label="Comportamento">{BEHAVIOR_LABELS[record.behavior]}</Row>}
        {record.author_name && <Row label="Registrado por">{record.author_name}</Row>}
      </div>

      {record.notes && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Observações</h3>
          <p>{record.notes}</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--linha)', fontSize: '0.86rem' }}>
      <span style={{ color: 'var(--tinta-fraca)' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{children}</span>
    </div>
  )
}
