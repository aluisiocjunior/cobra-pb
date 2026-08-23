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

export type PushStatus = 'unsupported' | 'denied' | 'subscribed' | 'not-subscribed'

export async function getPushStatus(): Promise<PushStatus> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  return sub ? 'subscribed' : 'not-subscribed'
}

export async function subscribeToPush(userId: string): Promise<{ ok: boolean; error?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
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
  const { error } = await supabase.from('push_tokens').insert({ user_id: userId, token: JSON.stringify(sub) })
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
