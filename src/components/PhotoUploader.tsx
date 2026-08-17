import { useRef } from 'react'
import { Camera, ImagePlus, X } from 'lucide-react'

export interface PendingMedia {
  file?: File
  existingId?: string
  previewUrl: string
  mediaType: 'foto' | 'video' | 'anexo'
}

interface Props {
  items: PendingMedia[]
  onChange: (items: PendingMedia[]) => void
  maxItems?: number
}

function classify(file: File): 'foto' | 'video' | 'anexo' {
  if (file.type.startsWith('image/')) return 'foto'
  if (file.type.startsWith('video/')) return 'video'
  return 'anexo'
}

export default function PhotoUploader({ items, onChange, maxItems = 8 }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  function addFiles(fileList: FileList | null) {
    if (!fileList) return
    const next = [...items]
    for (const file of Array.from(fileList)) {
      if (next.length >= maxItems) break
      next.push({ file, previewUrl: URL.createObjectURL(file), mediaType: classify(file) })
    }
    onChange(next)
  }

  function removeAt(idx: number) {
    const next = items.filter((_, i) => i !== idx)
    onChange(next)
  }

  return (
    <div>
      <div className="photo-grid">
        {items.map((it, idx) => (
          <div className="photo-tile" key={it.previewUrl}>
            {idx === 0 && <span className="primary-tag">Principal</span>}
            {it.mediaType === 'video' ? (
              <video src={it.previewUrl} muted />
            ) : it.mediaType === 'foto' ? (
              <img src={it.previewUrl} alt={`Mídia ${idx + 1}`} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.65rem', padding: '0.3rem', textAlign: 'center' }}>
                {it.file?.name ?? 'Anexo'}
              </div>
            )}
            <button type="button" className="remove-btn" onClick={() => removeAt(idx)} aria-label="Remover">
              <X size={12} />
            </button>
          </div>
        ))}
        {items.length < maxItems && (
          <>
            <div className="photo-tile add-tile" onClick={() => cameraRef.current?.click()}>
              <Camera size={20} />
              Câmera
            </div>
            <div className="photo-tile add-tile" onClick={() => galleryRef.current?.click()}>
              <ImagePlus size={20} />
              Galeria
            </div>
          </>
        )}
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,video/*,.pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
      />
      <p className="field hint">A primeira imagem da lista será usada como foto principal.</p>
    </div>
  )
}
