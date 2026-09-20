import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPinned, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Species, SightingPublic } from '../lib/types'
import { useSightingFilters } from '../lib/useSightingFilters'
import SpeciesStamp from '../components/SpeciesStamp'
import SightingFilterPanel from '../components/SightingFilterPanel'
import SightingListItem from '../components/SightingListItem'

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'registros' ? 'registros' : 'catalogo'

  const [species, setSpecies] = useState<Species[]>([])
  const [sightings, setSightings] = useState<SightingPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    async function load() {
      if (tab === 'catalogo') {
        const { data } = await supabase.from('species').select('*').eq('active', true).overlaps('occurrence_regions',['Paraíba','Caatinga']).order('common_name')
        if (mounted) setSpecies((data as Species[]) ?? [])
      } else {
        const { data } = await supabase.from('sightings_public').select('*').order('created_at', { ascending: false })
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
  const f = useSightingFilters(sightings)

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
        {tab === 'catalogo' ? (
          <div className="field" style={{ position: 'relative', marginBottom: '0.7rem' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--cinza-fraco)' }} />
            <input
              className="input"
              style={{ paddingLeft: '2.1rem' }}
              placeholder="Buscar espécie…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        ) : (
          <>
            <button className="btn btn-outline btn-sm btn-auto" style={{ borderRadius: '8px', marginBottom: '0.7rem' }} onClick={() => setShowFilters((v) => !v)}>
              <Filter size={13} /> Filtros{f.activeFilterCount > 0 ? ` (${f.activeFilterCount})` : ''}
            </button>
            {showFilters && <SightingFilterPanel f={f} onClose={() => setShowFilters(false)} />}
          </>
        )}

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
        <div className="sighting-list">
          {f.filtered.map((r) => <SightingListItem sighting={r} showTime={false} key={r.id} />)}
          {f.filtered.length === 0 && <p className="center-note">{sightings.length === 0 ? 'Nenhum registro publicado ainda.' : 'Nenhum registro corresponde aos filtros selecionados.'}</p>}
        </div>
      )}
    </div>
  )
}
