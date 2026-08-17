import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

const FEATURES = [
  { title: 'Coloração', text: 'Cores e tons variam bastante até dentro da mesma espécie e mudam com a idade do animal. Nunca use apenas a cor para concluir se é perigosa.' },
  { title: 'Padrões do corpo', text: 'Manchas, listras, losangos ou anéis ajudam a comparar com o catálogo, mas várias espécies têm padrões parecidos entre si.' },
  { title: 'Formato do corpo', text: 'Corpo mais robusto ou mais fino, cauda afinada ou com chocalho — observe de longe, sem se aproximar para examinar de perto.' },
  { title: 'Formato da cabeça', text: 'Cabeça triangular é um sinal de atenção, mas não é uma regra absoluta: algumas espécies não peçonhentas também achatam a cabeça quando se sentem ameaçadas.' },
  { title: 'Comportamento', text: 'Postura defensiva, imobilidade, tentativa de fuga ou som de chocalho são pistas importantes sobre o risco imediato, mais do que sobre a espécie em si.' },
  { title: 'Ambiente', text: 'Mata, área urbana, açude, pedreira ou quintal — o tipo de ambiente ajuda a restringir quais espécies são mais prováveis na região.' },
  { title: 'Localização geográfica', text: 'A distribuição conhecida de cada espécie na Paraíba (consulte o Catálogo) é um forte indício, mas os limites nunca são absolutos.' },
]

export default function HowToIdentify() {
  return (
    <div>
      <span className="eyebrow">Educação</span>
      <h1>Como identificar uma cobra?</h1>
      <p>Estas características, observadas em conjunto e à distância, ajudam a comparar com as espécies do catálogo.</p>

      <div className="banner banner-warn">
        <AlertTriangle size={16} style={{ verticalAlign: '-3px', marginRight: '0.3rem' }} />
        Nenhuma característica isolada define, sozinha, se uma cobra é peçonhenta. Em caso de dúvida,
        mantenha distância e não manipule o animal — a identificação oficial é feita por um especialista.
      </div>

      <div style={{ display: 'grid', gap: '0.7rem', margin: '1.2rem 0' }}>
        {FEATURES.map((f) => (
          <div className="card" key={f.title}>
            <h3>{f.title}</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>{f.text}</p>
          </div>
        ))}
      </div>

      <Link to="/explorar" className="btn btn-primary">Consultar o catálogo de espécies</Link>
      <div style={{ height: '0.6rem' }} />
      <Link to="/o-que-fazer" className="btn btn-outline">O que fazer ao ver uma cobra?</Link>
    </div>
  )
}
