import { NavLink } from 'react-router-dom'
import { House, Compass, ShieldAlert, Cross, PlusCircle, User } from 'lucide-react'

export default function NavBar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
        <House className="nav-icon" strokeWidth={1.8} />
        Início
      </NavLink>
      <NavLink to="/explorar" className={({ isActive }) => (isActive ? 'active' : '')}>
        <Compass className="nav-icon" strokeWidth={1.8} />
        Explorar
      </NavLink>
      <NavLink
        to="/registrar"
        className={({ isActive }) => 'cta-registrar' + (isActive ? ' active' : '')}
      >
        <span className="nav-icon-wrap">
          <PlusCircle className="nav-icon" strokeWidth={1.8} color="#2A2118" />
        </span>
        Registrar
      </NavLink>
      <NavLink to="/primeiros-socorros" className={({ isActive }) => (isActive ? 'active' : '')}>
        <Cross className="nav-icon" strokeWidth={1.8} />
        Socorros
      </NavLink>
      <NavLink to="/perfil" className={({ isActive }) => (isActive ? 'active' : '')}>
        <User className="nav-icon" strokeWidth={1.8} />
        Perfil
      </NavLink>
    </nav>
  )
}

export function TopWarningLink() {
  return (
    <NavLink to="/o-que-fazer" className="banner-link">
      <ShieldAlert size={14} /> O que fazer ao ver uma cobra?
    </NavLink>
  )
}
