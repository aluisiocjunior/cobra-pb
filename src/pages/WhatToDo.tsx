import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { PageContent } from '../lib/types'

const DEFAULT_CONTENT = `Siga estas orientações para evitar acidentes e proteger tanto você quanto o animal.

Mantenha distância
Afaste-se com calma. A maioria dos acidentes acontece quando a pessoa se aproxima ou tenta manusear o animal.

Não toque
Mesmo cobras não peçonhentas podem morder em defesa. Nunca tente pegar ou empurrar o animal.

Não tente capturar
Captura deve ser feita apenas por órgãos especializados, nunca por conta própria.

Não provoque
Não jogue objetos, não faça barulho para espantar e não bloqueie a fuga do animal.

Não tente matar
Serpentes têm papel ecológico importante e são protegidas por lei. Afastar-se é sempre a opção mais segura.

Não se aproxime para fotografar
Fotografe somente de uma distância segura, sem se aproximar do animal para conseguir uma foto melhor.

Registre somente se for seguro
Use o app para registrar o avistamento apenas quando isso não colocar você em risco.

Acione os órgãos responsáveis
Em áreas urbanas ou quando houver risco, contate a Defesa Civil, o Corpo de Bombeiros ou o órgão ambiental local.`

export default function WhatToDo() {
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    supabase.from('page_content').select('content').eq('key', 'o_que_fazer').maybeSingle().then(({ data }) => {
      const c = (data as PageContent | null)?.content
      if (c && c.trim()) setContent(c)
    })
  }, [])

  return (
    <div className="page">
      <span className="eyebrow">Segurança</span>
      <h1>O que fazer ao ver uma cobra?</h1>

      <div className="card" style={{ margin: '1rem 0 1.2rem' }}>
        <p style={{ margin: 0, fontSize: '0.92rem', whiteSpace: 'pre-line' }}>{content}</p>
      </div>

      <div className="banner banner-warn">
        Foi picado ou está com alguém que foi? Vá direto para <Link to="/primeiros-socorros"><strong>Primeiros socorros</strong></Link>.
      </div>

      <Link to="/como-identificar" className="btn btn-outline">Como identificar uma cobra?</Link>
    </div>
  )
}
