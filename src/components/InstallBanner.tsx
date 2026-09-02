import { useEffect, useState } from 'react'
import { Share, X, Download } from 'lucide-react'
import { isIOS, isStandalone } from '../lib/push'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'install-banner-dismissed'

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1')
  const [showIosSteps, setShowIosSteps] = useState(false)

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone() || dismissed) return null
  if (!deferredPrompt && !isIOS()) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <div className="card" style={{ margin: '0 1.1rem 1rem', position: 'relative' }}>
      <button onClick={dismiss} aria-label="Fechar" style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <X size={16} color="var(--cinza-fraco)" />
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', paddingRight: '1.2rem' }}>
        <div style={{ background: 'var(--vermelho)', color: '#fff', borderRadius: 10, padding: '0.5rem', flexShrink: 0 }}>
          <Download size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '0.2rem' }}>Instale o app</h3>
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem' }}>
            Instale na tela de início para receber notificações de novos avistamentos e abrir mais rápido.
          </p>
          {deferredPrompt && (
            <button className="btn btn-vermelho btn-sm btn-auto" style={{ borderRadius: 8 }} onClick={install}>
              Instalar agora
            </button>
          )}
          {!deferredPrompt && isIOS() && (
            <>
              <button className="btn btn-outline btn-sm btn-auto" style={{ borderRadius: 8 }} onClick={() => setShowIosSteps((v) => !v)}>
                Como instalar
              </button>
              {showIosSteps && (
                <ol style={{ margin: '0.6rem 0 0', paddingLeft: '1.2rem', fontSize: '0.82rem', display: 'grid', gap: '0.3rem' }}>
                  <li>Toque no ícone de <strong>Compartilhar</strong> <Share size={11} style={{ verticalAlign: '-1px' }} /> na barra do navegador</li>
                  <li>Escolha <strong>"Adicionar à Tela de Início"</strong></li>
                  <li>Abra o app pelo ícone que aparecer na tela</li>
                </ol>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
