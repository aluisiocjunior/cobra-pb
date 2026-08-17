import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { SightingPublic } from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'

const PB_CENTER: [number, number] = [-7.12, -36.72]

function pinIcon(venomous: boolean | null | undefined, confirmed: boolean) {
  const color = !confirmed ? '#6B6252' : venomous ? '#8C2F26' : '#2F5233'
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #EEE3C4;transform:rotate(-45deg);box-shadow:0 2px 5px rgba(0,0,0,0.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  })
}

export default function MapPage() {
  const [sightings, setSightings] = useState<SightingPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('sightings_public').select('*').not('latitude', 'is', null).then(({ data }) => {
      setSightings((data as SightingPublic[]) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1>Mapa de avistamentos</h1>
      <p style={{ fontSize: '0.88rem' }}>
        Registros aprovados na Paraíba. Por segurança, a localização mostrada é aproximada.
      </p>

      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--linha)', marginBottom: '1rem' }}>
        <MapContainer center={PB_CENTER} zoom={8} style={{ height: '60vh', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          {sightings.map((s) => (
            s.latitude != null && s.longitude != null && (
              <Marker key={s.id} position={[s.latitude, s.longitude]} icon={pinIcon(s.venomous_display, s.identification_confirmed)}>
                <Popup>
                  <div style={{ fontFamily: 'var(--font-body)', minWidth: 160 }}>
                    <strong>{s.species_display_name ?? s.reported_name ?? 'Não identificada'}</strong>
                    <div style={{ margin: '0.3rem 0' }}>
                      <SpeciesStamp venomous={s.venomous_display} confirmed={s.identification_confirmed} size="sm" />
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>{s.municipio}</div>
                    <Link to={`/registro/${s.id}`} style={{ fontSize: '0.78rem' }}>Ver registro completo →</Link>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {!loading && sightings.length === 0 && (
        <p className="center-note">Ainda não há registros aprovados no mapa.</p>
      )}
      <p className="field hint">
        Agrupamento de marcadores e filtros avançados (espécie, classificação, vegetação, período) chegam na próxima etapa.
      </p>
    </div>
  )
}
