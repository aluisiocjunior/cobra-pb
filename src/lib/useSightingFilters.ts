import { useMemo, useState } from 'react'
import type { SightingPublic } from './types'

export type ClassFilter = '' | 'peconhenta' | 'nao_peconhenta' | 'aguardando'

/* Filtros de registros reaproveitados entre Home e Explorar (aba Registros).
   As opções de cada filtro só trazem valores que de fato existem em `list`,
   nunca o catálogo inteiro — evita opção sem resultado nenhum. */
export function useSightingFilters(list: SightingPublic[]) {
  const [fSpecies, setFSpecies] = useState('')
  const [fClass, setFClass] = useState<ClassFilter>('')
  const [fMunicipio, setFMunicipio] = useState('')
  const [fLocalidade, setFLocalidade] = useState('')
  const [fRelator, setFRelator] = useState('')

  const speciesOptions = useMemo(() => {
    const map = new Map<string, string>()
    list.forEach((r) => {
      const id = r.confirmed_species_id ?? r.suggested_species_id
      if (id && r.species_display_name) map.set(id, r.species_display_name)
    })
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [list])
  const municipioOptions = useMemo(() => [...new Set(list.map((r) => r.municipio).filter((v): v is string => !!v))].sort(), [list])
  const localidadeOptions = useMemo(() => [...new Set(list.map((r) => r.localidade).filter((v): v is string => !!v))].sort(), [list])
  const relatorOptions = useMemo(() => [...new Set(list.map((r) => r.author_name).filter((v): v is string => !!v))].sort(), [list])

  const filtered = useMemo(() => list.filter((r) => {
    if (fSpecies && r.confirmed_species_id !== fSpecies && r.suggested_species_id !== fSpecies) return false
    if (fClass === 'peconhenta' && !(r.identification_confirmed && r.venomous_display === true)) return false
    if (fClass === 'nao_peconhenta' && !(r.identification_confirmed && r.venomous_display === false)) return false
    if (fClass === 'aguardando' && r.identification_confirmed) return false
    if (fMunicipio && r.municipio !== fMunicipio) return false
    if (fLocalidade && r.localidade !== fLocalidade) return false
    if (fRelator && r.author_name !== fRelator) return false
    return true
  }), [list, fSpecies, fClass, fMunicipio, fLocalidade, fRelator])

  const activeFilterCount = [fSpecies, fClass, fMunicipio, fLocalidade, fRelator].filter(Boolean).length
  function clearFilters() { setFSpecies(''); setFClass(''); setFMunicipio(''); setFLocalidade(''); setFRelator('') }

  return {
    filtered, activeFilterCount, clearFilters,
    fSpecies, setFSpecies, fClass, setFClass, fMunicipio, setFMunicipio, fLocalidade, setFLocalidade, fRelator, setFRelator,
    speciesOptions, municipioOptions, localidadeOptions, relatorOptions,
  }
}
