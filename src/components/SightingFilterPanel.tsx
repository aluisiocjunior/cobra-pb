import { X } from 'lucide-react'
import type { useSightingFilters } from '../lib/useSightingFilters'

type Filters = ReturnType<typeof useSightingFilters>

/* Painel de filtros de registros, usado tanto na Home quanto em Explorar
   (aba Registros) — mesmo visual e mesmo comportamento nos dois lugares. */
export default function SightingFilterPanel({ f, onClose }: { f: Filters; onClose: () => void }) {
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
        <strong style={{ fontSize: '0.9rem' }}>Filtrar registros</strong>
        <button onClick={onClose} aria-label="Fechar filtros" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
          <X size={18} />
        </button>
      </div>
      <div className="field">
        <label>Espécie</label>
        <select className="input" value={f.fSpecies} onChange={(e) => f.setFSpecies(e.target.value)}>
          <option value="">Todas</option>
          {f.speciesOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Peçonhenta ou não</label>
        <select className="input" value={f.fClass} onChange={(e) => f.setFClass(e.target.value as typeof f.fClass)}>
          <option value="">Todas</option>
          <option value="peconhenta">Peçonhenta</option>
          <option value="nao_peconhenta">Não peçonhenta</option>
          <option value="aguardando">Aguardando identificação</option>
        </select>
      </div>
      <div className="field">
        <label>Município</label>
        <select className="input" value={f.fMunicipio} onChange={(e) => f.setFMunicipio(e.target.value)}>
          <option value="">Todos</option>
          {f.municipioOptions.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Local</label>
        <select className="input" value={f.fLocalidade} onChange={(e) => f.setFLocalidade(e.target.value)}>
          <option value="">Todos</option>
          {f.localidadeOptions.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Relator</label>
        <select className="input" value={f.fRelator} onChange={(e) => f.setFRelator(e.target.value)}>
          <option value="">Todos</option>
          {f.relatorOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {f.activeFilterCount > 0 && <button className="btn btn-outline btn-sm" style={{ borderRadius: '8px' }} onClick={f.clearFilters}>Limpar filtros</button>}
    </div>
  )
}
