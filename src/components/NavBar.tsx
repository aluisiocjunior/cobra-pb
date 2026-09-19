import{NavLink}from 'react-router-dom'
import{House,Compass,Cross,Plus,User}from 'lucide-react'
export default function NavBar(){return(<nav className="bottom-nav">
  <NavLink to="/" end className={({isActive})=>isActive?'active':''}><span className="nav-icon-pill"><House className="nav-icon" strokeWidth={1.8}/></span>Início</NavLink>
  <NavLink to="/explorar" className={({isActive})=>isActive?'active':''}><span className="nav-icon-pill"><Compass className="nav-icon" strokeWidth={1.8}/></span>Explorar</NavLink>
  <NavLink to="/registrar" className={({isActive})=>'cta-registrar'+(isActive?' active':'')}><span className="nav-icon-wrap"><Plus className="nav-icon" strokeWidth={2.4} color="white"/></span><span className="sr-only">Registrar avistamento</span></NavLink>
  <NavLink to="/primeiros-socorros" className={({isActive})=>isActive?'active':''}><span className="nav-icon-pill"><Cross className="nav-icon" strokeWidth={1.8}/></span>Socorros</NavLink>
  <NavLink to="/perfil" className={({isActive})=>isActive?'active':''}><span className="nav-icon-pill"><User className="nav-icon" strokeWidth={1.8}/></span>Perfil</NavLink>
</nav>)}
