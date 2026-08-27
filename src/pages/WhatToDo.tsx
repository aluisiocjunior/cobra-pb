import { Link } from 'react-router-dom'
import { Ban, Hand, Camera, Flame, PawPrint, Footprints, ClipboardList, PhoneCall } from 'lucide-react'

const ITEMS = [
  { icon: Footprints, title: 'Mantenha distância', text: 'Afaste-se com calma. A maioria dos acidentes acontece quando a pessoa se aproxima ou tenta manusear o animal.' },
  { icon: Hand, title: 'Não toque', text: 'Mesmo cobras não peçonhentas podem morder em defesa. Nunca tente pegar ou empurrar o animal.' },
  { icon: PawPrint, title: 'Não tente capturar', text: 'Captura deve ser feita apenas por órgãos especializados, nunca por conta própria.' },
  { icon: Ban, title: 'Não provoque', text: 'Não jogue objetos, não faça barulho para espantar e não bloqueie a fuga do animal.' },
  { icon: Flame, title: 'Não tente matar', text: 'Serpentes têm papel ecológico importante e são protegidas por lei. Afastar-se é sempre a opção mais segura.' },
  { icon: Camera, title: 'Não se aproxime para fotografar', text: 'Fotografe somente de uma distância segura, sem se aproximar do animal para conseguir uma foto melhor.' },
  { icon: ClipboardList, title: 'Registre somente se for seguro', text: 'Use o app para registrar o avistamento apenas quando isso não colocar você em risco.' },
  { icon: PhoneCall, title: 'Acione os órgãos responsáveis', text: 'Em áreas urbanas ou quando houver risco, contate a Defesa Civil, o Corpo de Bombeiros ou o órgão ambiental local.' },
]

export default function WhatToDo() {
  return (
    <div className="page">
      <span className="eyebrow">Segurança</span>
      <h1>O que fazer ao ver uma cobra?</h1>
      <p>Siga estas orientações para evitar acidentes e proteger tanto você quanto o animal.</p>

      <div style={{ display: 'grid', gap: '0.7rem', margin: '1.2rem 0' }}>
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div className="card" key={title} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--verde-mata)', color: 'var(--pergaminho)', borderRadius: 10, padding: '0.5rem', flexShrink: 0 }}>
              <Icon size={18} />
            </div>
            <div>
              <h3 style={{ marginBottom: '0.2rem' }}>{title}</h3>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="banner banner-warn">
        Foi picado ou está com alguém que foi? Vá direto para <Link to="/primeiros-socorros"><strong>Primeiros socorros</strong></Link>.
      </div>

      <Link to="/como-identificar" className="btn btn-outline">Como identificar uma cobra?</Link>
    </div>
  )
}
