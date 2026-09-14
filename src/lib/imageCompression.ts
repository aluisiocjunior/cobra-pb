/**
 * Comprimir fotos no navegador antes do upload.
 *
 * Câmeras de celular modernas geram fotos de 10-20MB. Enviar isso cru é um
 * problema real para o público deste app (área rural, sinal de dados fraco no
 * Sertão/Caatinga) — pode travar o upload ou consumir uma franquia de dados
 * enorme para uma única foto. Reduzimos para no máximo ~1600px no lado maior
 * e recomprimimos como JPEG de qualidade 80%, o que costuma cortar o tamanho
 * do arquivo em 80-95% com perda visual mínima em uma tela de celular.
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.8): Promise<File> {
  // Só compacta imagens de fato; vídeos e outros anexos passam direto.
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file // formato não suportado pelo navegador — envia original

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return file

  // Se a compressão não ajudou (ex.: imagem já pequena/compacta), mantém a original.
  if (blob.size >= file.size) return file

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
}
