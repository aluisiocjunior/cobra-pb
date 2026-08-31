import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="page">
      <span className="eyebrow">Transparência</span>
      <h1>Política de Privacidade</h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--cinza-fraco)' }}>Última atualização: agosto de 2026</p>

      <p>
        O aplicativo <strong>"É uma cobra venenosa?"</strong> é um catálogo colaborativo de avistamentos de
        serpentes na Paraíba. Esta política explica quais dados coletamos, para que usamos e quais direitos
        você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
      </p>

      <h2>1. Quais dados coletamos</h2>
      <p><strong>Ao criar uma conta:</strong> nome, e-mail, telefone, cidade e estado.</p>
      <p><strong>Ao registrar um avistamento:</strong> fotos e/ou vídeos do animal, localização geográfica
        (coordenadas de GPS), data e horário, e as observações que você escrever.</p>
      <p><strong>Automaticamente:</strong> um identificador de notificação push (se você ativar notificações),
        e registros técnicos de uso para manter o app funcionando (ex.: quando um registro foi criado ou
        moderado).</p>

      <h2>2. Para que usamos esses dados</h2>
      <p>
        Para viabilizar o funcionamento do app: permitir que você registre avistamentos, que moderadores e
        especialistas revisem e identifiquem espécies, que o mapa colaborativo seja construído a partir dos
        registros aprovados, e para avisar você quando um novo avistamento for publicado (caso tenha ativado
        notificações). Não usamos seus dados para publicidade nem os vendemos a terceiros.
      </p>

      <h2>3. O que fica público e o que fica privado</h2>
      <p><strong>Público</strong> (visível a qualquer visitante, mesmo sem login), após aprovação por um
        moderador: espécie, município, data, ambiente e a(s) foto(s) do avistamento.</p>
      <p><strong>Visível apenas a usuários cadastrados e logados:</strong> o nome de quem registrou o
        avistamento.</p>
      <p><strong>Nunca público:</strong> seu e-mail, sua senha e seu telefone — o telefone só é mostrado a
        outros usuários cadastrados se você ativamente escolher permitir isso no seu perfil.</p>
      <p><strong>Localização protegida:</strong> por segurança (sua e do animal), a localização exata do
        avistamento nunca é exibida publicamente. O mapa mostra uma posição aproximada, deslocada
        aleatoriamente entre 300 e 700 metros do ponto real. As coordenadas exatas ficam restritas à equipe de
        moderação.</p>

      <h2>4. Com quem compartilhamos dados</h2>
      <p>
        Usamos os seguintes prestadores de serviço para operar o app, que processam dados em nosso nome sob
        obrigação de confidencialidade:
      </p>
      <ul style={{ paddingLeft: '1.2rem', marginBottom: '1em' }}>
        <li><strong>Supabase</strong> — banco de dados, autenticação e armazenamento de fotos/vídeos.</li>
        <li><strong>Vercel</strong> — hospedagem do aplicativo.</li>
      </ul>
      <p>Não compartilhamos seus dados pessoais com terceiros para fins comerciais ou publicitários.</p>

      <h2>5. Por quanto tempo guardamos seus dados</h2>
      <p>
        Enquanto sua conta estiver ativa. Se você excluir sua conta, seus dados pessoais (nome, e-mail,
        telefone) são removidos; registros de avistamentos já aprovados e publicados podem ser mantidos de
        forma anonimizada, para preservar o valor científico e histórico do mapa colaborativo.
      </p>

      <h2>6. Seus direitos (LGPD)</h2>
      <p>Você pode, a qualquer momento:</p>
      <ul style={{ paddingLeft: '1.2rem', marginBottom: '1em' }}>
        <li>Acessar e corrigir seus dados — diretamente em <Link to="/perfil">Perfil</Link>.</li>
        <li>Editar ou excluir seus próprios registros de avistamento — em <Link to="/perfil?tab=meus-registros">Meus registros</Link>.</li>
        <li>Ativar ou desativar notificações e a exibição pública do seu telefone — em Perfil.</li>
        <li>Solicitar a exclusão completa da sua conta e dos seus dados pessoais.</li>
        <li>Solicitar uma cópia dos dados que temos sobre você.</li>
      </ul>
      <p>
        Para solicitar exclusão de conta ou esclarecer dúvidas sobre seus dados, entre em contato pelo e-mail{' '}
        <a href="mailto:privacidade@cobrapb.app">privacidade@cobrapb.app</a>.
      </p>

      <h2>7. Segurança</h2>
      <p>
        Os dados são protegidos por controle de acesso em nível de banco de dados (Row Level Security), de
        forma que cada pessoa só acessa o que tem permissão para ver. Toda comunicação entre o app e nossos
        servidores é criptografada (HTTPS).
      </p>

      <h2>8. Menores de idade</h2>
      <p>
        O aplicativo não é direcionado a crianças. Se você tem menos de 18 anos, use o app apenas com a
        orientação de um responsável.
      </p>

      <h2>9. Mudanças nesta política</h2>
      <p>
        Podemos atualizar esta política conforme o app evolui. Mudanças relevantes serão comunicadas dentro do
        próprio aplicativo.
      </p>

      <div className="banner banner-info" style={{ marginTop: '1.5rem' }}>
        Dúvidas? Fale com a gente em <a href="mailto:privacidade@cobrapb.app">privacidade@cobrapb.app</a>.
      </div>
    </div>
  )
}
