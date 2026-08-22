import{useEffect,useState}from 'react'
import{useParams,Link}from 'react-router-dom'
import{supabase}from '../lib/supabase'
import{useAuth}from '../context/AuthContext'
import type{SightingPublic,SightingPhoto}from '../lib/types'
import{ANIMAL_CONDITION_LABELS,BEHAVIOR_LABELS,STATUS_LABELS,type SightingStatus}from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'
export default function RecordDetail(){
  const{id}=useParams();const{isModeratorOrAdmin}=useAuth()
  const[record,setRecord]=useState<(SightingPublic&{status?:SightingStatus})|null>(null)
  const[photos,setPhotos]=useState<SightingPhoto[]>([]);const[loading,setLoading]=useState(true);const[notFound,setNotFound]=useState(false)
  useEffect(()=>{
    if(!id)return;let mounted=true
    async function load(){
      const pub=await supabase.from('sightings_public').select('*').eq('id',id).maybeSingle()
      if(pub.data){if(!mounted)return;setRecord(pub.data as SightingPublic)}
      else{
        const own=await supabase.from('sightings').select('*,suggested:species!sightings_species_id_fkey(common_name,venomous),confirmed:species!sightings_confirmed_species_id_fkey(common_name,venomous)').eq('id',id).maybeSingle()
        if(!mounted)return
        if(!own.data){setNotFound(true);setLoading(false);return}
        const d=own.data as unknown as Record<string,unknown>&{suggested:{common_name:string;venomous:boolean}|null;confirmed:{common_name:string;venomous:boolean}|null}
        setRecord({id:d.id as string,municipio:d.municipio as string|null,localidade:d.localidade as string|null,location_type:d.location_type as string|null,latitude:d.latitude as number|null,longitude:d.longitude as number|null,observation_date:d.observation_date as string|null,observation_time:d.observation_time as string|null,vegetation_type:d.vegetation_type as string|null,season:d.season as string|null,weather_condition:d.weather_condition as string|null,day_period:d.day_period as string|null,animal_condition:d.animal_condition as SightingPublic['animal_condition'],behavior:d.behavior as SightingPublic['behavior'],notes:d.notes as string|null,reported_name:d.reported_name as string|null,dont_know_species:d.dont_know_species as boolean,suggested_species_id:d.suggested_species_id as string|null,confirmed_species_id:d.confirmed_species_id as string|null,species_display_name:d.confirmed?.common_name??d.suggested?.common_name??null,venomous_display:d.confirmed?.venomous??d.suggested?.venomous??null,identification_confirmed:!!d.confirmed_species_id,author_name:null,created_at:d.created_at as string,view_count:(d.view_count as number)??0,status:d.status as SightingStatus})
      }
      const ph=await supabase.from('sighting_photos').select('*').eq('sighting_id',id).order('order_index')
      if(mounted){setPhotos((ph.data as SightingPhoto[])??[]);setLoading(false)}
    }
    load();return()=>{mounted=false}
  },[id])
  if(loading)return <p className="center-note">Carregando…</p>
  if(notFound||!record)return <p className="center-note">Registro não encontrado.</p>
  return(
    <div>
      <div style={{background:'var(--branco)'}}>
        {photos.length>0
          ?(<div style={{display:'grid',gridTemplateColumns:photos.length===1?'1fr':'1fr 1fr',gap:2}}>{photos.map((p)=>(<div key={p.id} style={{aspectRatio:'4/3',overflow:'hidden',background:'var(--fundo)'}}>{p.media_type==='video'?<video src={p.url} controls style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<img src={p.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}</div>))}</div>)
          :(<div style={{height:180,background:'var(--fundo)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--cinza-fraco)',fontSize:'0.88rem'}}>Sem foto</div>)
        }
      </div>
      <div className="page">
        <SpeciesStamp venomous={record.venomous_display} confirmed={record.identification_confirmed}/>
        {record.status&&isModeratorOrAdmin&&<span className="status-tag" style={{marginLeft:'0.5rem',background:'var(--amarelo-bg)',color:'var(--amarelo-alerta)'}}>{STATUS_LABELS[record.status]}</span>}
        <h1 style={{marginTop:'0.5rem'}}>{record.species_display_name??record.reported_name??'Espécie não informada'}</h1>
        {!record.identification_confirmed&&<p style={{fontSize:'0.82rem',color:'var(--cinza-fraco)',margin:'0 0 1rem'}}>Sugestão do usuário — não confirmada oficialmente.</p>}
        <div style={{display:'grid',gap:'0.4rem',marginBottom:'1rem'}}>
          <R l="Município">{record.municipio??'—'}</R>
          {record.localidade&&<R l="Localidade">{record.localidade}</R>}
          <R l="Data">{record.observation_date?new Date(record.observation_date).toLocaleDateString('pt-BR'):'—'}</R>
          {record.vegetation_type&&<R l="Vegetação">{record.vegetation_type}</R>}
          {record.animal_condition&&<R l="Condição">{ANIMAL_CONDITION_LABELS[record.animal_condition]}</R>}
          {record.behavior&&<R l="Comportamento">{BEHAVIOR_LABELS[record.behavior]}</R>}
          {record.author_name&&<R l="Registrado por">{record.author_name}</R>}
        </div>
        {record.notes&&(<div style={{marginTop:'0.5rem'}}><h3 style={{color:'var(--cinza-fraco)',fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Observações</h3><p>{record.notes}</p></div>)}
        <Link to="/explorar?tab=registros" style={{fontSize:'0.82rem',fontWeight:600}}>← Registros</Link>
      </div>
    </div>
  )
}
function R({l,children}:{l:string;children:React.ReactNode}){return(<div style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid var(--cinza-linha)',fontSize:'0.88rem'}}><span style={{color:'var(--cinza-fraco)',fontWeight:600}}>{l}</span><span style={{fontWeight:700,textAlign:'right'}}>{children}</span></div>)}
