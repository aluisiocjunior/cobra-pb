import { Link } from 'react-router-dom'
import SpeciesStamp from './SpeciesStamp'
import type { SightingPublic } from '../lib/types'

export function formatSightingDateTime(date: string | null, time: string | null): string | null {
  if (!date) return null
  const formatted = new Date(date).toLocaleDateString('pt-BR')
  return time ? `${formatted} · ${time.slice(0, 5)}` : formatted
}

interface Props {
  sighting: SightingPublic
  showTime?: boolean
}

/**
 * Uma linha de avistamento (foto, espécie, município, data, selo peçonhenta/não).
 * Usado em Home ("Registros recentes") e Explore ("Registros") — antes essa marcação
 * existia duplicada e levemente divergente nos dois arquivos.
 */
export default function SightingListItem({ sighting, showTime = true }: Props) {
  const dateLabel = showTime
    ? formatSightingDateTime(sighting.observation_date, sighting.observation_time)
    : sighting.observation_date
      ? new Date(sighting.observation_date).toLocaleDateString('pt-BR')
      : null
  const subtitle = [sighting.municipio ?? '—', dateLabel].filter(Boolean).join(' · ')
  return (
    <Link to={`/registro/${sighting.id}`} className="list-row">
      <div className="thumb">{sighting.primary_photo_url && <img src={sighting.primary_photo_url} alt="" />}</div>
      <div style={{ flex: 1 }}>
        <div className="list-row-title">{sighting.species_display_name ?? sighting.reported_name ?? 'Espécie não informada'}</div>
        <div className="list-row-subtitle">{subtitle}</div>
        <SpeciesStamp venomous={sighting.venomous_display} confirmed={sighting.identification_confirmed} size="sm" />
      </div>
    </Link>
  )
}
