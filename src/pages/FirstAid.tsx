import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { FirstAidInfo, PageContent } from '../lib/types'
import {
  IconDorLocal, IconInchaco, IconSangramento, IconVisaoTurva, IconFaltaAr, IconTontura,
  IconAfasteSe, IconLaveMaos, IconAtendimentoMedico, IconFotoDistancia,
  IconNaoTorniquete, IconNaoCorte, IconNaoSugar, IconNaoRemedioCaseiro,
} from '../components/SafetyIcons'

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

const SYMPTOMS = [
  { Icon: IconDorLocal, label: 'Dor intensa no local' },
  { Icon: IconInchaco, label: 'Inchaço que piora rápido' },
  { Icon: IconSangramento, label: 'Sangramento (local, nariz ou gengiva)' },
  { Icon: IconVisaoTurva, label: 'Visão turva ou dupla' },
  { Icon: IconFaltaAr, label: 'Falta de ar' },
  { Icon: IconTontura, label: 'Tontura ou fraqueza' },
]
const DO_STEPS = [
  { Icon: IconAfasteSe, label: 'Afaste-se com calma' },
  { Icon: IconLaveMaos, label: 'Lave com água e sabão' },
  { Icon: IconAtendimentoMedico, label: 'Procure atendimento médico' },
  { Icon: IconFotoDistancia, label: 'Fotografe à distância, se seguro' },
]
const DONT_STEPS = [
  { Icon: IconNaoTorniquete, label: 'Torniquete' },
  { Icon: IconNaoCorte, label: 'Cortar o local' },
  { Icon: IconNaoSugar, label: 'Sugar o veneno' },
  { Icon: IconNaoRemedioCaseiro, label: 'Remédio caseiro' },
]

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

      <a href="tel:192" className="samu-btn" style={{ marginBottom: '1.3rem' }}>
        <Phone size={20} /> LIGAR PARA O SAMU — 192
      </a>

      <h2 style={{ fontSize: '0.95rem' }}>Fique atento a estes sinais</h2>
      <p className="hint" style={{ marginBottom: '0.7rem' }}>Mesmo sem certeza se a cobra era peçonhenta, procure ajuda médica se notar:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1.3rem' }}>
        {SYMPTOMS.map(({ Icon, label }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '0.7rem 0.4rem' }}>
            <Icon size={36} />
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.25 }}>{label}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '0.95rem' }}>O que fazer</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.4rem', marginBottom: '1.1rem' }}>
        {DO_STEPS.map(({ Icon, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <Icon size={34} />
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.66rem', fontWeight: 600, lineHeight: 1.2 }}>{label}</p>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: '0.95rem', color: 'var(--vermelho)' }}>Nunca faça</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.4rem', marginBottom: '1.3rem' }}>
        {DONT_STEPS.map(({ Icon, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <Icon size={34} />
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.66rem', fontWeight: 600, lineHeight: 1.2 }}>{label}</p>
          </div>
        ))}
      </div>

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
