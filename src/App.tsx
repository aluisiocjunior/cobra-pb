import{Suspense,lazy}from 'react'
import{Routes,Route,Link,useLocation}from 'react-router-dom'
import{ShieldAlert,WifiOff}from 'lucide-react'
import{useAuth}from './context/AuthContext'
import{useOnlineStatus}from './lib/useOnlineStatus'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Explore from './pages/Explore'
import WhatToDo from './pages/WhatToDo'
import HowToIdentify from './pages/HowToIdentify'
import FirstAid from './pages/FirstAid'
import Login from './pages/Login'
import Signup from './pages/Signup'
const SpeciesDetail=lazy(()=>import('./pages/SpeciesDetail'))
const RegisterSighting=lazy(()=>import('./pages/RegisterSighting'))
const Profile=lazy(()=>import('./pages/Profile'))
const MapPage=lazy(()=>import('./pages/MapPage'))
const RecordDetail=lazy(()=>import('./pages/RecordDetail'))
const Moderation=lazy(()=>import('./pages/Moderation'))
const SpeciesManagement=lazy(()=>import('./pages/SpeciesManagement'))
const Admin=lazy(()=>import('./pages/Admin'))
const PrivacyPolicy=lazy(()=>import('./pages/PrivacyPolicy'))
export default function App(){
  const{isAuthenticated,loading}=useAuth()
  const location=useLocation()
  const isOnline=useOnlineStatus()
  const isLandingScreen=location.pathname==='/'&&!isAuthenticated&&!loading
  return(<div className="app-shell">
    {!isOnline&&(
      <div style={{background:'var(--preto)',color:'var(--branco)',fontSize:'0.75rem',fontWeight:600,textAlign:'center',padding:'0.4rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
        <WifiOff size={13}/> Você está offline — mostrando dados salvos anteriormente
      </div>
    )}
    {!isLandingScreen&&(
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C5 2 2 4 2 8s3 6 6 6 6-3 6-6-2-6-6-6z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M5 8c0-1.7 1.3-3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </span>
          É uma cobra venenosa?
        </Link>
        <div style={{flex:1}}/>
        <Link to="/o-que-fazer" title="O que fazer?" style={{color:'var(--cinza-medio)'}}><ShieldAlert size={20}/></Link>
        {!isAuthenticated&&<Link to="/entrar" style={{color:'var(--vermelho)',fontWeight:700,fontSize:'0.85rem',marginLeft:'0.8rem',textDecoration:'none'}}>Entrar</Link>}
      </header>
    )}
    <main className="app-main" style={isLandingScreen?{padding:0,maxWidth:'none'}:undefined}><Suspense fallback={<p className="center-note">Carregando…</p>}><Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/explorar" element={<Explore/>}/>
      <Route path="/explorar/especie/:id" element={<SpeciesDetail/>}/>
      <Route path="/mapa" element={<MapPage/>}/>
      <Route path="/registro/:id" element={<RecordDetail/>}/>
      <Route path="/o-que-fazer" element={<WhatToDo/>}/>
      <Route path="/como-identificar" element={<HowToIdentify/>}/>
      <Route path="/primeiros-socorros" element={<FirstAid/>}/>
      <Route path="/entrar" element={<Login/>}/>
      <Route path="/cadastrar" element={<Signup/>}/>
      <Route path="/registrar" element={<ProtectedRoute><RegisterSighting/></ProtectedRoute>}/>
      <Route path="/registrar/:id" element={<ProtectedRoute><RegisterSighting/></ProtectedRoute>}/>
      <Route path="/perfil" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
      <Route path="/moderacao" element={<ProtectedRoute><Moderation/></ProtectedRoute>}/>
      <Route path="/admin" element={<ProtectedRoute><Admin/></ProtectedRoute>}/>
      <Route path="/admin/especies" element={<ProtectedRoute><SpeciesManagement/></ProtectedRoute>}/>
      <Route path="/privacidade" element={<PrivacyPolicy/>}/>
      <Route path="*" element={<p className="center-note">Página não encontrada.</p>}/>
    </Routes></Suspense></main>
    {!isLandingScreen&&<NavBar/>}
  </div>)
}
