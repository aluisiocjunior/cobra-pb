import{useEffect,useState}from 'react'
import{useSearchParams,Link}from 'react-router-dom'
import{LogOut,Trash2,ShieldCheck,Pencil,Eye,Bell,BellOff,Share}from 'lucide-react'
import{supabase}from '../lib/supabase'
import{useAuth}from '../context/AuthContext'
import{STATUS_LABELS,type SightingStatus}from '../lib/types'
import{getPushStatus,subscribeToPush,unsubscribeFromPush,type PushStatus}from '../lib/push'
const ED:SightingStatus[]=['aguardando_revisao','correcao_solicitada']
const SC:Record<SightingStatus,string>={aguardando_revisao:'var(--amarelo-bg)',em_revisao:'var(--amarelo-bg)',correcao_solicitada:'var(--vermelho-bg)',revisao_especialista:'var(--amarelo-bg)',aprovado:'var(--verde-seguro-bg)',rejeitado:'var(--vermelho-bg)'}
const ST:Record<SightingStatus,string>={aguardando_revisao:'var(--amarelo-alerta)',em_revisao:'var(--amarelo-alerta)',correcao_solicitada:'var(--vermelho)',revisao_especialista:'var(--amarelo-alerta)',aprovado:'var(--verde-seguro)',rejeitado:'var(--vermelho)'}
interface MS{id:string;status:SightingStatus;municipio:string|null;observation_date:string|null;created_at:string;suggested:{common_name:string}|null;confirmed:{common_name:string}|null;photo?:string|null}
export default function Profile(){
  const{profile,session,signOut,refreshProfile,isModeratorOrAdmin}=useAuth()
  const[params,setParams]=useSearchParams();const tab=params.get('tab')==='meus-registros'?'meus-registros':'perfil'
  const[phone,setPhone]=useState('');const[city,setCity]=useState('');const[state,setState]=useState('PB');const[notifyEnabled,setNotifyEnabled]=useState(true);const[phonePublic,setPhonePublic]=useState(false);const[saving,setSaving]=useState(false);const[saved,setSaved]=useState(false)
  const[sightings,setSightings]=useState<MS[]>([]);const[ls,setLs]=useState(true)
  const[pushStatus,setPushStatus]=useState<PushStatus>('not-subscribed');const[pushBusy,setPushBusy]=useState(false);const[pushError,setPushError]=useState<string|null>(null)
  const[testSent,setTestSent]=useState<'idle'|'sending'|'ok'|'error'>('idle');const[testMsg,setTestMsg]=useState<string|null>(null)
  useEffect(()=>{getPushStatus().then(setPushStatus)},[])
  async function togglePush(){
    if(!session)return;setPushBusy(true);setPushError(null)
    if(pushStatus==='subscribed'){await unsubscribeFromPush();setPushStatus('not-subscribed')}
    else{const r=await subscribeToPush(session.user.id);if(r.ok)setPushStatus('subscribed');else setPushError(r.error??'Não foi possível ativar as notificações.')}
    setPushBusy(false)
  }
  async function sendTestPush(){
    setTestSent('sending');setTestMsg(null)
    const{data,error}=await supabase.functions.invoke('send-test-push')
    if(error||!data?.ok){setTestSent('error');setTestMsg(data?.error??error?.message??'Falha ao enviar.');return}
    setTestSent('ok');setTestMsg(`Enviada para ${data.delivered} dispositivo(s).`)
  }
  useEffect(()=>{if(profile){setPhone(profile.phone??'');setCity(profile.city??'');setState(profile.state??'PB');setNotifyEnabled(profile.notify_enabled);setPhonePublic(profile.phone_public)}},[profile])
  useEffect(()=>{
    if(tab!=='meus-registros'||!session)return;setLs(true)
    supabase.from('sightings').select('id,status,municipio,observation_date,created_at,suggested:species!sightings_species_id_fkey(common_name),confirmed:species!sightings_confirmed_species_id_fkey(common_name),sighting_photos(url,is_primary,order_index)').eq('user_id',session.user.id).order('created_at',{ascending:false}).then(({data})=>{
      const rows=((data as unknown as (MS&{sighting_photos:{url:string;is_primary:boolean;order_index:number}[]})[])?? []).map((r)=>{const ps=[...(r.sighting_photos??[])].sort((a,b)=>(b.is_primary?1:0)-(a.is_primary?1:0)||a.order_index-b.order_index);return{...r,photo:ps[0]?.url??null}})
      setSightings(rows);setLs(false)
    })
  },[tab,session])
  async function saveProfile(e:React.FormEvent){e.preventDefault();if(!profile)return;setSaving(true);setSaved(false);await supabase.from('profiles').update({phone,city,state,notify_enabled:notifyEnabled,phone_public:phonePublic}).eq('id',profile.id);await refreshProfile();setSaving(false);setSaved(true)}
  async function del(id:string){if(!window.confirm('Excluir este registro?'))return;await supabase.from('sightings').delete().eq('id',id);setSightings((s)=>s.filter((x)=>x.id!==id))}
  return(
    <div>
      <div style={{background:'var(--vermelho)',padding:'1.5rem 1.1rem'}}>
        <h1 style={{color:'white',margin:0}}>{profile?.full_name||'Perfil'}</h1>
        <p style={{color:'rgba(255,255,255,0.8)',margin:'0.2rem 0 0',fontSize:'0.88rem'}}>{session?.user.email}</p>
      </div>
      <div className="tab-row">
        <button className={tab==='perfil'?'active':''} onClick={()=>setParams({tab:'perfil'})}>Meus dados</button>
        <button className={tab==='meus-registros'?'active':''} onClick={()=>setParams({tab:'meus-registros'})}>Registros</button>
      </div>
      {isModeratorOrAdmin&&(<div style={{padding:'0.8rem 1.1rem 0'}}><Link to="/admin" className="btn btn-vermelho btn-sm btn-auto" style={{borderRadius:'8px'}}><ShieldCheck size={16}/> Administração</Link></div>)}
      {tab==='perfil'&&(
        <form onSubmit={saveProfile} className="page">
          <div className="field"><label>Telefone</label><input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)}/></div>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'0.6rem'}}>
            <div className="field"><label>Cidade</label><input className="input" value={city} onChange={(e)=>setCity(e.target.value)}/></div>
            <div className="field"><label>Estado</label><input className="input" value={state} onChange={(e)=>setState(e.target.value)} maxLength={2}/></div>
          </div>
          <div className="field"><label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer'}}><input type="checkbox" checked={notifyEnabled} onChange={(e)=>setNotifyEnabled(e.target.checked)}/>Receber notificações</label></div>
          <div className="field">
            {pushStatus==='ios-needs-install'?(
              <div className="banner banner-info" style={{marginBottom:'0.5rem'}}>
                <strong style={{display:'block',marginBottom:'0.5rem'}}><Share size={14} style={{verticalAlign:'-2px',marginRight:'0.3rem'}}/>Instale o app para receber notificações</strong>
                <p style={{margin:'0 0 0.6rem',fontSize:'0.85rem'}}>No iPhone/iPad, notificações só funcionam quando o app está instalado na Tela de Início — abrir pelo Safari ou Chrome direto não é suficiente. É rápido:</p>
                <ol style={{margin:0,paddingLeft:'1.2rem',fontSize:'0.85rem',display:'grid',gap:'0.3rem'}}>
                  <li>Toque no ícone de <strong>Compartilhar</strong> <Share size={12} style={{verticalAlign:'-1px'}}/> na barra do navegador</li>
                  <li>Escolha <strong>"Adicionar à Tela de Início"</strong></li>
                  <li>Abra o app pelo ícone que aparecer na tela — não pelo navegador</li>
                  <li>Volte aqui e toque em "Ativar notificações push"</li>
                </ol>
              </div>
            ):(
              <button type="button" className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px'}} onClick={togglePush} disabled={pushBusy||pushStatus==='unsupported'}>
                {pushStatus==='subscribed'?<><BellOff size={14}/> Desativar notificações push</>:<><Bell size={14}/> Ativar notificações push neste dispositivo</>}
              </button>
            )}
            {pushStatus==='unsupported'&&<p className="field hint">Seu navegador não suporta notificações push.</p>}
            {pushStatus==='denied'&&<p className="field hint">Notificações bloqueadas nas configurações do navegador. Ative em Ajustes do navegador → Notificações.</p>}
            {pushStatus==='subscribed'&&(<div style={{marginTop:'0.5rem'}}>
              <button type="button" className="btn btn-outline btn-sm btn-auto" style={{borderRadius:'8px'}} onClick={sendTestPush} disabled={testSent==='sending'}>
                {testSent==='sending'?'Enviando…':'Enviar notificação de teste'}
              </button>
              {testMsg&&<p className="field hint" style={{color:testSent==='ok'?'var(--verde-seguro)':'var(--vermelho)'}}>{testMsg}</p>}
            </div>)}
            {pushError&&<p className="error-text">{pushError}</p>}
          </div>
          <div className="field"><label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer'}}><input type="checkbox" checked={phonePublic} onChange={(e)=>setPhonePublic(e.target.checked)}/>Permitir que outros vejam meu telefone</label></div>
          {saved&&<p style={{color:'var(--verde-seguro)',fontWeight:600,fontSize:'0.88rem'}}>Perfil atualizado.</p>}
          <button className="btn btn-primary" type="submit" disabled={saving} style={{borderRadius:'999px'}}>{saving?'Salvando…':'Salvar alterações'}</button>
          <button type="button" className="btn btn-outline" style={{marginTop:'0.6rem',borderRadius:'999px'}} onClick={()=>signOut()}><LogOut size={16}/> Sair da conta</button>
          <Link to="/privacidade" style={{display:'block',textAlign:'center',marginTop:'0.9rem',fontSize:'0.8rem',color:'var(--cinza-fraco)'}}>Política de Privacidade</Link>
        </form>
      )}
      {tab==='meus-registros'&&(
        <div>
          <div style={{background:'var(--branco)',borderTop:'1px solid var(--cinza-linha)'}}>
            {ls&&<p className="center-note">Carregando…</p>}
            {!ls&&sightings.length===0&&<p className="center-note">Nenhum avistamento registrado.</p>}
            {sightings.map((s)=>(
              <div key={s.id} style={{display:'flex',alignItems:'center',borderBottom:'1px solid var(--cinza-linha)',background:'var(--branco)'}}>
                <div className="list-row" style={{flex:1,borderBottom:'none',padding:'0.85rem 1.1rem'}}>
                  <div className="thumb">{s.photo&&<img src={s.photo} alt=""/>}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'0.9rem'}}>{s.confirmed?.common_name??s.suggested?.common_name??'Espécie não informada'}</div>
                    <div style={{fontSize:'0.78rem',color:'var(--cinza-fraco)'}}>{s.municipio??'—'}</div>
                    <span className="status-tag" style={{background:SC[s.status],color:ST[s.status],marginTop:'0.3rem',display:'inline-block'}}>{STATUS_LABELS[s.status]}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:'0.3rem',paddingRight:'0.8rem'}}>
                  <Link to={`/registro/${s.id}`} style={{padding:'0.45rem',background:'var(--fundo)',borderRadius:'8px',display:'flex'}}><Eye size={16} color="var(--cinza-medio)"/></Link>
                  {ED.includes(s.status)&&(<Link to={`/registrar/${s.id}`} style={{padding:'0.45rem',background:'var(--fundo)',borderRadius:'8px',display:'flex'}}><Pencil size={16} color="var(--cinza-medio)"/></Link>)}
                  <button style={{padding:'0.45rem',background:'var(--vermelho-bg)',borderRadius:'8px',border:'none',cursor:'pointer',display:'flex'}} onClick={()=>del(s.id)}><Trash2 size={16} color="var(--vermelho)"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
