import{useEffect,useState}from 'react'
import{Link}from 'react-router-dom'
import{ShieldAlert,MapPinned,BookOpen,ChevronRight,Compass}from 'lucide-react'
import{supabase}from '../lib/supabase'
import{useAuth}from '../context/AuthContext'
import type{SightingPublic,Stats}from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'
import InstallBanner from '../components/InstallBanner'

const HERO_COVER='/images/hero-cover.png'

function formatDateTime(date:string|null,time:string|null){
  if(!date)return null
  const d=new Date(date).toLocaleDateString('pt-BR')
  return time?`${d} · ${time.slice(0,5)}`:d
}

export default function Home(){
  const{isAuthenticated,loading:authLoading}=useAuth()
  const[recent,setRecent]=useState<SightingPublic[]>([])
  const[stats,setStats]=useState<Stats|null>(null)
  const[loading,setLoading]=useState(true)
  useEffect(()=>{
    if(!isAuthenticated){setLoading(false);return}
    let mounted=true
    async function load(){
      const[rr,str]=await Promise.all([
        supabase.from('sightings_public').select('*').order('created_at',{ascending:false}).limit(6),
        supabase.from('stats').select('*').maybeSingle()
      ])
      if(!mounted)return
      setRecent((rr.data as SightingPublic[])??[])
      setStats((str.data as Stats)??null)
      setLoading(false)
    }
    load()
    return()=>{mounted=false}
  },[isAuthenticated])
  if(authLoading)return null

  /* ── LANDING (visitante não autenticado) ── */
  if(!isAuthenticated)return(
    <div className="hero-landing">
      <div className="hero-cover-wrap">
        <img src={HERO_COVER} alt="É uma cobra venenosa? Saiba identificar cobras peçonhentas e opções de primeiros socorros." className="hero-cover-img" loading="eager"/>
        <Link to="/entrar" className="hero-cover-cta" aria-label="Entrar"/>
      </div>
      <div className="hero-below">
        <p className="hero-signup">Não tem conta? <Link to="/cadastrar">Cadastre-se gratuitamente</Link></p>
        <Link to="/explorar" className="hero-secondary-link" style={{marginBottom:'0.9rem'}}>
          <Compass size={14}/> Explorar catálogo de espécies
        </Link>
        <Link to="/o-que-fazer" className="hero-secondary-link">
          <ShieldAlert size={14}/> O que fazer ao ver uma cobra?
        </Link>
      </div>
    </div>
  )

  /* ── DASHBOARD (autenticado) ── */
  const featured=recent.slice(0,4)
  return(
    <div style={{paddingBottom:'1rem'}}>
      <div style={{background:'var(--vermelho)',padding:'1.5rem 1.1rem 1.2rem'}}>
        <p style={{color:'rgba(255,255,255,0.8)',fontSize:'0.78rem',margin:'0 0 0.2rem',fontWeight:600}}>Caderno de campo · Paraíba</p>
        <h1 style={{color:'var(--branco)',margin:0,fontSize:'1.55rem'}}>É uma cobra venenosa?</h1>
      </div>
      <div style={{paddingTop:'1rem'}}><InstallBanner/></div>
      {stats&&(
        <div className="stat-grid" style={{padding:'1rem 1.1rem 0',marginBottom:0}}>
          <Link to="/explorar?tab=registros" className="stat-box" style={{textDecoration:'none',display:'block'}}><span className="n">{stats.total_sightings}</span><span className="l">registros</span></Link>
          <Link to="/explorar" className="stat-box" style={{textDecoration:'none',display:'block'}}><span className="n">{stats.total_species}</span><span className="l">espécies</span></Link>
          <Link to="/mapa" className="stat-box" style={{textDecoration:'none',display:'block'}}><span className="n">{stats.municipalities}</span><span className="l">municípios</span></Link>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem',padding:'1rem 1.1rem'}}>
        <Link to="/registrar" className="btn btn-vermelho" style={{borderRadius:'var(--radius-md)',flexDirection:'column',gap:'0.2rem',padding:'0.9rem'}}>
          <span style={{fontSize:'1.3rem'}}>📷</span>
          <span style={{fontSize:'0.8rem',fontWeight:700}}>Registrar</span>
        </Link>
        <Link to="/o-que-fazer" className="btn btn-secondary" style={{borderRadius:'var(--radius-md)',flexDirection:'column',gap:'0.2rem',padding:'0.9rem',border:'1px solid var(--cinza-linha)'}}>
          <ShieldAlert size={20} color="var(--vermelho)"/>
          <span style={{fontSize:'0.8rem',fontWeight:700,color:'var(--preto)'}}>O que fazer</span>
        </Link>
      </div>
      <div className="section-title">
        <h2>Espécies em destaque</h2>
        <Link to="/explorar?tab=registros">ver todos <ChevronRight size={12} style={{verticalAlign:'-2px'}}/></Link>
      </div>
      {loading?<p className="center-note">Carregando…</p>:(
        <div className="species-grid" style={{marginBottom:'1.4rem'}}>
          {featured.map((r)=>(
            <Link to={`/registro/${r.id}`} className="species-card" key={r.id}>
              <div className="thumb">{r.primary_photo_url&&<img src={r.primary_photo_url} alt={r.species_display_name??''}/>}</div>
              <div className="body">
                <div className="common">{r.species_display_name??r.reported_name??'Não identificada'}</div>
                <div className="sci" style={{fontStyle:'normal'}}>{r.municipio??'—'}{formatDateTime(r.observation_date,r.observation_time)&&` · ${formatDateTime(r.observation_date,r.observation_time)}`}</div>
                <SpeciesStamp venomous={r.venomous_display} confirmed={r.identification_confirmed} size="sm"/>
              </div>
            </Link>
          ))}
          {featured.length===0&&<p className="center-note" style={{gridColumn:'1/-1'}}>Ainda não há registros aprovados.</p>}
        </div>
      )}
      <div className="section-title">
        <h2>Registros recentes</h2>
        <Link to="/explorar?tab=registros">ver todos <ChevronRight size={12} style={{verticalAlign:'-2px'}}/></Link>
      </div>
      <div style={{background:'var(--branco)',borderTop:'1px solid var(--cinza-linha)',marginBottom:'1rem'}}>
        {recent.map((r)=>(
          <Link to={`/registro/${r.id}`} className="list-row" key={r.id}>
            <div className="thumb">{r.primary_photo_url&&<img src={r.primary_photo_url} alt=""/>}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:'0.9rem',color:'var(--preto)'}}>{r.species_display_name??r.reported_name??'Espécie não informada'}</div>
              <div style={{fontSize:'0.78rem',color:'var(--cinza-fraco)'}}>{r.municipio??'—'}{formatDateTime(r.observation_date,r.observation_time)&&` · ${formatDateTime(r.observation_date,r.observation_time)}`}</div>
              <SpeciesStamp venomous={r.venomous_display} confirmed={r.identification_confirmed} size="sm"/>
            </div>
          </Link>
        ))}
        {!loading&&recent.length===0&&<p className="center-note">Ainda não há registros publicados.</p>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem',padding:'0 1.1rem'}}>
        <Link to="/mapa" className="btn btn-secondary" style={{borderRadius:'var(--radius-md)'}}><MapPinned size={16}/> Mapa</Link>
        <Link to="/primeiros-socorros" className="btn btn-secondary" style={{borderRadius:'var(--radius-md)'}}><BookOpen size={16}/> Socorros</Link>
      </div>
    </div>
  )
}
