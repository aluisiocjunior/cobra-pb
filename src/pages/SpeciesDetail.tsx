import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Species, SpeciesPhoto, SightingPublic } from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'

export default function SpeciesDetail() {
  const { id } = useParams()
  const [species, setSpecies] = useState<Species | null>(null)
  const [photos, setPhotos] = useState<SpeciesPhoto[]>([])
  const [sightings, setSightings] = useState<SightingPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let mounted = true
    async function load() {
      const [speciesRes, photosRes, sightingsRes] = await Promise.all([
        supabase.from('species').select('*').eq('id', id).maybeSingle(),
        supabase.from('species_photos').select('*').eq('species_id', id).order('order_index'),
        supabase.from('sightings_public').select('*').eq('confirmed_species_id', id),
      ])
      if (!mounted) return
      setSpecies(speciesRes.data as Species | null)
      setPhotos((photosRes.data as SpeciesPhoto[]) ?? [])
      setSightings((sightingsRes.data as SightingPublic[]) ?? [])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <p className="center-note">Carregando…</p>
  if (!species) return <p className="center-note">Espécie não encontrada.</p>

  const municipios = [...new Set(sightings.map((s) => s.municipio).filter(Boolean))] as string[]

  return (
    <div>
      <Link to="/explorar" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>&larr; Catálogo</Link>

      <div className="card" style={{ marginTop: '0.8rem', marginBottom: '1rem', padding: 0, overflow: 'hidden' }}>
        <div style={{ aspectRatio: '4/3', background: 'var(--verde-mata-3)' }}>
          {species.image_url && <img src={species.image_url} alt={species.common_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ padding: '1rem' }}>
          <SpeciesStamp venomous={species.venomous} confirmed />
          <h1 style={{ marginTop: '0.5rem' }}>{species.common_name}</h1>
          <p style={{ fontStyle: 'italic', color: 'var(--tinta-fraca)', marginTop: '-0.6rem' }}>
            {species.scientific_name} {species.family ? `· ${species.family}` : ''}
          </p>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="photo-grid" style={{ marginBottom: '1.2rem' }}>
          {photos.map((p) => (
            <div className="photo-tile" key={p.id}><img src={p.url} alt={species.common_name} /></div>
          ))}
        </div>
      )}

      {species.description && <Section title="Sobre">{species.description}</Section>}
      {species.identification_features && <Section title="Características de identificação">{species.identification_features}</Section>}
      {species.habitat && <Section title="Habitat">{species.habitat}</Section>}
      {species.occurrence_regions?.length > 0 && (
        <Section title="Regiões de ocorrência na Paraíba">{species.occurrence_regions.join(', ')}</Section>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="stat-box">
          <span className="n">{sightings.length}</span>
          <span className="l">registros confirmados</span>
        </div>
        <div className="stat-box">
          <span className="n">{municipios.length}</span>
          <span className="l">municípios</span>
        </div>
      </div>

      {municipios.length > 0 && <Section title="Municípios com registro">{municipios.join(', ')}</Section>}

      {species.references_list?.length > 0 && (
        <Section title="Referências">
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            {species.references_list.map((r, i) => <li key={i} style={{ fontSize: '0.85rem' }}>{r}</li>)}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <h3>{title}</h3>
      <p style={{ fontSize: '0.92rem' }}>{children}</p>
    </div>
  )
}
