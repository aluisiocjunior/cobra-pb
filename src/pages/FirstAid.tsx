import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { FirstAidInfo, PageContent } from '../lib/types'

const DEFAULT_CONTENT = `Orientações objetivas para acidentes com serpentes na Paraíba.

Em caso de picada, faça:
- Mantenha a calma e afaste-se do animal
- Lave o local da picada com água e sabão
- Procure atendimento médico imediatamente
- Se possível, tire uma foto do animal à distância para ajudar na identificação

Nunca faça:
- Não faça torniquete
- Não corte o local da picada
- Não tente sugar o veneno
- Não aplique substâncias, ervas ou produtos caseiros
- Não utilize tratamentos caseiros
- Não tente capturar o animal para levar ao hospital`

export default function FirstAid() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [items, setItems] = useState<FirstAidInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('page_content').select('content').eq('key', 'primeiros_socorros').maybeSingle(),
      supabase.from('first_aid_info').select('*').order('order_index'),
    ]).then(([pc, fa]) => {
      const c = (pc.data as PageContent | null)?.content
      if (c && c.trim()) setContent(c)
      setItems((fa.data as FirstAidInfo[]) ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="page">
      <span className="eyebrow">Emergência</span>
      <h1>Primeiros socorros</h1>

      <a href="tel:192" className="samu-btn" style={{ marginBottom: '1.2rem' }}>
        <Phone size={20} /> LIGAR PARA O SAMU — 192
      </a>

      <div className="card" style={{ marginBottom: '1.1rem' }}>
        <p style={{ margin: 0, fontSize: '0.92rem', whiteSpace: 'pre-line' }}>{content}</p>
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
