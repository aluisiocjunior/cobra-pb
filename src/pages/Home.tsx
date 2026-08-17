import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, MapPinned, Cross, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Species, SightingPublic, Stats } from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'

const HERO_SNAKE_IMG =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bothrops_erythromelas2.jpg/800px-Bothrops_erythromelas2.jpg'

export default function Home() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [species, setSpecies] = useState<Species[]>([])
  const [recent, setRecent] = useState<SightingPublic[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    let mounted = true
    async function load() {
      const [speciesRes, recentRes, statsRes] = await Promise.all([
        supabase.from('species').select('*').eq('active', true).limit(4),
        supabase.from('sightings_public').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('stats').select('*').maybeSingle(),
      ])
      if (!mounted) return
      setSpecies((speciesRes.data as Species[]) ?? [])
      setRecent((recentRes.data as SightingPublic[]) ?? [])
      setStats((statsRes.data as Stats) ?? null)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [isAuthenticated])

  if (authLoading) return null

  if (!isAuthenticated) {
    return (
      <div className="hero-landing">
        <div className="hero-panel">
          <h1 className="hero-title">É uma cobra venenosa?</h1>
          <svg className="hero-wave" viewBox="0 0 500 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,32 C90,58 170,4 250,22 C330,40 400,6 500,26 L500,60 L0,60 Z" />
          </svg>
        </div>
        <div className="hero-photo-wrap">
          <img src={HERO_SNAKE_IMG} alt="Jararaca-do-nordeste, uma das serpentes peçonhentas da Paraíba" className="hero-photo" />
        </div>
        <div className="hero-body">
          <h2>Saiba identificar cobras peçonhentas</h2>
          <p>
            E acesse orientações de primeiros socorros em caso de acidentes. Registre avistamentos e
            ajude a construir o mapa colaborativo de serpentes da Paraíba.
          </p>
          <Link to="/entrar" className="btn btn-primary hero-cta">Entrar</Link>
          <p className="hero-signup">Não tem conta? <Link to="/cadastrar">Cadastre-se gratuitamente</Link></p>
          <Link to="/o-que-fazer" className="hero-secondary-link">
            <ShieldAlert size={14} /> O que fazer ao ver uma cobra?
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <span className="eyebrow">Caderno de campo · Paraíba</span>
      <h1>É uma cobra venenosa?</h1>
      <p>
        Uma plataforma colaborativa para registrar avistamentos, identificar espécies e consultar
        onde as serpentes já foram vistas na Paraíba — para ajudar a prevenir acidentes e conhecer
        melhor a fauna local.
      </p>

      <div style={{ display: 'grid', gap: '0.6rem', margin: '1.2rem 0' }}>
        <Link to="/registrar" className="btn btn-primary">Registrar avistamento</Link>
        <Link to="/o-que-fazer" className="btn btn-outline">
          <ShieldAlert size={16} /> O que fazer ao ver uma cobra?
        </Link>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-box">
            <span className="n">{stats.total_sightings}</span>
            <span className="l">registros aprovados</span>
          </div>
          <div className="stat-box">
            <span className="n">{stats.total_species}</span>
            <span className="l">espécies no catálogo</span>
          </div>
          <div className="stat-box">
            <span className="n">{stats.municipalities}</span>
            <span className="l">municípios com registro</span>
          </div>
        </div>
      )}

      <div className="section-title">
        <h2>Espécies em destaque</h2>
        <Link to="/explorar">ver catálogo <ChevronRight size={12} style={{ verticalAlign: '-2px' }} /></Link>
      </div>
      {loading ? (
        <p className="center-note">Carregando espécies…</p>
      ) : (
        <div className="species-grid" style={{ marginBottom: '1.6rem' }}>
          {species.map((s) => (
            <Link to={`/explorar/especie/${s.id}`} className="species-card" key={s.id}>
              <div className="thumb">
                {s.image_url && <img src={s.image_url} alt={s.common_name} />}
              </div>
              <div className="body">
                <div className="common">{s.common_name}</div>
                <div className="sci">{s.scientific_name}</div>
                <SpeciesStamp venomous={s.venomous} confirmed size="sm" />
              </div>
            </Link>
          ))}
          {species.length === 0 && <p className="center-note">Nenhuma espécie cadastrada ainda.</p>}
        </div>
      )}

      <div className="section-title">
        <h2>Registros recentes</h2>
        <Link to="/explorar?tab=registros">ver todos <ChevronRight size={12} style={{ verticalAlign: '-2px' }} /></Link>
      </div>
      <div style={{ marginBottom: '1.6rem' }}>
        {recent.map((r) => (
          <Link to={`/registro/${r.id}`} className="list-row" key={r.id}>
            <div className="thumb" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {r.species_display_name ?? r.reported_name ?? 'Espécie não informada'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--tinta-fraca)' }}>{r.municipio ?? '—'}</div>
              <SpeciesStamp venomous={r.venomous_display} confirmed={r.identification_confirmed} size="sm" />
            </div>
          </Link>
        ))}
        {!loading && recent.length === 0 && <p className="center-note">Ainda não há registros publicados. Seja o primeiro a registrar um avistamento!</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <Link to="/mapa" className="btn btn-secondary">
          <MapPinned size={16} /> Mapa
        </Link>
        <Link to="/primeiros-socorros" className="btn btn-secondary">
          <Cross size={16} /> 1º socorros
        </Link>
      </div>
    </div>
  )
}
