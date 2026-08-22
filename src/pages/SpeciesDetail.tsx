import{useEffect,useState}from 'react'
import{useParams,Link}from 'react-router-dom'
import{supabase}from '../lib/supabase'
import type{Species,SpeciesPhoto,SightingPublic}from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'
export default function SpeciesDetail(){
  const{id}=useParams()
  const[species,setSpecies]=useState<Species|null>(null)
  const[photos,setPhotos]=useState<SpeciesPhoto[]>([])
  const[sightings,setSightings]=useState<SightingPublic[]>([])
  const[loading,setLoading]=useState(true)
  useEffect(()=>{
    if(!id)return
    let mounted=true
    async function load(){
      const[sr,pr,sgr]=await Promise.all([
        supabase.from('species').select('*').eq('id',id).maybeSingle(),
        supabase.from('species_photos').select('*').eq('species_id',id).order('order_index'),
        supabase.from('sightings_public').select('*').eq('confirmed_species_id',id)
      ])
      if(!mounted)return
      setSpecies(sr.data as Species|null)
      setPhotos((pr.data as SpeciesPhoto[])??[])
      setSightings((sgr.data as SightingPublic[])??[])
      setLoading(false)
    }
    load()
    return()=>{mounted=false}
  },[id])
  if(loading)return <p className="center-note">Carregando…</p>
  if(!species)return <p className="center-note">Espécie não encontrada.</p>
  const muns=[...new Set(sightings.map((s)=>s.municipio).filter(Boolean))] as string[]
  const backStyle:React.CSSProperties={position:'absolute',top:12,left:12,background:'rgba(255,255,255,0.92)',borderRadius:'999px',padding:'0.3rem 0.8rem',fontSize:'0.78rem',fontWeight:700,textDecoration:'none',color:'var(--preto)',border:'1px solid var(--cinza-linha)'}
  return(
    <div>
      <div style={{position:'relative'}}>
        <div style={{aspectRatio:'4/3',background:'var(--cinza-linha)',overflow:'hidden'}}>
          {species.image_url&&<img src={species.image_url} alt={species.common_name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
        </div>
        <Link to="/explorar" style={backStyle}>← Catálogo</Link>
      </div>
      <div className="page">
        <SpeciesStamp venomous={species.venomous} confirmed/>
        <h1 style={{marginTop:'0.5rem'}}>{species.common_name}</h1>
        <p style={{fontStyle:'italic',color:'var(--cinza-fraco)',marginTop:'-0.4rem'}}>{species.scientific_name}{species.family?` · ${species.family}`:''}</p>
        {photos.length>0&&(<div className="photo-grid" style={{marginBottom:'1.2rem'}}>{photos.map((p)=>(<div className="photo-tile" key={p.id}><img src={p.url} alt={species.common_name}/></div>))}</div>)}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem',marginBottom:'1.2rem'}}>
          <div className="card" style={{textAlign:'center',padding:'0.8rem'}}>
            <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--vermelho)'}}>{sightings.length}</div>
            <div style={{fontSize:'0.7rem',color:'var(--cinza-fraco)',fontWeight:600}}>REGISTROS</div>
          </div>
          <div className="card" style={{textAlign:'center',padding:'0.8rem'}}>
            <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--vermelho)'}}>{muns.length}</div>
            <div style={{fontSize:'0.7rem',color:'var(--cinza-fraco)',fontWeight:600}}>MUNICÍPIOS</div>
          </div>
        </div>
        {species.description&&<S t="Sobre">{species.description}</S>}
        {species.identification_features&&<S t="Identificação">{species.identification_features}</S>}
        {species.habitat&&<S t="Habitat">{species.habitat}</S>}
        {species.occurrence_regions?.length>0&&<S t="Regiões na Paraíba">{species.occurrence_regions.join(', ')}</S>}
        {muns.length>0&&<S t="Municípios com registro">{muns.join(', ')}</S>}
        {species.references_list?.length>0&&(<S t="Referências"><ul style={{paddingLeft:'1.1rem',margin:0}}>{species.references_list.map((r,i)=><li key={i} style={{fontSize:'0.85rem'}}>{r}</li>)}</ul></S>)}
      </div>
    </div>
  )
}
function S({t,children}:{t:string;children:React.ReactNode}){
  return(
    <div style={{marginBottom:'1.1rem'}}>
      <h3 style={{color:'var(--cinza-fraco)',fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.3rem'}}>{t}</h3>
      <div style={{fontSize:'0.92rem'}}>{children}</div>
    </div>
  )
}
