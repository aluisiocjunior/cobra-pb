import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPinned } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Species, SightingPublic } from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'registros' ? 'registros' : 'catalogo'

  const [species, setSpecies] = useState<Species[]>([])
  const [sightings, setSightings] = useState<SightingPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      if (tab === 'catalogo') {
        const { data } = await supabase.from('species').select('*').eq('active', true).overlaps('occurrence_regions',['Paraíba','Caatinga']).order('common_name')
        if (mounted) setSpecies((data as Species[]) ?? [])
      } else {
        const { data } = await supabase.from('sightings_public').select('*').order('created_at', { ascending: false }).limit(50)
        if (mounted) setSightings((data as SightingPublic[]) ?? [])
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [tab])

  const filteredSpecies = useMemo(
    () => species.filter((s) => (s.common_name + s.scientific_name).toLowerCase().includes(query.toLowerCase())),
    [species, query],
  )
  const filteredSightings = useMemo(
    () => sightings.filter((s) => (s.municipio ?? '').toLowerCase().includes(query.toLowerCase())
      || (s.species_display_name ?? '').toLowerCase().includes(query.toLowerCase())),
    [sightings, query],
  )

  return (
    <div>
      <div className="page-header" style={{ paddingBottom: '0.8rem' }}>
        <h1>Explorar</h1>
      </div>

      <div className="tab-row">
        <button className={tab === 'catalogo' ? 'active' : ''} onClick={() => setParams({ tab: 'catalogo' })}>Catálogo</button>
        <button className={tab === 'registros' ? 'active' : ''} onClick={() => setParams({ tab: 'registros' })}>Registros</button>
      </div>

      <div style={{ padding: '0.8rem 1.1rem' }}>
        <div className="field" style={{ position: 'relative', marginBottom: '0.7rem' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--cinza-fraco)' }} />
          <input
            className="input"
            style={{ paddingLeft: '2.1rem' }}
            placeholder={tab === 'catalogo' ? 'Buscar espécie…' : 'Buscar por município ou espécie…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Link to="/mapa" className="btn btn-outline btn-sm btn-auto" style={{ borderRadius: '8px' }}>
          <MapPinned size={14} /> Ver no mapa
        </Link>
      </div>

      {loading && <p className="center-note">Carregando…</p>}

      {!loading && tab === 'catalogo' && (
        <div className="species-grid">
          {filteredSpecies.map((s) => (
            <Link to={`/explorar/especie/${s.id}`} className="species-card" key={s.id}>
              <div className="thumb">{s.image_url && <img src={s.image_url} alt={s.common_name} />}</div>
              <div className="body">
                <div className="common">{s.common_name}</div>
                <div className="sci">{s.scientific_name}</div>
                <SpeciesStamp venomous={s.venomous} confirmed size="sm" />
              </div>
            </Link>
          ))}
          {filteredSpecies.length === 0 && <p className="center-note">Nenhuma espécie encontrada.</p>}
        </div>
      )}

      {!loading && tab === 'registros' && (
        <div style={{ background: 'var(--branco)', borderTop: '1px solid var(--cinza-linha)' }}>
          {filteredSightings.map((r) => (
            <Link to={`/registro/${r.id}`} className="list-row" key={r.id}>
              <div className="thumb">{r.primary_photo_url && <img src={r.primary_photo_url} alt="" />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {r.species_display_name ?? r.reported_name ?? 'Espécie não informada'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cinza-fraco)' }}>
                  {r.municipio ?? '—'} · {r.observation_date ? new Date(r.observation_date).toLocaleDateString('pt-BR') : ''}
                </div>
                <SpeciesStamp venomous={r.venomous_display} confirmed={r.identification_confirmed} size="sm" />
              </div>
            </Link>
          ))}
          {filteredSightings.length === 0 && <p className="center-note">Nenhum registro publicado ainda.</p>}
        </div>
      )}
    </div>
  )
}
