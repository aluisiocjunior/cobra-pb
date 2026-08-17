interface Props {
  venomous: boolean | null | undefined
  confirmed: boolean
  size?: 'sm' | 'md'
}

/** Selo/etiqueta de espécime: PEÇONHENTA / NÃO PEÇONHENTA / AGUARDANDO IDENTIFICAÇÃO */
export default function SpeciesStamp({ venomous, confirmed, size = 'md' }: Props) {
  if (!confirmed || venomous === null || venomous === undefined) {
    return <span className="selo selo-aguardando" style={fontSize(size)}>Aguardando identificação</span>
  }
  return venomous ? (
    <span className="selo selo-peconhenta" style={fontSize(size)}>Peçonhenta</span>
  ) : (
    <span className="selo selo-nao-peconhenta" style={fontSize(size)}>Não peçonhenta</span>
  )
}

function fontSize(size: 'sm' | 'md') {
  return size === 'sm' ? { fontSize: '0.58rem' } : undefined
}
