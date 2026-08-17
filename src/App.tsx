import { Suspense, lazy } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Explore from './pages/Explore'
import WhatToDo from './pages/WhatToDo'
import HowToIdentify from './pages/HowToIdentify'
import FirstAid from './pages/FirstAid'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Telas com dependências mais pesadas (mapa/formulário) entram em chunks separados
const SpeciesDetail = lazy(() => import('./pages/SpeciesDetail'))
const RegisterSighting = lazy(() => import('./pages/RegisterSighting'))
const Profile = lazy(() => import('./pages/Profile'))
const MapPage = lazy(() => import('./pages/MapPage'))
const RecordDetail = lazy(() => import('./pages/RecordDetail'))
const Moderation = lazy(() => import('./pages/Moderation'))

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          É uma cobra venenosa?
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/o-que-fazer" title="O que fazer ao ver uma cobra?" style={{ color: 'var(--pergaminho)' }}>
          <ShieldAlert size={19} />
        </Link>
        {!isAuthenticated && (
          <Link to="/entrar" style={{ color: 'var(--pergaminho)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginLeft: '0.9rem' }}>
            Entrar
          </Link>
        )}
      </header>

      <main className="app-main">
        <Suspense fallback={<p className="center-note">Carregando…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explorar" element={<Explore />} />
            <Route path="/explorar/especie/:id" element={<SpeciesDetail />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/registro/:id" element={<RecordDetail />} />
            <Route path="/o-que-fazer" element={<WhatToDo />} />
            <Route path="/como-identificar" element={<HowToIdentify />} />
            <Route path="/primeiros-socorros" element={<FirstAid />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/cadastrar" element={<Signup />} />
            <Route path="/registrar" element={<ProtectedRoute><RegisterSighting /></ProtectedRoute>} />
            <Route path="/registrar/:id" element={<ProtectedRoute><RegisterSighting /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/moderacao" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
            <Route path="*" element={<p className="center-note">Página não encontrada.</p>} />
          </Routes>
        </Suspense>
      </main>

      <NavBar />
    </div>
  )
}
