import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function isIOS(): boolean {
  const ua = navigator.userAgent
  const isAppleDevice = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ reports as "MacIntel" in the user agent, so detect via multi-touch as a fallback.
  const isIpadOS13Plus = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isAppleDevice || isIpadOS13Plus
}

export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

export type PushStatus = 'unsupported' | 'ios-needs-install' | 'denied' | 'subscribed' | 'not-subscribed'

export async function getPushStatus(): Promise<PushStatus> {
  const hasPushApi = 'serviceWorker' in navigator && 'PushManager' in window
  if (!hasPushApi) {
    // No iOS, o Push API só existe quando o app foi instalado (Adicionar à Tela de Início)
    // e aberto a partir do ícone — abrir pelo Safari/Chrome normalmente nunca terá suporte.
    if (isIOS() && !isStandalone()) return 'ios-needs-install'
    return 'unsupported'
  }
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  return sub ? 'subscribed' : 'not-subscribed'
}

export async function subscribeToPush(userId: string): Promise<{ ok: boolean; error?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    if (isIOS() && !isStandalone()) {
      return { ok: false, error: 'No iPhone/iPad, primeiro adicione o app à Tela de Início (toque em Compartilhar, depois "Adicionar à Tela de Início") e abra-o a partir do ícone antes de ativar as notificações.' }
    }
    return { ok: false, error: 'Este navegador não suporta notificações push.' }
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { ok: false, error: 'Permissão de notificações negada.' }
  }
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    })
  }
  const { error } = await supabase.from('push_tokens').upsert(
    { user_id: userId, token: JSON.stringify(sub) },
    { onConflict: 'user_id,token', ignoreDuplicates: true }
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    await supabase.from('push_tokens').delete().eq('token', JSON.stringify(sub))
    await sub.unsubscribe()
  }
}
