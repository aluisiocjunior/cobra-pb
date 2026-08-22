import{useEffect,useRef,useState}from 'react'
import{useNavigate,useParams}from 'react-router-dom'
import{ChevronLeft,ChevronRight,CircleHelp,CheckCircle2}from 'lucide-react'
import{supabase}from '../lib/supabase'
import{useAuth}from '../context/AuthContext'
import type{Species,AnimalCondition,Behavior,SightingStatus}from '../lib/types'
import{ANIMAL_CONDITION_LABELS,BEHAVIOR_LABELS,STATUS_LABELS}from '../lib/types'
import LocationPicker from '../components/LocationPicker'
import PhotoUploader,{type PendingMedia}from '../components/PhotoUploader'
const ED:SightingStatus[]=['aguardando_revisao','correcao_solicitada']
function xPath(url:string):string|null{const m='/sighting-photos/';const i=url.indexOf(m);return i===-1?null:url.slice(i+m.length)}
const ST=['Animal','Local','Quando','Ambiente','Condição','Mídia','Revisão']
const LT=['Urbano','Quintal/Casa','Rural','Mata/Floresta','Área agrícola','Beira de rio/açude','Outro']
const VT=['Mata Atlântica','Caatinga','Brejo de altitude','Área urbana','Área agrícola/rural','Restinga/litoral','Outro']
const SE=['Verão','Outono','Inverno','Primavera']
const WE=['Ensolarado','Nublado','Chuvoso','Após chuva','Seco/estiagem','Outro']
const DP=['Manhã','Tarde','Noite','Madrugada']
const AC:AnimalCondition[]=['vivo','ferido','morto','aparentemente_saudavel','nao_avaliado']
const BH:Behavior[]=['parado','fugindo','defensivo','escondido','agressivo','outro']
const td=()=>new Date().toISOString().slice(0,10)
const tn=()=>new Date().toTimeString().slice(0,5)
const sl=(n:string)=>n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9.]+/g,'-').toLowerCase()
export default function RegisterSighting(){
  const{session,profile}=useAuth();const navigate=useNavigate();const{id:editId}=useParams<{id:string}>();const isEdit=!!editId
  const[step,setStep]=useState(0);const[species,setSpecies]=useState<Species[]>([]);const[submitting,setSubmitting]=useState(false);const[submitError,setSubmitError]=useState<string|null>(null);const[done,setDone]=useState(false);const[loadingRecord,setLoadingRecord]=useState(isEdit);const[loadError,setLoadError]=useState<string|null>(null)
  const iP=useRef<Record<string,string>>({});const iI=useRef<Set<string>>(new Set())
  const[ssId,setSsId]=useState('');const[dk,setDk]=useState(false);const[ft,setFt]=useState('')
  const[mun,setMun]=useState('');const[loc,setLoc]=useState('');const[le,setLe]=useState('');const[lt,setLt]=useState('')
  const[lat,setLat]=useState<number|null>(null);const[lng,setLng]=useState<number|null>(null);const[acc,setAcc]=useState<number|null>(null)
  const[od,setOd]=useState(td());const[ot,setOt]=useState(tn())
  const[vt,setVt]=useState('');const[se,setSe]=useState('');const[wc,setWc]=useState('');const[dp,setDp]=useState('')
  const[ac2,setAc2]=useState<AnimalCondition|''>('');const[bh,setBh]=useState<Behavior|''>('')
  const[media,setMedia]=useState<PendingMedia[]>([]);const[notes,setNotes]=useState('');const[sc,setSc]=useState(profile?.phone_public??false)
  useEffect(()=>{supabase.from('species').select('*').eq('active',true).order('common_name').then(({data})=>setSpecies((data as Species[])??[]))},[])  
  useEffect(()=>{
    if(!isEdit||!editId||!session)return;let mounted=true
    async function lfe(){
      const{data:rec,error}=await supabase.from('sightings').select('*').eq('id',editId).maybeSingle()
      if(!mounted)return
      if(error||!rec){setLoadError('Registro não encontrado.');setLoadingRecord(false);return}
      if(rec.user_id!==session!.user.id){setLoadError('Você só pode editar seus próprios registros.');setLoadingRecord(false);return}
      if(!ED.includes(rec.status)){setLoadError(`Este registro está em "${STATUS_LABELS[rec.status as SightingStatus]}" e não pode ser editado.`);setLoadingRecord(false);return}
      setSsId(rec.suggested_species_id??'');setDk(rec.dont_know_species??false);setFt(rec.dont_know_species?(rec.reported_name??''):'')
      setMun(rec.municipio??'');setLoc(rec.localidade??'');setLe(rec.local_especifico??'');setLt(rec.location_type??'')
      setLat(rec.latitude);setLng(rec.longitude);setAcc(rec.gps_accuracy_m)
      setOd(rec.observation_date??td());setOt(rec.observation_time??tn())
      setVt(rec.vegetation_type??'');setSe(rec.season??'');setWc(rec.weather_condition??'');setDp(rec.day_period??'')
      setAc2((rec.animal_condition as AnimalCondition)??'');setBh((rec.behavior as Behavior)??'')
      setNotes(rec.notes??'');setSc(rec.share_contact??false)
      const{data:photos}=await supabase.from('sighting_photos').select('*').eq('sighting_id',editId).order('order_index')
      if(!mounted)return
      const em:PendingMedia[]=(photos??[]).map((p)=>({existingId:p.id,previewUrl:p.url,mediaType:p.media_type}))
      iP.current=Object.fromEntries((photos??[]).map((p)=>[p.id,p.url]))
      iI.current=new Set((photos??[]).map((p)=>p.id))
      setMedia(em);setLoadingRecord(false)
    }
    lfe();return()=>{mounted=false}
  },[isEdit,editId,session])
  const sv=(()=>{switch(step){case 0:return dk||!!ssId;case 1:return mun.trim().length>0&&lat!=null&&lng!=null;case 2:return!!od;default:return true}})()
  async function submit(){
    if(!session)return;setSubmitting(true);setSubmitError(null)
    try{
      const sel=species.find((s)=>s.id===ssId)
      const pl={suggested_species_id:dk?null:ssId||null,dont_know_species:dk,reported_name:dk?ft.trim():(sel?.common_name??''),municipio:mun.trim(),localidade:loc.trim()||null,local_especifico:le.trim()||null,location_type:lt||null,latitude:lat,longitude:lng,gps_accuracy_m:acc,observation_date:od,observation_time:ot,vegetation_type:vt||null,season:se||null,weather_condition:wc||null,day_period:dp||null,animal_condition:ac2||null,behavior:bh||null,notes:notes.trim()||null,share_contact:sc,has_video:media.some((m)=>m.mediaType==='video')}
      let sid:string
      if(isEdit&&editId){
        const{error}=await supabase.from('sightings').update(pl).eq('id',editId)
        if(error)throw error;sid=editId
        const cIds=new Set(media.filter((m)=>m.existingId).map((m)=>m.existingId as string))
        const rIds=[...iI.current].filter((r)=>!cIds.has(r))
        for(const r of rIds){const u=iP.current[r];await supabase.from('sighting_photos').delete().eq('id',r);if(u){const p=xPath(u);if(p)await supabase.storage.from('sighting-photos').remove([p])}}
      }else{
        const{data:row,error}=await supabase.from('sightings').insert({...pl,user_id:session.user.id,status:'aguardando_revisao'}).select().single()
        if(error)throw error;sid=row.id
      }
      for(let i=0;i<media.length;i++){
        const m=media[i]
        if(m.existingId){await supabase.from('sighting_photos').update({is_primary:i===0,order_index:i}).eq('id',m.existingId);continue}
        if(!m.file)continue
        const path=`${session.user.id}/${sid}/${Date.now()}-${i}-${sl(m.file.name)}`
        const{error:ue}=await supabase.storage.from('sighting-photos').upload(path,m.file,{contentType:m.file.type,upsert:false})
        if(ue)continue
        const{data:pu}=supabase.storage.from('sighting-photos').getPublicUrl(path)
        await supabase.from('sighting_photos').insert({sighting_id:sid,url:pu.publicUrl,media_type:m.mediaType,is_primary:i===0,order_index:i})
      }
      setDone(true)
    }catch(err:unknown){setSubmitError(err instanceof Error?err.message:'Não foi possível enviar. Tente novamente.')}
    finally{setSubmitting(false)}
  }
  if(loadingRecord)return <p className="center-note">Carregando…</p>
  if(loadError)return(<div className="page" style={{textAlign:'center',paddingTop:'2rem'}}><p>{loadError}</p><button className="btn btn-outline btn-auto" style={{borderRadius:'999px'}} onClick={()=>navigate('/perfil?tab=meus-registros')}>Voltar</button></div>)
  if(done)return(<div className="page" style={{textAlign:'center',paddingTop:'3rem'}}><CheckCircle2 size={52} color="var(--verde-seguro)" style={{margin:'0 auto 1rem'}}/><h1>{isEdit?'Atualizado!':'Enviado!'}</h1><p>{isEdit?'Alterações salvas.':(<>Aguardando <strong>revisão</strong>.</>)}</p><div style={{display:'grid',gap:'0.6rem',maxWidth:280,margin:'1rem auto 0'}}><button className="btn btn-primary" style={{borderRadius:'999px'}} onClick={()=>navigate('/perfil?tab=meus-registros')}>Ver meus registros</button>{!isEdit&&<button className="btn btn-outline" style={{borderRadius:'999px'}} onClick={()=>window.location.reload()}>Registrar outro</button>}</div></div>)
  return(
    <div>
      <div style={{background:'var(--vermelho)',padding:'1.2rem 1.1rem 0.8rem'}}>
        <div className="stepper">{ST.map((_,i)=>(<div key={i} className={`dot ${i<step?'done':i===step?'current':''}`}/>))}</div>
        <p style={{color:'rgba(255,255,255,0.85)',margin:0,fontSize:'0.78rem',fontWeight:600}}>Etapa {step+1} de {ST.length} · {ST[step]}</p>
      </div>
      <div className="page">
        {step===0&&(<div><div className="field"><label>Espécie sugerida</label><select className="input" value={ssId} disabled={dk} onChange={(e)=>setSsId(e.target.value)}><option value="">Selecione, se souber…</option>{species.map((s)=>(<option key={s.id} value={s.id}>{s.common_name} ({s.scientific_name})</option>))}</select><p className="hint"><CircleHelp size={12} style={{verticalAlign:'-2px'}}/> Sugestão apenas.</p></div><div className="field"><label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer'}}><input type="checkbox" checked={dk} onChange={(e)=>{setDk(e.target.checked);if(e.target.checked)setSsId('')}}/>Não sei identificar</label></div>{dk&&(<div className="field"><label>Descreva o que você viu</label><input className="input" value={ft} onChange={(e)=>setFt(e.target.value)} placeholder="Ex.: cobra marrom com listras"/></div>)}</div>)}
        {step===1&&(<div><div className="field"><label>Município *</label><input className="input" value={mun} onChange={(e)=>setMun(e.target.value)} placeholder="Ex.: Campina Grande"/></div><div className="field"><label>Localidade</label><input className="input" value={loc} onChange={(e)=>setLoc(e.target.value)}/></div><div className="field"><label>Local específico</label><input className="input" value={le} onChange={(e)=>setLe(e.target.value)}/></div><div className="field"><label>Tipo de ambiente</label><Ch opts={LT} val={lt} set={setLt}/></div><div className="field"><label>Localização no mapa *</label><LocationPicker latitude={lat} longitude={lng} accuracy={acc} onChange={(a,b,c)=>{setLat(a);setLng(b);setAcc(c)}}/></div></div>)}
        {step===2&&(<div><div className="field"><label>Data *</label><input type="date" className="input" value={od} onChange={(e)=>setOd(e.target.value)} max={td()}/></div><div className="field"><label>Horário</label><input type="time" className="input" value={ot} onChange={(e)=>setOt(e.target.value)}/></div></div>)}
        {step===3&&(<div><div className="field"><label>Vegetação</label><Ch opts={VT} val={vt} set={setVt}/></div><div className="field"><label>Estação</label><Ch opts={SE} val={se} set={setSe}/></div><div className="field"><label>Clima</label><Ch opts={WE} val={wc} set={setWc}/></div><div className="field"><label>Período</label><Ch opts={DP} val={dp} set={setDp}/></div></div>)}
        {step===4&&(<div><div className="field"><label>Condição do animal</label><Ch opts={AC} val={ac2} set={(v)=>setAc2(v as AnimalCondition)} labels={ANIMAL_CONDITION_LABELS}/></div><div className="field"><label>Comportamento</label><Ch opts={BH} val={bh} set={(v)=>setBh(v as Behavior)} labels={BEHAVIOR_LABELS}/></div></div>)}
        {step===5&&(<div><div className="field"><label>Fotos e vídeos</label><PhotoUploader items={media} onChange={setMedia}/></div></div>)}
        {step===6&&(<div><div className="field"><label>Observações</label><textarea className="input" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Informações adicionais…"/></div><div className="field"><label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer'}}><input type="checkbox" checked={sc} onChange={(e)=>setSc(e.target.checked)}/>Permitir contato</label></div><div className="banner banner-info" style={{fontSize:'0.82rem'}}>Município: <strong>{mun||'—'}</strong> · Data: <strong>{od}</strong><br/>Espécie: <strong>{dk?'Não identificada':(species.find((s)=>s.id===ssId)?.common_name??'—')}</strong><br/>Mídia: <strong>{media.length}</strong> arquivo(s)</div>{submitError&&<p className="error-text">{submitError}</p>}</div>)}
        <div style={{display:'flex',gap:'0.6rem',marginTop:'0.5rem'}}>
          {step>0&&(<button className="btn btn-outline" style={{borderRadius:'999px'}} onClick={()=>setStep((s)=>s-1)} disabled={submitting}><ChevronLeft size={16}/> Voltar</button>)}
          {step<ST.length-1
            ?(<button className="btn btn-primary" style={{borderRadius:'999px'}} onClick={()=>setStep((s)=>s+1)} disabled={!sv}>Avançar <ChevronRight size={16}/></button>)
            :(<button className="btn btn-vermelho" style={{borderRadius:'999px'}} onClick={submit} disabled={submitting}>{submitting?'Salvando…':isEdit?'Salvar':'Enviar registro'}</button>)
          }
        </div>
      </div>
    </div>
  )
}
function Ch<T extends string>({opts,val,set,labels}:{opts:T[];val:string;set:(v:T)=>void;labels?:Record<string,string>}){
  return(<div className="choice-grid">{opts.map((o)=>(<div key={o} className={`choice-chip ${val===o?'selected':''}`} onClick={()=>set(val===o?('' as T):o)}>{labels?.[o]??o}</div>))}</div>)
}
