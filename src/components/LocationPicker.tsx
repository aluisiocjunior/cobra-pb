import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { LocateFixed } from 'lucide-react'

// Ícone padrão do Leaflet não carrega os assets automaticamente com bundlers — configuramos manualmente.
const snakeIcon = L.divIcon({
  className: 'sighting-pin',
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#8C2F26;border:2px solid #EEE3C4;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
})

const PB_CENTER: [number, number] = [-7.12, -36.72] // centro aproximado da Paraíba

interface Props {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  onChange: (lat: number, lng: number, accuracy: number | null) => void
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({ latitude, longitude, accuracy, onChange }: Props) {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const position: [number, number] = latitude != null && longitude != null ? [latitude, longitude] : PB_CENTER

  useEffect(() => {
    if (latitude != null && longitude != null && mapRef.current) {
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom())
    }
  }, [latitude, longitude])

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada neste dispositivo.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy)
        setLocating(false)
      },
      () => {
        setError('Não foi possível obter sua localização. Ajuste o marcador manualmente no mapa.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--linha)' }}>
        <MapContainer
          center={position}
          zoom={latitude != null ? 15 : 7}
          style={{ height: 240, width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <ClickHandler onPick={(lat, lng) => onChange(lat, lng, null)} />
          {latitude != null && longitude != null && (
            <Marker
              position={[latitude, longitude]}
              icon={snakeIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker
                  const p = m.getLatLng()
                  onChange(p.lat, p.lng, null)
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: '0.6rem' }} onClick={useMyLocation} disabled={locating}>
        <LocateFixed size={16} /> {locating ? 'Localizando…' : 'Usar minha localização'}
      </button>

      {latitude != null && longitude != null && (
        <p className="field hint" style={{ fontFamily: 'var(--font-mono)' }}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
          {accuracy != null ? ` · precisão ±${Math.round(accuracy)}m` : ''}
        </p>
      )}
      {error && <p className="error-text">{error}</p>}
      <p className="field hint">Toque no mapa ou arraste o marcador para ajustar o local exato.</p>
    </div>
  )
}
