import{defineConfig}from 'vite'
import react from '@vitejs/plugin-react'
import{VitePWA}from 'vite-plugin-pwa'
export default defineConfig({plugins:[react(),VitePWA({
  strategies:'injectManifest',
  srcDir:'src',
  filename:'sw.ts',
  injectManifest:{globPatterns:['**/*.{js,css,html,png,svg,webmanifest}']},
  registerType:'autoUpdate',
  includeAssets:['icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'],
  manifest:{name:'É uma cobra venenosa? — Serpentes da Paraíba',short_name:'Cobra PB',description:'Catálogo colaborativo de serpentes da Paraíba.',theme_color:'#E5000F',background_color:'#f9f5ee',display:'standalone',orientation:'portrait',start_url:'/',scope:'/',icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]}
})]})
