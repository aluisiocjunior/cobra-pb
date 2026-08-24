import{useEffect,useMemo,useState}from 'react'
import{MapContainer,TileLayer,useMap}from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import{Filter,X}from 'lucide-react'
import{supabase}from '../lib/supabase'
import type{SightingPublic,Species}from '../lib/types'

const PB:[number,number]=[-7.12,-36.72]

function pin(v:boolean|null|undefined,c:boolean){
  const col=!c?'#888':v?'#E5000F':'#1a6b2f'
  return L.divIcon({className:'',html:`<div style="width:22px;height:22px;border-radius:50%;background:${col};border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,iconSize:[22,22],iconAnchor:[11,11]})
}

function ClusterLayer({sightings}:{sightings:SightingPublic[]}){
  const map=useMap()
  useEffect(()=>{
    const group=(L as unknown as {markerClusterGroup:()=>L.LayerGroup}).markerClusterGroup()
    sightings.forEach((s)=>{
      if(s.latitude==null||s.longitude==null)return
      const marker=L.marker([s.latitude,s.longitude],{icon:pin(s.venomous_display,s.identification_confirmed)})
      const el=document.createElement('div')
      el.style.fontFamily='var(--font-body)'
      el.style.minWidth='160px'
      el.innerHTML=`<strong style="font-size:0.9rem">${s.species_display_name??s.reported_name??'Não identificada'}</strong><div style="font-size:0.8rem;color:var(--cinza-medio);margin:0.3rem 0">${s.municipio??''}</div>`
      const link=document.createElement('a')
      link.href=`/registro/${s.id}`
      link.style.fontSize='0.78rem'
      link.style.fontWeight='600'
      link.textContent='Ver registro →'
      link.onclick=(e)=>{e.preventDefault();window.location.href=`/registro/${s.id}`}
      el.appendChild(link)
      marker.bindPopup(el)
      group.addLayer(marker)
    })
    map.addLayer(group)
    return()=>{map.removeLayer(group)}
  },[sightings,map])
  return null
}

const SEASONS=['Verão','Outono','Inverno','Primavera']
const VEG_TYPES=['Mata Atlântica','Caatinga','Brejo de altitude','Área urbana','Área agrícola/rural','Restinga/litoral','Outro']

export default function MapPage(){
  const[sightings,setSightings]=useState<SightingPublic[]>([])
  const[species,setSpecies]=useState<Species[]>([])
  const[municipios,setMunicipios]=useState<string[]>([])
  const[loading,setLoading]=useState(true)
  const[showFilters,setShowFilters]=useState(false)
  const[fSpecies,setFSpecies]=useState('')
  const[fClass,setFClass]=useState<''|'peconhenta'|'nao_peconhenta'|'aguardando'>('')
  const[fMunicipio,setFMunicipio]=useState('')
  const[fVeg,setFVeg]=useState('')
  const[fSeason,setFSeason]=useState('')
  const[fFrom,setFFrom]=useState('')
  const[fTo,setFTo]=useState('')

  useEffect(()=>{
    supabase.from('sightings_public').select('*').not('latitude','is',null).then(({data})=>{setSightings((data as SightingPublic[])??[]);setLoading(false)})
    supabase.from('species').select('*').eq('active',true).order('common_name').then(({data})=>setSpecies((data as Species[])??[]))
    supabase.from('municipios_pb').select('nome').order('nome').then(({data})=>setMunicipios((data??[]).map((m:{nome:string})=>m.nome)))
  },[])

  const filtered=useMemo(()=>sightings.filter((s)=>{
    if(fSpecies&&s.confirmed_species_id!==fSpecies&&s.suggested_species_id!==fSpecies)return false
    if(fClass==='peconhenta'&&!(s.identification_confirmed&&s.venomous_display===true))return false
    if(fClass==='nao_peconhenta'&&!(s.identification_confirmed&&s.venomous_display===false))return false
    if(fClass==='aguardando'&&s.identification_confirmed)return false
    if(fMunicipio&&s.municipio!==fMunicipio)return false
    if(fVeg&&s.vegetation_type!==fVeg)return false
    if(fSeason&&s.season!==fSeason)return false
    if(fFrom&&(!s.observation_date||s.observation_date<fFrom))return false
    if(fTo&&(!s.observation_date||s.observation_date>fTo))return false
    return true
  }),[sightings,fSpecies,fClass,fMunicipio,fVeg,fSeason,fFrom,fTo])

  const activeFilterCount=[fSpecies,fClass,fMunicipio,fVeg,fSeason,fFrom,fTo].filter(Boolean).length

  function clearFilters(){setFSpecies('');setFClass('');setFMunicipio('');setFVeg('');setFSeason('');setFFrom('');setFTo('')}

  return(<div>
    <div className="page-header" style={{paddingBottom:'0.8rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.6rem'}}>
      <div>
        <h1>Mapa de avistamentos</h1>
        <p style={{fontSize:'0.88rem',margin:0}}>Registros aprovados. Localização aproximada por segurança.</p>
      </div>
      <button className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px',flexShrink:0}} onClick={()=>setShowFilters((v)=>!v)}>
        <Filter size={14}/> Filtros{activeFilterCount>0?` (${activeFilterCount})`:''}
      </button>
    </div>

    {showFilters&&(
      <div className="card" style={{margin:'0 1.1rem 1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.7rem'}}>
          <strong style={{fontSize:'0.9rem'}}>Filtrar registros</strong>
          <button onClick={()=>setShowFilters(false)} style={{background:'none',border:'none',cursor:'pointer',padding:'0.2rem'}}><X size={18}/></button>
        </div>
        <div className="field"><label>Espécie</label><select className="input" value={fSpecies} onChange={(e)=>setFSpecies(e.target.value)}><option value="">Todas</option>{species.map((s)=><option key={s.id} value={s.id}>{s.common_name}</option>)}</select></div>
        <div className="field"><label>Classificação</label><select className="input" value={fClass} onChange={(e)=>setFClass(e.target.value as typeof fClass)}><option value="">Todas</option><option value="peconhenta">Peçonhenta</option><option value="nao_peconhenta">Não peçonhenta</option><option value="aguardando">Aguardando identificação</option></select></div>
        <div className="field"><label>Município</label><select className="input" value={fMunicipio} onChange={(e)=>setFMunicipio(e.target.value)}><option value="">Todos</option>{municipios.map((m)=><option key={m} value={m}>{m}</option>)}</select></div>
        <div className="field"><label>Vegetação</label><select className="input" value={fVeg} onChange={(e)=>setFVeg(e.target.value)}><option value="">Todas</option>{VEG_TYPES.map((v)=><option key={v} value={v}>{v}</option>)}</select></div>
        <div className="field"><label>Estação</label><select className="input" value={fSeason} onChange={(e)=>setFSeason(e.target.value)}><option value="">Todas</option>{SEASONS.map((s)=><option key={s} value={s}>{s}</option>)}</select></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem'}}>
          <div className="field"><label>De</label><input type="date" className="input" value={fFrom} onChange={(e)=>setFFrom(e.target.value)}/></div>
          <div className="field"><label>Até</label><input type="date" className="input" value={fTo} onChange={(e)=>setFTo(e.target.value)}/></div>
        </div>
        {activeFilterCount>0&&<button className="btn btn-outline btn-sm" style={{borderRadius:'8px'}} onClick={clearFilters}>Limpar filtros</button>}
      </div>
    )}

    <div style={{overflow:'hidden',marginBottom:'1rem'}}>
      <MapContainer center={PB} zoom={8} style={{height:'65vh',width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap"/>
        <ClusterLayer sightings={filtered}/>
      </MapContainer>
    </div>
    {!loading&&filtered.length===0&&<p className="center-note">{sightings.length===0?'Ainda não há registros no mapa.':'Nenhum registro corresponde aos filtros selecionados.'}</p>}
    {!loading&&filtered.length>0&&<p style={{textAlign:'center',fontSize:'0.78rem',color:'var(--cinza-fraco)',marginTop:'-0.6rem'}}>{filtered.length} registro(s) no mapa</p>}
  </div>)
}
