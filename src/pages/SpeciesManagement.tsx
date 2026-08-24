import{useEffect,useState}from 'react'
import{Plus,Pencil,X,Check,EyeOff,Eye}from 'lucide-react'
import{supabase}from '../lib/supabase'
import{useAuth}from '../context/AuthContext'
import type{Species}from '../lib/types'

interface FormState{
  id:string|null
  common_name:string
  scientific_name:string
  family:string
  genus:string
  venomous:boolean
  image_url:string
  description:string
  identification_features:string
  habitat:string
  occurrence_regions:string
  references_list:string
  active:boolean
}

const EMPTY_FORM:FormState={id:null,common_name:'',scientific_name:'',family:'',genus:'',venomous:false,image_url:'',description:'',identification_features:'',habitat:'',occurrence_regions:'',references_list:'',active:true}

export default function SpeciesManagement(){
  const{isAdmin}=useAuth()
  const[species,setSpecies]=useState<Species[]>([])
  const[loading,setLoading]=useState(true)
  const[editing,setEditing]=useState<FormState|null>(null)
  const[saving,setSaving]=useState(false)
  const[error,setError]=useState<string|null>(null)

  async function load(){
    setLoading(true)
    const{data}=await supabase.from('species').select('*').order('common_name')
    setSpecies((data as Species[])??[])
    setLoading(false)
  }
  useEffect(()=>{if(isAdmin)load()},[isAdmin])

  function openNew(){setEditing({...EMPTY_FORM});setError(null)}
  function openEdit(s:Species){
    setEditing({
      id:s.id,
      common_name:s.common_name,
      scientific_name:s.scientific_name,
      family:s.family??'',
      genus:s.genus??'',
      venomous:s.venomous,
      image_url:s.image_url??'',
      description:s.description??'',
      identification_features:s.identification_features??'',
      habitat:s.habitat??'',
      occurrence_regions:(s.occurrence_regions??[]).join(', '),
      references_list:(s.references_list??[]).join('\n'),
      active:s.active,
    })
    setError(null)
  }

  async function save(){
    if(!editing)return
    if(!editing.common_name.trim()||!editing.scientific_name.trim()){setError('Nome popular e nome científico são obrigatórios.');return}
    setSaving(true);setError(null)
    const payload={
      common_name:editing.common_name.trim(),
      scientific_name:editing.scientific_name.trim(),
      family:editing.family.trim()||null,
      genus:editing.genus.trim()||null,
      venomous:editing.venomous,
      image_url:editing.image_url.trim()||null,
      description:editing.description.trim()||null,
      identification_features:editing.identification_features.trim()||null,
      habitat:editing.habitat.trim()||null,
      occurrence_regions:editing.occurrence_regions.split(',').map((r)=>r.trim()).filter(Boolean),
      references_list:editing.references_list.split('\n').map((r)=>r.trim()).filter(Boolean),
      active:editing.active,
    }
    const{error:err}=editing.id
      ?await supabase.from('species').update(payload).eq('id',editing.id)
      :await supabase.from('species').insert(payload)
    setSaving(false)
    if(err){setError(err.message);return}
    setEditing(null)
    load()
  }

  async function toggleActive(s:Species){
    await supabase.from('species').update({active:!s.active}).eq('id',s.id)
    load()
  }

  if(!isAdmin)return<p className="center-note">Esta área é restrita a administradores.</p>

  if(editing)return(
    <div className="page">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h1 style={{margin:0}}>{editing.id?'Editar espécie':'Nova espécie'}</h1>
        <button onClick={()=>setEditing(null)} style={{background:'none',border:'none',cursor:'pointer'}}><X size={22}/></button>
      </div>
      <div className="field"><label>Nome popular *</label><input className="input" value={editing.common_name} onChange={(e)=>setEditing({...editing,common_name:e.target.value})}/></div>
      <div className="field"><label>Nome científico *</label><input className="input" value={editing.scientific_name} onChange={(e)=>setEditing({...editing,scientific_name:e.target.value})} placeholder="Gênero espécie"/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem'}}>
        <div className="field"><label>Família</label><input className="input" value={editing.family} onChange={(e)=>setEditing({...editing,family:e.target.value})}/></div>
        <div className="field"><label>Gênero</label><input className="input" value={editing.genus} onChange={(e)=>setEditing({...editing,genus:e.target.value})}/></div>
      </div>
      <div className="field"><label>Classificação *</label><Chips opts={[['Peçonhenta',true],['Não peçonhenta',false]]} val={editing.venomous} set={(v)=>setEditing({...editing,venomous:v})}/></div>
      <div className="field"><label>URL da foto principal</label><input className="input" value={editing.image_url} onChange={(e)=>setEditing({...editing,image_url:e.target.value})} placeholder="https://…"/></div>
      <div className="field"><label>Descrição</label><textarea className="input" value={editing.description} onChange={(e)=>setEditing({...editing,description:e.target.value})}/></div>
      <div className="field"><label>Características de identificação</label><textarea className="input" value={editing.identification_features} onChange={(e)=>setEditing({...editing,identification_features:e.target.value})}/></div>
      <div className="field"><label>Habitat</label><textarea className="input" value={editing.habitat} onChange={(e)=>setEditing({...editing,habitat:e.target.value})}/></div>
      <div className="field"><label>Regiões de ocorrência na Paraíba (separadas por vírgula)</label><input className="input" value={editing.occurrence_regions} onChange={(e)=>setEditing({...editing,occurrence_regions:e.target.value})} placeholder="Sertão, Cariri, Litoral"/></div>
      <div className="field"><label>Referências (uma por linha)</label><textarea className="input" value={editing.references_list} onChange={(e)=>setEditing({...editing,references_list:e.target.value})} placeholder="Fonte confiável 1&#10;Fonte confiável 2"/></div>
      <div className="field"><label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer'}}><input type="checkbox" checked={editing.active} onChange={(e)=>setEditing({...editing,active:e.target.checked})}/>Espécie ativa (visível no catálogo)</label></div>
      {error&&<p className="error-text">{error}</p>}
      <button className="btn btn-primary" style={{borderRadius:'999px'}} onClick={save} disabled={saving}>{saving?'Salvando…':'Salvar espécie'}</button>
    </div>
  )

  return(
    <div className="page">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h1 style={{margin:0}}>Gestão de espécies</h1>
        <button className="btn btn-vermelho btn-sm btn-auto" style={{borderRadius:'8px'}} onClick={openNew}><Plus size={14}/> Nova</button>
      </div>
      {loading&&<p className="center-note">Carregando…</p>}
      <div style={{display:'grid',gap:'0.6rem'}}>
        {species.map((s)=>(
          <div className="card" key={s.id} style={{display:'flex',gap:'0.8rem',alignItems:'center',opacity:s.active?1:0.55}}>
            <div style={{width:52,height:52,borderRadius:8,overflow:'hidden',flexShrink:0,background:'var(--fundo)'}}>{s.image_url&&<img src={s.image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:'0.92rem'}}>{s.common_name}{!s.active&&' (inativa)'}</div>
              <div style={{fontSize:'0.78rem',color:'var(--cinza-fraco)',fontStyle:'italic'}}>{s.scientific_name}</div>
              <span className={`selo ${s.venomous?'selo-peconhenta':'selo-nao-peconhenta'}`} style={{fontSize:'0.6rem',marginTop:'0.3rem'}}>{s.venomous?'Peçonhenta':'Não peçonhenta'}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
              <button onClick={()=>openEdit(s)} style={{padding:'0.4rem',background:'var(--fundo)',borderRadius:8,border:'none',cursor:'pointer',display:'flex'}}><Pencil size={15} color="var(--cinza-medio)"/></button>
              <button onClick={()=>toggleActive(s)} style={{padding:'0.4rem',background:'var(--fundo)',borderRadius:8,border:'none',cursor:'pointer',display:'flex'}}>{s.active?<EyeOff size={15} color="var(--cinza-medio)"/>:<Eye size={15} color="var(--verde-seguro)"/>}</button>
            </div>
          </div>
        ))}
        {!loading&&species.length===0&&<p className="center-note">Nenhuma espécie cadastrada.</p>}
      </div>
    </div>
  )
}

function Chips<T>({opts,val,set}:{opts:[string,T][];val:T;set:(v:T)=>void}){
  return(<div className="choice-grid">{opts.map(([label,v])=>(
    <div key={label} className={`choice-chip ${val===v?'selected':''}`} onClick={()=>set(v)}>
      {val===v&&<Check size={12} style={{verticalAlign:'-2px',marginRight:'0.2rem'}}/>}{label}
    </div>
  ))}</div>)
}
