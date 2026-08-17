import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CircleHelp, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Species, AnimalCondition, Behavior, SightingStatus } from '../lib/types'
import { ANIMAL_CONDITION_LABELS, BEHAVIOR_LABELS, STATUS_LABELS } from '../lib/types'
import LocationPicker from '../components/LocationPicker'
import PhotoUploader, { type PendingMedia } from '../components/PhotoUploader'

const EDITABLE_STATUSES: SightingStatus[] = ['aguardando_revisao', 'correcao_solicitada']

function extractStoragePath(publicUrl: string): string | null {
  const marker = '/sighting-photos/'
  const idx = publicUrl.indexOf(marker)
  return idx === -1 ? null : publicUrl.slice(idx + marker.length)
}

const STEPS = ['Animal', 'Local', 'Quando', 'Ambiente', 'Condição', 'Mídia', 'Revisão']

const LOCATION_TYPES = ['Urbano', 'Quintal/Casa', 'Rural', 'Mata/Floresta', 'Área agrícola', 'Beira de rio/açude', 'Outro']
const VEGETATION_TYPES = ['Mata Atlântica', 'Caatinga', 'Brejo de altitude', 'Área urbana', 'Área agrícola/rural', 'Restinga/litoral', 'Outro']
const SEASONS = ['Verão', 'Outono', 'Inverno', 'Primavera']
const WEATHER = ['Ensolarado', 'Nublado', 'Chuvoso', 'Após chuva', 'Seco/estiagem', 'Outro']
const DAY_PERIODS = ['Manhã', 'Tarde', 'Noite', 'Madrugada']
const ANIMAL_CONDITIONS: AnimalCondition[] = ['vivo', 'ferido', 'morto', 'aparentemente_saudavel', 'nao_avaliado']
const BEHAVIORS: Behavior[] = ['parado', 'fugindo', 'defensivo', 'escondido', 'agressivo', 'outro']

function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}
function nowStr() {
  const d = new Date()
  return d.toTimeString().slice(0, 5)
}
function slugify(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase()
}

export default function RegisterSighting() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id: string }>()
  const isEdit = !!editId

  const [step, setStep] = useState(0)
  const [species, setSpecies] = useState<Species[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const [loadingRecord, setLoadingRecord] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const initialPhotosById = useRef<Record<string, string>>({})
  const initialExistingIds = useRef<Set<string>>(new Set())

  const [suggestedSpeciesId, setSuggestedSpeciesId] = useState('')
  const [dontKnow, setDontKnow] = useState(false)
  const [freeText, setFreeText] = useState('')

  const [municipio, setMunicipio] = useState('')
  const [localidade, setLocalidade] = useState('')
  const [localEspecifico, setLocalEspecifico] = useState('')
  const [locationType, setLocationType] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null)

  const [obsDate, setObsDate] = useState(todayStr())
  const [obsTime, setObsTime] = useState(nowStr())

  const [vegetationType, setVegetationType] = useState('')
  const [season, setSeason] = useState('')
  const [weatherCondition, setWeatherCondition] = useState('')
  const [dayPeriod, setDayPeriod] = useState('')

  const [animalCondition, setAnimalCondition] = useState<AnimalCondition | ''>('')
  const [behavior, setBehavior] = useState<Behavior | ''>('')

  const [media, setMedia] = useState<PendingMedia[]>([])
  const [notes, setNotes] = useState('')
  const [shareContact, setShareContact] = useState(profile?.phone_public ?? false)

  useEffect(() => {
    supabase.from('species').select('*').eq('active', true).order('common_name').then(({ data }) => {
      setSpecies((data as Species[]) ?? [])
    })
  }, [])

  useEffect(() => {
    if (!isEdit || !editId || !session) return
    let mounted = true
    async function loadForEdit() {
      const { data: rec, error } = await supabase.from('sightings').select('*').eq('id', editId).maybeSingle()
      if (!mounted) return
      if (error || !rec) {
        setLoadError('Registro não encontrado.')
        setLoadingRecord(false)
        return
      }
      if (rec.user_id !== session!.user.id) {
        setLoadError('Você só pode editar seus próprios registros.')
        setLoadingRecord(false)
        return
      }
      if (!EDITABLE_STATUSES.includes(rec.status)) {
        setLoadError(`Este registro está em "${STATUS_LABELS[rec.status as SightingStatus]}" e não pode mais ser editado.`)
        setLoadingRecord(false)
        return
      }

      setSuggestedSpeciesId(rec.suggested_species_id ?? '')
      setDontKnow(rec.dont_know_species ?? false)
      setFreeText(rec.dont_know_species ? (rec.reported_name ?? '') : '')
      setMunicipio(rec.municipio ?? '')
      setLocalidade(rec.localidade ?? '')
      setLocalEspecifico(rec.local_especifico ?? '')
      setLocationType(rec.location_type ?? '')
      setLatitude(rec.latitude)
      setLongitude(rec.longitude)
      setGpsAccuracy(rec.gps_accuracy_m)
      setObsDate(rec.observation_date ?? todayStr())
      setObsTime(rec.observation_time ?? nowStr())
      setVegetationType(rec.vegetation_type ?? '')
      setSeason(rec.season ?? '')
      setWeatherCondition(rec.weather_condition ?? '')
      setDayPeriod(rec.day_period ?? '')
      setAnimalCondition((rec.animal_condition as AnimalCondition) ?? '')
      setBehavior((rec.behavior as Behavior) ?? '')
      setNotes(rec.notes ?? '')
      setShareContact(rec.share_contact ?? false)

      const { data: photos } = await supabase.from('sighting_photos').select('*').eq('sighting_id', editId).order('order_index')
      if (!mounted) return
      const existingMedia: PendingMedia[] = (photos ?? []).map((p) => ({
        existingId: p.id,
        previewUrl: p.url,
        mediaType: p.media_type,
      }))
      initialPhotosById.current = Object.fromEntries((photos ?? []).map((p) => [p.id, p.url]))
      initialExistingIds.current = new Set((photos ?? []).map((p) => p.id))
      setMedia(existingMedia)
      setLoadingRecord(false)
    }
    loadForEdit()
    return () => { mounted = false }
  }, [isEdit, editId, session])

  const stepValid = (() => {
    switch (step) {
      case 0: return dontKnow || !!suggestedSpeciesId
      case 1: return municipio.trim().length > 0 && latitude != null && longitude != null
      case 2: return !!obsDate
      default: return true
    }
  })()

  async function handleSubmit() {
    if (!session) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const selectedSpecies = species.find((s) => s.id === suggestedSpeciesId)
      const payload = {
        suggested_species_id: dontKnow ? null : suggestedSpeciesId || null,
        dont_know_species: dontKnow,
        reported_name: dontKnow ? freeText.trim() : (selectedSpecies?.common_name ?? ''),
        municipio: municipio.trim(),
        localidade: localidade.trim() || null,
        local_especifico: localEspecifico.trim() || null,
        location_type: locationType || null,
        latitude,
        longitude,
        gps_accuracy_m: gpsAccuracy,
        observation_date: obsDate,
        observation_time: obsTime,
        vegetation_type: vegetationType || null,
        season: season || null,
        weather_condition: weatherCondition || null,
        day_period: dayPeriod || null,
        animal_condition: animalCondition || null,
        behavior: behavior || null,
        notes: notes.trim() || null,
        share_contact: shareContact,
        has_video: media.some((m) => m.mediaType === 'video'),
      }

      let sightingId: string

      if (isEdit && editId) {
        const { error } = await supabase.from('sightings').update(payload).eq('id', editId)
        if (error) throw error
        sightingId = editId

        // remove fotos/vídeos excluídos pelo usuário (registro + arquivo no storage)
        const currentExistingIds = new Set(media.filter((m) => m.existingId).map((m) => m.existingId as string))
        const removedIds = [...initialExistingIds.current].filter((rid) => !currentExistingIds.has(rid))
        for (const remId of removedIds) {
          const removedUrl = initialPhotosById.current[remId]
          await supabase.from('sighting_photos').delete().eq('id', remId)
          if (removedUrl) {
            const path = extractStoragePath(removedUrl)
            if (path) await supabase.storage.from('sighting-photos').remove([path])
          }
        }
      } else {
        const { data: row, error } = await supabase
          .from('sightings')
          .insert({ ...payload, user_id: session.user.id, status: 'aguardando_revisao' })
          .select()
          .single()
        if (error) throw error
        sightingId = row.id
      }

      // envia mídia nova (itens sem existingId) e recalcula ordem/principal para todo o conjunto
      for (let i = 0; i < media.length; i++) {
        const m = media[i]
        if (m.existingId) {
          await supabase.from('sighting_photos').update({ is_primary: i === 0, order_index: i }).eq('id', m.existingId)
          continue
        }
        if (!m.file) continue
        const path = `${session.user.id}/${sightingId}/${Date.now()}-${i}-${slugify(m.file.name)}`
        const { error: upErr } = await supabase.storage.from('sighting-photos').upload(path, m.file, {
          contentType: m.file.type,
          upsert: false,
        })
        if (upErr) continue
        const { data: pub } = supabase.storage.from('sighting-photos').getPublicUrl(path)
        await supabase.from('sighting_photos').insert({
          sighting_id: sightingId,
          url: pub.publicUrl,
          media_type: m.mediaType,
          is_primary: i === 0,
          order_index: i,
        })
      }

      setDone(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível enviar o registro. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingRecord) {
    return <p className="center-note">Carregando registro…</p>
  }

  if (loadError) {
    return (
      <div className="center-note" style={{ paddingTop: '2rem' }}>
        <p>{loadError}</p>
        <button className="btn btn-outline btn-auto" onClick={() => navigate('/perfil?tab=meus-registros')}>Voltar para meus registros</button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="center-note" style={{ paddingTop: '3rem' }}>
        <CheckCircle2 size={48} color="var(--verde-mata)" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ color: 'var(--tinta)' }}>{isEdit ? 'Registro atualizado!' : 'Registro enviado!'}</h1>
        <p>
          {isEdit
            ? 'Suas alterações foram salvas. O registro segue no fluxo de moderação.'
            : (<>Seu avistamento foi enviado e está <strong>aguardando revisão</strong> da moderação. Assim que for aprovado, ele aparecerá no mapa e no catálogo público.</>)}
        </p>
        <div style={{ display: 'grid', gap: '0.6rem', maxWidth: 280, margin: '1rem auto 0' }}>
          <button className="btn btn-primary" onClick={() => navigate('/perfil?tab=meus-registros')}>Ver meus registros</button>
          {!isEdit && <button className="btn btn-outline" onClick={() => window.location.reload()}>Registrar outro avistamento</button>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>{isEdit ? 'Editar avistamento' : 'Registrar avistamento'}</h1>

      <div className="stepper">
        {STEPS.map((_, i) => (
          <div key={i} className={`dot ${i < step ? 'done' : i === step ? 'current' : ''}`} />
        ))}
      </div>
      <span className="step-label">Etapa {step + 1} de {STEPS.length} · {STEPS[step]}</span>

      <div className="card" style={{ marginTop: '0.6rem', marginBottom: '1.2rem' }}>
        {step === 0 && (
          <div>
            <div className="field">
              <label>Espécie sugerida</label>
              <select className="input" value={suggestedSpeciesId} disabled={dontKnow}
                onChange={(e) => setSuggestedSpeciesId(e.target.value)}>
                <option value="">Selecione, se souber…</option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>{s.common_name} ({s.scientific_name})</option>
                ))}
              </select>
              <p className="hint">
                <CircleHelp size={12} style={{ verticalAlign: '-2px' }} /> Esta é apenas uma sugestão.
                A classificação oficial (peçonhenta ou não) será definida por um moderador/especialista.
              </p>
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={dontKnow} onChange={(e) => { setDontKnow(e.target.checked); if (e.target.checked) setSuggestedSpeciesId('') }} />
                Não sei identificar
              </label>
            </div>

            {dontKnow && (
              <div className="field">
                <label>Descreva o que você viu (opcional)</label>
                <input className="input" value={freeText} onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Ex.: cobra marrom com listras, cerca de 1m" />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="field">
              <label>Município *</label>
              <input className="input" value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Ex.: Campina Grande" />
            </div>
            <div className="field">
              <label>Localidade / bairro</label>
              <input className="input" value={localidade} onChange={(e) => setLocalidade(e.target.value)} placeholder="Ex.: Distrito de Galante" />
            </div>
            <div className="field">
              <label>Local específico</label>
              <input className="input" value={localEspecifico} onChange={(e) => setLocalEspecifico(e.target.value)} placeholder="Ex.: quintal de casa, próximo ao açude" />
            </div>
            <div className="field">
              <label>Tipo de ambiente</label>
              <ChipGroup options={LOCATION_TYPES} value={locationType} onChange={setLocationType} />
            </div>
            <div className="field">
              <label>Localização no mapa *</label>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                accuracy={gpsAccuracy}
                onChange={(lat, lng, acc) => { setLatitude(lat); setLongitude(lng); setGpsAccuracy(acc) }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="field">
              <label>Data do avistamento *</label>
              <input type="date" className="input" value={obsDate} onChange={(e) => setObsDate(e.target.value)} max={todayStr()} />
            </div>
            <div className="field">
              <label>Horário</label>
              <input type="time" className="input" value={obsTime} onChange={(e) => setObsTime(e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="field">
              <label>Tipo de vegetação</label>
              <ChipGroup options={VEGETATION_TYPES} value={vegetationType} onChange={setVegetationType} />
            </div>
            <div className="field">
              <label>Estação do ano</label>
              <ChipGroup options={SEASONS} value={season} onChange={setSeason} />
            </div>
            <div className="field">
              <label>Condições climáticas</label>
              <ChipGroup options={WEATHER} value={weatherCondition} onChange={setWeatherCondition} />
            </div>
            <div className="field">
              <label>Período do dia</label>
              <ChipGroup options={DAY_PERIODS} value={dayPeriod} onChange={setDayPeriod} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="field">
              <label>Condição do animal</label>
              <ChipGroup options={ANIMAL_CONDITIONS} value={animalCondition} onChange={(v) => setAnimalCondition(v as AnimalCondition)}
                labels={ANIMAL_CONDITION_LABELS} />
            </div>
            <div className="field">
              <label>Comportamento</label>
              <ChipGroup options={BEHAVIORS} value={behavior} onChange={(v) => setBehavior(v as Behavior)}
                labels={BEHAVIOR_LABELS} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="field">
              <label>Fotos, vídeos e anexos</label>
              <PhotoUploader items={media} onChange={setMedia} />
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <div className="field">
              <label>Observações</label>
              <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Informações adicionais sobre o avistamento…" />
            </div>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={shareContact} onChange={(e) => setShareContact(e.target.checked)} />
                Permitir que outros usuários cadastrados vejam meu contato neste registro
              </label>
            </div>

            <div className="banner banner-info" style={{ fontSize: '0.82rem' }}>
              Município: <strong>{municipio || '—'}</strong> · Data: <strong>{obsDate}</strong><br />
              Espécie sugerida: <strong>{dontKnow ? 'Não identificada' : (species.find((s) => s.id === suggestedSpeciesId)?.common_name ?? '—')}</strong><br />
              Mídia anexada: <strong>{media.length}</strong> arquivo(s)
            </div>

            {submitError && <p className="error-text">{submitError}</p>}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        {step > 0 && (
          <button className="btn btn-outline" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!stepValid}>
            Avançar <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Enviar registro'}
          </button>
        )}
      </div>
    </div>
  )
}

function ChipGroup<T extends string>({ options, value, onChange, labels }: {
  options: T[]; value: string; onChange: (v: T) => void; labels?: Record<string, string>
}) {
  return (
    <div className="choice-grid">
      {options.map((opt) => (
        <div key={opt} className={`choice-chip ${value === opt ? 'selected' : ''}`} onClick={() => onChange(value === opt ? ('' as T) : opt)}>
          {labels?.[opt] ?? opt}
        </div>
      ))}
    </div>
  )
}
