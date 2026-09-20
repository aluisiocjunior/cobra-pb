/* Ilustrações simples em SVG, no tema do app (traço limpo, sem conteúdo gráfico/
   chocante), usadas nas seções de Sintomas e Primeiros Socorros. */

type P = { size?: number }
const wrap = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{children}</svg>
)

function Prohibited({ children }: { children: React.ReactNode }) {
  return (<>
    {children}
    <circle cx="32" cy="32" r="27" stroke="var(--vermelho)" strokeWidth="3" fill="none" />
    <line x1="12" y1="52" x2="52" y2="12" stroke="var(--vermelho)" strokeWidth="3" strokeLinecap="round" />
  </>)
}

/* ── Sintomas ── */
export function IconDorLocal({ size = 40 }: P) { return wrap(size, <>
  <circle cx="32" cy="32" r="4" fill="var(--vermelho)" />
  <circle cx="25" cy="29" r="2" fill="var(--vermelho)" />
  <circle cx="39" cy="29" r="2" fill="var(--vermelho)" />
  <line x1="32" y1="8" x2="32" y2="17" stroke="var(--vermelho)" strokeWidth="3" strokeLinecap="round" />
  <line x1="12" y1="32" x2="21" y2="32" stroke="var(--vermelho)" strokeWidth="3" strokeLinecap="round" />
  <line x1="52" y1="32" x2="43" y2="32" stroke="var(--vermelho)" strokeWidth="3" strokeLinecap="round" />
  <line x1="17" y1="17" x2="23" y2="23" stroke="var(--vermelho)" strokeWidth="3" strokeLinecap="round" />
  <line x1="47" y1="17" x2="41" y2="23" stroke="var(--vermelho)" strokeWidth="3" strokeLinecap="round" />
</>) }
export function IconInchaco({ size = 40 }: P) { return wrap(size, <>
  <ellipse cx="32" cy="37" rx="11" ry="7" stroke="var(--cinza-medio)" strokeWidth="2" strokeDasharray="3 3" fill="none" />
  <ellipse cx="32" cy="34" rx="18" ry="13" stroke="var(--vermelho)" strokeWidth="2.5" fill="var(--vermelho-bg)" />
</>) }
export function IconSangramento({ size = 40 }: P) { return wrap(size, <>
  <path d="M32 11 C32 11 19 30 19 40 a13 13 0 0 0 26 0 C45 30 32 11 32 11 Z" fill="var(--vermelho)" />
</>) }
export function IconVisaoTurva({ size = 40 }: P) { return wrap(size, <>
  <path d="M9 32 C18 19 46 19 55 32 C46 45 18 45 9 32 Z" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" />
  <circle cx="32" cy="32" r="6" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" />
  <path d="M13 21 q6 -5 12 0" stroke="var(--vermelho)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <path d="M39 21 q6 -5 12 0" stroke="var(--vermelho)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <path d="M13 43 q6 5 12 0" stroke="var(--vermelho)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <path d="M39 43 q6 5 12 0" stroke="var(--vermelho)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
</>) }
export function IconFaltaAr({ size = 40 }: P) { return wrap(size, <>
  <path d="M32 12 v16" stroke="var(--cinza-medio)" strokeWidth="3" strokeLinecap="round" />
  <path d="M32 27 C23 27 17 34 17 43 C17 49 21 51 25 49 C28 47 28 39 28 33" stroke="var(--vermelho)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M32 27 C41 27 47 34 47 43 C47 49 43 51 39 49 C36 47 36 39 36 33" stroke="var(--vermelho)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>) }
export function IconTontura({ size = 40 }: P) { return wrap(size, <>
  <circle cx="32" cy="27" r="12" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" />
  <path d="M40 21 a6.5 6.5 0 1 1 -8.5 -4.2" stroke="var(--vermelho)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  <path d="M18 48 q14 -9 28 0" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
</>) }

/* ── Faça ── */
export function IconAfasteSe({ size = 40 }: P) { return wrap(size, <>
  <path d="M13 36 q5 -10 0 -17 q-4 -6 2 -10" stroke="var(--vermelho)" strokeWidth="3" fill="none" strokeLinecap="round" />
  <circle cx="15" cy="8" r="2.3" fill="var(--vermelho)" />
  <line x1="27" y1="32" x2="49" y2="32" stroke="var(--cinza-medio)" strokeWidth="3" strokeLinecap="round" />
  <path d="M41 24 l8 8 l-8 8" stroke="var(--cinza-medio)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
</>) }
export function IconLaveMaos({ size = 40 }: P) { return wrap(size, <>
  <path d="M32 13 C32 13 21 30 21 39 a11 11 0 0 0 22 0 C43 30 32 13 32 13 Z" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" />
  <circle cx="46" cy="19" r="5.5" fill="var(--vermelho-bg)" stroke="var(--vermelho)" strokeWidth="2" />
  <path d="M43.5 17 l1.3 1.3 M48.5 16 l-1 3.2" stroke="var(--vermelho)" strokeWidth="1.6" strokeLinecap="round" />
</>) }
export function IconAtendimentoMedico({ size = 40 }: P) { return wrap(size, <>
  <rect x="13" y="13" width="38" height="38" rx="11" stroke="var(--vermelho)" strokeWidth="2.5" fill="var(--vermelho-bg)" />
  <path d="M32 21 v22 M21 32 h22" stroke="var(--vermelho)" strokeWidth="4.5" strokeLinecap="round" />
</>) }
export function IconFotoDistancia({ size = 40 }: P) { return wrap(size, <>
  <rect x="12" y="21" width="26" height="19" rx="3" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" />
  <circle cx="25" cy="31" r="5.5" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" />
  <rect x="19" y="16" width="9" height="6" rx="1.5" stroke="var(--cinza-medio)" strokeWidth="2.5" fill="none" />
  <path d="M43 31 h7" stroke="var(--vermelho)" strokeWidth="2" strokeDasharray="2 3.4" strokeLinecap="round" />
  <circle cx="54" cy="31" r="3" fill="var(--vermelho)" />
</>) }

/* ── Não faça (mesma base + faixa de proibido) ── */
export function IconNaoTorniquete({ size = 40 }: P) { return wrap(size, <Prohibited>
  <rect x="26" y="9" width="12" height="46" rx="6" stroke="var(--cinza-medio)" strokeWidth="2.3" fill="none" />
  <path d="M19 23 q13 6 26 0 M19 32 q13 6 26 0 M19 41 q13 6 26 0" stroke="var(--cinza-medio)" strokeWidth="2.3" fill="none" strokeLinecap="round" />
</Prohibited>) }
export function IconNaoCorte({ size = 40 }: P) { return wrap(size, <Prohibited>
  <path d="M14 46 L37 18 L42 22 L19 50 Z" stroke="var(--cinza-medio)" strokeWidth="2" fill="var(--fundo-card)" />
  <rect x="36" y="10" width="9" height="14" rx="1.5" transform="rotate(40 40.5 17)" fill="var(--cinza-medio)" />
</Prohibited>) }
export function IconNaoSugar({ size = 40 }: P) { return wrap(size, <Prohibited>
  <ellipse cx="32" cy="32" rx="13" ry="7.5" stroke="var(--cinza-medio)" strokeWidth="2.3" fill="none" />
  <path d="M19 32 h26" stroke="var(--cinza-medio)" strokeWidth="2.3" strokeLinecap="round" />
</Prohibited>) }
export function IconNaoRemedioCaseiro({ size = 40 }: P) { return wrap(size, <Prohibited>
  <path d="M32 46 C21 46 15 35 17 22 C30 22 39 29 39 40 C39 43 35 46 32 46 Z" stroke="var(--cinza-medio)" strokeWidth="2.3" fill="var(--fundo-card)" />
  <path d="M21 24 C27 31 30 37 32 44" stroke="var(--cinza-medio)" strokeWidth="1.4" fill="none" />
</Prohibited>) }
