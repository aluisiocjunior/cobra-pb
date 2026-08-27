import { useEffect, useState } from 'react'
import { Phone, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { FirstAidInfo } from '../lib/types'

const DO_LIST = [
  'Mantenha a calma e afaste-se do animal',
  'Lave o local da picada com água e sabão',
  'Procure atendimento médico imediatamente',
  'Se possível, tire uma foto do animal à distância para ajudar na identificação',
]

const DONT_LIST = [
  'Não faça torniquete',
  'Não corte o local da picada',
  'Não tente sugar o veneno',
  'Não aplique substâncias, ervas ou produtos caseiros',
  'Não utilize tratamentos caseiros',
  'Não tente capturar o animal para levar ao hospital',
]

export default function FirstAid() {
  const [items, setItems] = useState<FirstAidInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('first_aid_info').select('*').order('order_index').then(({ data }) => {
      setItems((data as FirstAidInfo[]) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="page">
      <span className="eyebrow">Emergência</span>
      <h1>Primeiros socorros</h1>
      <p>Orientações objetivas para acidentes com serpentes na Paraíba.</p>

      <a href="tel:192" className="samu-btn" style={{ marginBottom: '1.2rem' }}>
        <Phone size={20} /> LIGAR PARA O SAMU — 192
      </a>

      <h2>Em caso de picada, faça:</h2>
      <div className="card" style={{ marginBottom: '1.1rem' }}>
        {DO_LIST.map((t) => (
          <div key={t} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <Check size={16} color="var(--verde-seguro)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: '0.9rem' }}>{t}</span>
          </div>
        ))}
      </div>

      <h2>Nunca faça:</h2>
      <div className="card" style={{ marginBottom: '1.1rem', background: 'var(--vermelho-perigo-bg)', borderColor: 'var(--vermelho-perigo)' }}>
        {DONT_LIST.map((t) => (
          <div key={t} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <X size={16} color="var(--vermelho-perigo)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: '0.9rem' }}>{t}</span>
          </div>
        ))}
      </div>

      {!loading && items.length > 0 && (
        <>
          <h2>Mais informações</h2>
          <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem' }}>
            {items.map((it) => (
              <div className="card" key={it.id}>
                <h3>{it.title}</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', whiteSpace: 'pre-line' }}>{it.content}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="field hint">Conteúdo baseado em orientações de fontes institucionais de saúde.</p>
    </div>
  )
}
