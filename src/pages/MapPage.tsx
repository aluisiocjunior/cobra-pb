import{useEffect,useState}from 'react'
import{MapContainer,TileLayer,Marker,Popup}from 'react-leaflet'
import L from 'leaflet'
import{Link}from 'react-router-dom'
import{supabase}from '../lib/supabase'
import type{SightingPublic}from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'
const PB:[number,number]=[-7.12,-36.72]
function pin(v:boolean|null|undefined,c:boolean){const col=!c?'#888':v?'#E5000F':'#1a6b2f';return L.divIcon({className:'',html:`<div style="width:22px;height:22px;border-radius:50%;background:${col};border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,iconSize:[22,22],iconAnchor:[11,11]})}
export default function MapPage(){
  const[sightings,setSightings]=useState<SightingPublic[]>([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{supabase.from('sightings_public').select('*').not('latitude','is',null).then(({data})=>{setSightings((data as SightingPublic[])??[]);setLoading(false)})},[])  
  return(<div><div className="page-header" style={{paddingBottom:'0.8rem'}}><h1>Mapa de avistamentos</h1><p style={{fontSize:'0.88rem',margin:0}}>Registros aprovados. Localização aproximada por segurança.</p></div><div style={{overflow:'hidden',marginBottom:'1rem'}}><MapContainer center={PB} zoom={8} style={{height:'65vh',width:'100%'}}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap"/>{sightings.map((s)=>(s.latitude!=null&&s.longitude!=null&&(<Marker key={s.id} position={[s.latitude,s.longitude]} icon={pin(s.venomous_display,s.identification_confirmed)}><Popup><div style={{fontFamily:'var(--font-body)',minWidth:160}}><strong style={{fontSize:'0.9rem'}}>{s.species_display_name??s.reported_name??'Não identificada'}</strong><div style={{margin:'0.3rem 0'}}><SpeciesStamp venomous={s.venomous_display} confirmed={s.identification_confirmed} size="sm"/></div><div style={{fontSize:'0.8rem',color:'var(--cinza-medio)'}}>{s.municipio}</div><Link to={`/registro/${s.id}`} style={{fontSize:'0.78rem',fontWeight:600}}>Ver registro →</Link></div></Popup></Marker>)))}</MapContainer></div>{!loading&&sightings.length===0&&<p className="center-note">Ainda não há registros no mapa.</p>}</div>)
}
