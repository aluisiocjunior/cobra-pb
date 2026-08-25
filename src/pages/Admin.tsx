import{useEffect,useState}from 'react'
import{Link}from 'react-router-dom'
import{Check,X,MessageSquareWarning,Stethoscope,ShieldCheck,Users}from 'lucide-react'
import{supabase}from '../lib/supabase'
import{useAuth}from '../context/AuthContext'
import type{Species,SightingStatus,Role}from '../lib/types'
import{STATUS_LABELS}from '../lib/types'
import SpeciesManagement from './SpeciesManagement'

const PND:SightingStatus[]=['aguardando_revisao','em_revisao','correcao_solicitada','revisao_especialista']

interface Item{id:string;status:SightingStatus;municipio:string|null;observation_date:string|null;notes:string|null;reported_name:string|null;dont_know_species:boolean;confirmed_species_id:string|null;suggested:{common_name:string}|null}

function Approvals(){
  const{session,isAdmin}=useAuth()
  const[items,setItems]=useState<Item[]>([])
  const[species,setSpecies]=useState<Species[]>([])
  const[loading,setLoading]=useState(true)
  const[busyId,setBusyId]=useState<string|null>(null)
  const[cc,setCc]=useState<Record<string,string>>({})

  async function load(){
    setLoading(true)
    const{data}=await supabase.from('sightings').select('id,status,municipio,observation_date,notes,reported_name,dont_know_species,confirmed_species_id,suggested:species!sightings_species_id_fkey(common_name)').in('status',PND).order('created_at',{ascending:true})
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
    <div style={{display:'grid',gap:'0.8rem'}}>
      {items.map((it)=>(<div className="card" key={it.id}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
          <strong style={{fontSize:'0.95rem'}}>{it.dont_know_species?(it.reported_name||'Não identificada'):it.suggested?.common_name}</strong>
          <span className="status-tag" style={{background:'var(--amarelo-bg)',color:'var(--amarelo-alerta)'}}>{STATUS_LABELS[it.status]}</span>
        </div>
        <div style={{fontSize:'0.78rem',color:'var(--cinza-fraco)',marginBottom:'0.5rem'}}>{it.municipio??'—'} · {it.observation_date?new Date(it.observation_date).toLocaleDateString('pt-BR'):''}</div>
        {it.notes&&<p style={{fontSize:'0.85rem',margin:'0 0 0.5rem'}}>{it.notes}</p>}
        <Link to={`/registro/${it.id}`} style={{fontSize:'0.78rem',fontWeight:700,display:'block',marginBottom:'0.7rem'}}>Ver registro completo →</Link>
        {isAdmin&&(<div style={{display:'flex',gap:'0.4rem',marginBottom:'0.7rem'}}>
          <select className="input" style={{flex:1,fontSize:'0.82rem',padding:'0.5rem 0.6rem'}} value={cc[it.id]??''} onChange={(e)=>setCc((c)=>({...c,[it.id]:e.target.value}))}>
            <option value="">Confirmar espécie oficial…</option>
            {species.map((s)=><option key={s.id} value={s.id}>{s.common_name} ({s.venomous?'peçonhenta':'não peçonhenta'})</option>)}
          </select>
          <button className="btn btn-secondary btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={!cc[it.id]||busyId===it.id} onClick={()=>confSp(it.id)}>Confirmar</button>
        </div>)}
        {it.confirmed_species_id&&<p className="hint" style={{color:'var(--verde-seguro)'}}>Espécie já confirmada.</p>}
        <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
          <button className="btn btn-primary btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>act(it.id,'aprovado','aprovado')}><Check size={14}/> Aprovar</button>
          <button className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>reqCorr(it.id)}><MessageSquareWarning size={14}/> Correção</button>
          <button className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>act(it.id,'revisao_especialista','revisao_especialista')}><Stethoscope size={14}/> Especialista</button>
          <button className="btn btn-danger btn-sm btn-auto" style={{borderRadius:'8px'}} disabled={busyId===it.id} onClick={()=>act(it.id,'rejeitado','rejeitado')}><X size={14}/> Rejeitar</button>
        </div>
      </div>))}
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

export default function Admin(){
  const{isModeratorOrAdmin,isAdmin}=useAuth()
  const[tab,setTab]=useState<'aprovacoes'|'especies'|'usuarios'>('aprovacoes')

  if(!isModeratorOrAdmin)return<p className="center-note">Esta área é restrita a moderadores e administradores.</p>

  return(<div>
    <div className="page-header" style={{paddingBottom:'0.8rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}><ShieldCheck size={22} color="var(--vermelho)"/><h1 style={{margin:0}}>Administração</h1></div>
    </div>
    <div className="tab-row">
      <button className={tab==='aprovacoes'?'active':''} onClick={()=>setTab('aprovacoes')}>Aprovações</button>
      {isAdmin&&<button className={tab==='especies'?'active':''} onClick={()=>setTab('especies')}>Espécies</button>}
      {isAdmin&&<button className={tab==='usuarios'?'active':''} onClick={()=>setTab('usuarios')}><Users size={13} style={{verticalAlign:'-2px',marginRight:'0.25rem'}}/>Usuários</button>}
    </div>
    <div className="page">
      {tab==='aprovacoes'&&<Approvals/>}
      {tab==='especies'&&isAdmin&&<SpeciesManagement/>}
      {tab==='usuarios'&&isAdmin&&<UserManagement/>}
    </div>
  </div>)
}
