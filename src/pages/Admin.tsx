import{useEffect,useState}from 'react'
import{Link}from 'react-router-dom'
import{Check,X,MessageSquareWarning,Stethoscope,ShieldCheck,Users,MapPin,Clock,User as UserIcon,Paperclip,ExternalLink,BarChart3}from 'lucide-react'
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,LineChart,Line,CartesianGrid}from 'recharts'
import{supabase}from '../lib/supabase'
import{useAuth}from '../context/AuthContext'
import type{Species,SightingStatus,Role}from '../lib/types'
import{STATUS_LABELS,ANIMAL_CONDITION_LABELS,BEHAVIOR_LABELS,type AnimalCondition,type Behavior}from '../lib/types'
import SpeciesStamp from '../components/SpeciesStamp'
import SpeciesManagement from './SpeciesManagement'

const PND:SightingStatus[]=['aguardando_revisao','em_revisao','correcao_solicitada','revisao_especialista']

interface SightingPhotoRow{id:string;url:string;media_type:'foto'|'video'|'anexo';is_primary:boolean;order_index:number}
interface Item{
  id:string;status:SightingStatus
  municipio:string|null;localidade:string|null;local_especifico:string|null
  latitude:number|null;longitude:number|null;gps_accuracy_m:number|null
  observation_date:string|null;observation_time:string|null
  animal_condition:AnimalCondition|null;behavior:Behavior|null
  notes:string|null;reported_name:string|null;dont_know_species:boolean
  confirmed_species_id:string|null;suggested_species_id:string|null
  suggested:{common_name:string;scientific_name:string;venomous:boolean}|null
  confirmed:{common_name:string;scientific_name:string;venomous:boolean}|null
  author:{full_name:string;phone:string|null}|null
  sighting_photos:SightingPhotoRow[]
}

function Approvals(){
  const{session,isAdmin}=useAuth()
  const[items,setItems]=useState<Item[]>([])
  const[species,setSpecies]=useState<Species[]>([])
  const[loading,setLoading]=useState(true)
  const[busyId,setBusyId]=useState<string|null>(null)
  const[cc,setCc]=useState<Record<string,string>>({})

  async function load(){
    setLoading(true)
    const{data}=await supabase.from('sightings').select(`
      id,status,municipio,localidade,local_especifico,latitude,longitude,gps_accuracy_m,
      observation_date,observation_time,animal_condition,behavior,
      notes,reported_name,dont_know_species,confirmed_species_id,suggested_species_id,
      suggested:species!sightings_species_id_fkey(common_name,scientific_name,venomous),
      confirmed:species!sightings_confirmed_species_id_fkey(common_name,scientific_name,venomous),
      author:profiles!sightings_user_id_fkey(full_name,phone),
      sighting_photos(id,url,media_type,is_primary,order_index)
    `).in('status',PND).order('created_at',{ascending:true})
    setItems(((data as unknown as Item[])??[]))
    setLoading(false)
  }
  useEffect(()=>{load();supabase.from('species').select('*').eq('active',true).order('common_name').then(({data})=>setSpecies((data as Species[])??[]))},[])

  async function act(id:string,status:SightingStatus,action:string,message?:string){
    if(!session)return
    setBusyId(id)
    await supabase.from('sightings').update({status,reviewed_by:session.user.id,review_note:message??null}).eq('id',id)
    await supabase.from('moderation_actions').insert({sighting_id:id,actor_id:session.user.id,action,message:message??null})
    if(status==='aprovado'){supabase.functions.invoke('send-sighting-notification',{body:{sighting_id:id}}).catch(()=>{})}
    setItems((p)=>p.filter((i)=>i.id!==id))
    setBusyId(null)
  }
  async function reqCorr(id:string){const msg=window.prompt('O que precisa ser corrigido?');if(!msg)return;await act(id,'correcao_solicitada','correcao_solicitada',msg)}
  async function confSp(id:string){
    const spId=cc[id];if(!spId||!session)return
    setBusyId(id)
    await supabase.from('sightings').update({confirmed_species_id:spId,identified_by:session.user.id}).eq('id',id)
    await supabase.from('moderation_actions').insert({sighting_id:id,actor_id:session.user.id,action:'identificacao_confirmada'})
    setBusyId(null);load()
  }

  return(<div className="page">
    {loading&&<p className="center-note">Carregando…</p>}
    {!loading&&items.length===0&&<p className="center-note">Nenhum registro pendente. 🎉</p>}
    <div style={{display:'grid',gap:'0.9rem'}}>
      {items.map((it)=>{
        const venomousDisplay=it.confirmed?.venomous??it.suggested?.venomous??null
        const identificationConfirmed=!!it.confirmed_species_id
        const photos=[...(it.sighting_photos??[])].sort((a,b)=>(b.is_primary?1:0)-(a.is_primary?1:0)||a.order_index-b.order_index)
        const localParts=[it.localidade,it.local_especifico].filter(Boolean).join(' · ')
        const mapsUrl=it.latitude!=null&&it.longitude!=null?`https://www.google.com/maps?q=${it.latitude},${it.longitude}`:null
        return(<div className="card" key={it.id}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem',gap:'0.6rem'}}>
            <strong style={{fontSize:'0.95rem'}}>{it.dont_know_species?(it.reported_name||'Não identificada'):it.suggested?.common_name}</strong>
            <span className="status-tag" style={{background:'var(--amarelo-bg)',color:'var(--amarelo-alerta)',flexShrink:0}}>{STATUS_LABELS[it.status]}</span>
          </div>

          {/* Veredito peçonhenta/não, baseado nas informações disponíveis */}
          <div style={{marginBottom:'0.7rem'}}><SpeciesStamp venomous={venomousDisplay} confirmed={identificationConfirmed}/></div>

          {/* Espécie sugerida x confirmada */}
          <div style={{fontSize:'0.82rem',marginBottom:'0.6rem'}}>
            <div><span style={{color:'var(--cinza-fraco)'}}>Espécie sugerida: </span><strong>{it.dont_know_species?'não informada':`${it.suggested?.common_name??'—'} (${it.suggested?.scientific_name??'—'})`}</strong></div>
            {it.confirmed&&<div><span style={{color:'var(--cinza-fraco)'}}>Espécie confirmada: </span><strong style={{color:'var(--verde-seguro)'}}>{it.confirmed.common_name} ({it.confirmed.scientific_name})</strong></div>}
          </div>

          {/* Autor */}
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem',marginBottom:'0.3rem'}}>
            <UserIcon size={13} color="var(--cinza-fraco)"/><span><strong>{it.author?.full_name??'—'}</strong>{it.author?.phone&&` · ${it.author.phone}`}</span>
          </div>
          {/* Data e hora */}
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.82rem',marginBottom:'0.3rem'}}>
            <Clock size={13} color="var(--cinza-fraco)"/><span>{it.observation_date?new Date(it.observation_date).toLocaleDateString('pt-BR'):'—'}{it.observation_time&&` às ${it.observation_time.slice(0,5)}`}</span>
          </div>
          {/* Local + geolocalização */}
          <div style={{display:'flex',alignItems:'flex-start',gap:'0.4rem',fontSize:'0.82rem',marginBottom:'0.5rem'}}>
            <MapPin size={13} color="var(--cinza-fraco)" style={{marginTop:2,flexShrink:0}}/>
            <span>
              {it.municipio??'—'}{localParts&&` · ${localParts}`}
              {it.latitude!=null&&it.longitude!=null&&(<><br/><span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:'var(--cinza-fraco)'}}>{it.latitude.toFixed(5)}, {it.longitude.toFixed(5)}{it.gps_accuracy_m?` · ±${Math.round(it.gps_accuracy_m)}m`:''}</span>{mapsUrl&&<> · <a href={mapsUrl} target="_blank" rel="noreferrer" style={{fontWeight:600}}>Ver no mapa <ExternalLink size={10} style={{verticalAlign:'-1px'}}/></a></>}</>)}
            </span>
          </div>
          {(it.animal_condition||it.behavior)&&(
            <div style={{fontSize:'0.82rem',color:'var(--cinza-fraco)',marginBottom:'0.5rem'}}>
              {it.animal_condition&&<>Condição: <strong style={{color:'var(--cinza-medio)'}}>{ANIMAL_CONDITION_LABELS[it.animal_condition]}</strong></>}
              {it.animal_condition&&it.behavior&&' · '}
              {it.behavior&&<>Comportamento: <strong style={{color:'var(--cinza-medio)'}}>{BEHAVIOR_LABELS[it.behavior]}</strong></>}
            </div>
          )}

          {/* Anexos */}
          {photos.length>0&&(<div style={{marginBottom:'0.6rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.3rem',fontSize:'0.78rem',color:'var(--cinza-fraco)',marginBottom:'0.4rem'}}><Paperclip size={12}/> {photos.length} anexo(s)</div>
            <div style={{display:'flex',gap:'0.4rem',overflowX:'auto'}}>
              {photos.map((p)=>(<a href={p.url} target="_blank" rel="noreferrer" key={p.id} style={{flexShrink:0}}>
                {p.media_type==='video'?<video src={p.url} style={{width:64,height:64,borderRadius:8,objectFit:'cover',background:'var(--fundo)'}}/>:<img src={p.url} alt="" style={{width:64,height:64,borderRadius:8,objectFit:'cover',background:'var(--fundo)'}}/>}
              </a>))}
            </div>
          </div>)}

          {it.notes&&<p style={{fontSize:'0.85rem',margin:'0 0 0.6rem'}}>{it.notes}</p>}
          <Link to={`/registro/${it.id}`} style={{fontSize:'0.78rem',fontWeight:700,display:'block',marginBottom:'0.7rem'}}>Ver registro completo →</Link>

          {isAdmin&&(<div style={{display:'flex',gap:'0.4rem',marginBottom:'0.7rem'}}>
            <select className="input" style={{flex:1,fontSize:'0.82rem',padding:'0.5rem 0.6rem'}} value={cc[it.id]??''} onChange={(e)=>setCc((c)=>({...c,[it.id]:e.target.value}))}>
              <option value="">Confirmar espécie oficial…</option>
              {species.map((s)=><option key={s.id} value={s.id}>{s.common_name} ({s.venomous?'peçonhenta':'não peçonhenta'})</option>)}
            </select>
            <button className="btn btn-secondary btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={!cc[it.id]||busyId===it.id} onClick={()=>confSp(it.id)}>Confirmar</button>
          </div>)}

          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
            <button className="btn btn-primary btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>act(it.id,'aprovado','aprovado')}><Check size={14}/> Aprovar</button>
            <button className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>reqCorr(it.id)}><MessageSquareWarning size={14}/> Correção</button>
            <button className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>act(it.id,'revisao_especialista','revisao_especialista')}><Stethoscope size={14}/> Especialista</button>
            <button className="btn btn-danger btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>act(it.id,'rejeitado','rejeitado')}><X size={14}/> Rejeitar</button>
          </div>
        </div>)
      })}
    </div>
  </div>)
}

interface UserRow{id:string;full_name:string;city:string|null;role:Role;active:boolean;created_at:string}
const ROLE_LABELS:Record<Role,string>={usuario:'Usuário',moderador:'Moderador',admin:'Administrador'}

function UserManagement(){
  const[users,setUsers]=useState<UserRow[]>([])
  const[loading,setLoading]=useState(true)
  const[busyId,setBusyId]=useState<string|null>(null)

  async function load(){
    setLoading(true)
    const{data}=await supabase.from('profiles').select('id,full_name,city,role,active,created_at').order('created_at',{ascending:false})
    setUsers((data as UserRow[])??[])
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  async function changeRole(id:string,role:Role){setBusyId(id);await supabase.from('profiles').update({role}).eq('id',id);setBusyId(null);load()}
  async function toggleActive(u:UserRow){setBusyId(u.id);await supabase.from('profiles').update({active:!u.active}).eq('id',u.id);setBusyId(null);load()}

  return(<div>
    {loading&&<p className="center-note">Carregando…</p>}
    {!loading&&users.length===0&&<p className="center-note">Nenhum usuário cadastrado.</p>}
    <div style={{display:'grid',gap:'0.6rem'}}>
      {users.map((u)=>(<div className="card" key={u.id} style={{opacity:u.active?1:0.55}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
          <div>
            <div style={{fontWeight:700,fontSize:'0.92rem'}}>{u.full_name}{!u.active&&' (inativo)'}</div>
            <div style={{fontSize:'0.78rem',color:'var(--cinza-fraco)'}}>{u.city??'—'} · desde {new Date(u.created_at).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'0.4rem'}}>
          <select className="input" style={{flex:1,fontSize:'0.82rem',padding:'0.5rem 0.6rem'}} value={u.role} disabled={busyId===u.id} onChange={(e)=>changeRole(u.id,e.target.value as Role)}>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r)=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <button className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===u.id} onClick={()=>toggleActive(u)}>{u.active?'Desativar':'Ativar'}</button>
        </div>
      </div>))}
    </div>
  </div>)
}

interface StatsSighting{status:SightingStatus;municipio:string|null;confirmed_species_id:string|null;observation_date:string|null;created_at:string}
interface QuickStats{total_sightings:number;total_species:number;total_users:number;municipalities:number}
const CHART_COLORS=['#E5000F','#1a6b2f','#b45309','#444444','#888888','#1a1a1a']
const STATUS_ORDER:SightingStatus[]=['aguardando_revisao','em_revisao','correcao_solicitada','revisao_especialista','aprovado','rejeitado']

function StatsPanel(){
  const[sightings,setSightings]=useState<StatsSighting[]>([])
  const[speciesNames,setSpeciesNames]=useState<Record<string,string>>({})
  const[quick,setQuick]=useState<QuickStats|null>(null)
  const[loading,setLoading]=useState(true)

  useEffect(()=>{
    async function load(){
      const[sRes,spRes,statsRes]=await Promise.all([
        supabase.from('sightings').select('status,municipio,confirmed_species_id,observation_date,created_at'),
        supabase.from('species').select('id,common_name'),
        supabase.from('stats').select('*').maybeSingle(),
      ])
      setSightings((sRes.data as StatsSighting[])??[])
      setSpeciesNames(Object.fromEntries(((spRes.data as{id:string;common_name:string}[])??[]).map((s)=>[s.id,s.common_name])))
      setQuick((statsRes.data as QuickStats)??null)
      setLoading(false)
    }
    load()
  },[])

  if(loading)return<p className="center-note">Carregando…</p>
  if(sightings.length===0)return(<div>
    {quick&&<QuickStatsGrid quick={quick}/>}
    <p className="center-note">Ainda não há registros para gerar estatísticas de avistamentos.</p>
  </div>)

  const byStatus=STATUS_ORDER.map((status)=>({status:STATUS_LABELS[status],count:sightings.filter((s)=>s.status===status).length})).filter((d)=>d.count>0)

  const approved=sightings.filter((s)=>s.status==='aprovado')
  const bySpeciesMap=new Map<string,number>()
  approved.forEach((s)=>{if(s.confirmed_species_id){const name=speciesNames[s.confirmed_species_id]??'—';bySpeciesMap.set(name,(bySpeciesMap.get(name)??0)+1)}})
  const bySpecies=[...bySpeciesMap.entries()].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,8)

  const byMunicipioMap=new Map<string,number>()
  approved.forEach((s)=>{if(s.municipio)byMunicipioMap.set(s.municipio,(byMunicipioMap.get(s.municipio)??0)+1)})
  const byMunicipio=[...byMunicipioMap.entries()].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,8)

  const byMonthMap=new Map<string,number>()
  approved.forEach((s)=>{const d=s.observation_date??s.created_at;if(!d)return;const key=d.slice(0,7);byMonthMap.set(key,(byMonthMap.get(key)??0)+1)})
  const byMonth=[...byMonthMap.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([month,count])=>({month,count}))

  const venomousCount=approved.filter((s)=>s.confirmed_species_id).length

  return(<div>
    {quick&&<QuickStatsGrid quick={quick}/>}

    <h3 style={{fontSize:'0.85rem',color:'var(--cinza-fraco)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.6rem'}}>Registros por status</h3>
    <div className="card" style={{marginBottom:'1.2rem',padding:'1rem 0.5rem'}}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={byStatus}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--cinza-linha)"/>
          <XAxis dataKey="status" tick={{fontSize:10}} interval={0} angle={-20} textAnchor="end" height={60}/>
          <YAxis allowDecimals={false} tick={{fontSize:11}}/>
          <Tooltip/>
          <Bar dataKey="count" fill="var(--vermelho)" radius={[6,6,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {bySpecies.length>0&&(<>
      <h3 style={{fontSize:'0.85rem',color:'var(--cinza-fraco)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.6rem'}}>Espécies mais registradas (aprovados)</h3>
      <div className="card" style={{marginBottom:'1.2rem',padding:'1rem 0.5rem'}}>
        <ResponsiveContainer width="100%" height={Math.max(180,bySpecies.length*36)}>
          <BarChart data={bySpecies} layout="vertical" margin={{left:8}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--cinza-linha)"/>
            <XAxis type="number" allowDecimals={false} tick={{fontSize:11}}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:10}} width={140}/>
            <Tooltip/>
            <Bar dataKey="count" fill="var(--verde-seguro)" radius={[0,6,6,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>)}

    {byMunicipio.length>0&&(<>
      <h3 style={{fontSize:'0.85rem',color:'var(--cinza-fraco)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.6rem'}}>Municípios com mais registros</h3>
      <div className="card" style={{marginBottom:'1.2rem',padding:'1rem 0.5rem'}}>
        <ResponsiveContainer width="100%" height={Math.max(180,byMunicipio.length*36)}>
          <BarChart data={byMunicipio} layout="vertical" margin={{left:8}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--cinza-linha)"/>
            <XAxis type="number" allowDecimals={false} tick={{fontSize:11}}/>
            <YAxis type="category" dataKey="name" tick={{fontSize:10}} width={110}/>
            <Tooltip/>
            <Bar dataKey="count" fill="var(--amarelo-alerta)" radius={[0,6,6,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>)}

    {byMonth.length>1&&(<>
      <h3 style={{fontSize:'0.85rem',color:'var(--cinza-fraco)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.6rem'}}>Registros aprovados ao longo do tempo</h3>
      <div className="card" style={{marginBottom:'1.2rem',padding:'1rem 0.5rem'}}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--cinza-linha)"/>
            <XAxis dataKey="month" tick={{fontSize:10}}/>
            <YAxis allowDecimals={false} tick={{fontSize:11}}/>
            <Tooltip/>
            <Line type="monotone" dataKey="count" stroke="var(--vermelho)" strokeWidth={2} dot={{r:3}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>)}

    <h3 style={{fontSize:'0.85rem',color:'var(--cinza-fraco)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.6rem'}}>Identificação dos aprovados</h3>
    <div className="card" style={{display:'flex',alignItems:'center',gap:'1.2rem',padding:'1rem'}}>
      <ResponsiveContainer width={110} height={110}>
        <PieChart>
          <Pie data={[{name:'Identificados',value:venomousCount},{name:'Aguardando',value:approved.length-venomousCount}]} dataKey="value" innerRadius={30} outerRadius={50}>
            {[0,1].map((i)=><Cell key={i} fill={CHART_COLORS[i]}/>)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{fontSize:'0.82rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.3rem'}}><span style={{width:10,height:10,borderRadius:'50%',background:CHART_COLORS[0],display:'inline-block'}}/> Espécie confirmada: <strong>{venomousCount}</strong></div>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}><span style={{width:10,height:10,borderRadius:'50%',background:CHART_COLORS[1],display:'inline-block'}}/> Aguardando identificação: <strong>{approved.length-venomousCount}</strong></div>
      </div>
    </div>
  </div>)
}

function QuickStatsGrid({quick}:{quick:QuickStats}){
  return(<div className="stat-grid" style={{margin:'0 0 1.4rem',gridTemplateColumns:'repeat(2,1fr)'}}>
    <div className="stat-box"><span className="n">{quick.total_sightings}</span><span className="l">registros aprovados</span></div>
    <div className="stat-box"><span className="n">{quick.total_species}</span><span className="l">espécies ativas</span></div>
    <div className="stat-box"><span className="n">{quick.municipalities}</span><span className="l">municípios</span></div>
    <div className="stat-box"><span className="n">{quick.total_users}</span><span className="l">usuários ativos</span></div>
  </div>)
}

export default function Admin(){
  const{isModeratorOrAdmin,isAdmin}=useAuth()
  const[tab,setTab]=useState<'aprovacoes'|'estatisticas'|'especies'|'usuarios'>('aprovacoes')

  if(!isModeratorOrAdmin)return<p className="center-note">Esta área é restrita a moderadores e administradores.</p>

  return(<div>
    <div className="page-header" style={{paddingBottom:'0.8rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}><ShieldCheck size={22} color="var(--vermelho)"/><h1 style={{margin:0}}>Administração</h1></div>
    </div>
    <div className="tab-row">
      <button className={tab==='aprovacoes'?'active':''} onClick={()=>setTab('aprovacoes')}>Aprovações</button>
      {isAdmin&&<button className={tab==='estatisticas'?'active':''} onClick={()=>setTab('estatisticas')}><BarChart3 size={13} style={{verticalAlign:'-2px',marginRight:'0.25rem'}}/>Estatísticas</button>}
      {isAdmin&&<button className={tab==='especies'?'active':''} onClick={()=>setTab('especies')}>Espécies</button>}
      {isAdmin&&<button className={tab==='usuarios'?'active':''} onClick={()=>setTab('usuarios')}><Users size={13} style={{verticalAlign:'-2px',marginRight:'0.25rem'}}/>Usuários</button>}
    </div>
    <div className="page">
      {tab==='aprovacoes'&&<Approvals/>}
      {tab==='estatisticas'&&isAdmin&&<StatsPanel/>}
      {tab==='especies'&&isAdmin&&<SpeciesManagement/>}
      {tab==='usuarios'&&isAdmin&&<UserManagement/>}
    </div>
  </div>)
}
