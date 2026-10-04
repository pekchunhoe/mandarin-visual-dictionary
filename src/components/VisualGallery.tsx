import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, RefreshCw, X } from 'lucide-react';
import type { Photo as PhotoType, Sense, Word } from '../types';
import { useImages } from '../lib/useImages';
import { offlineGallery } from '../data/photos';
import { Photo } from './Photo';
export function VisualGallery({ word, sense }: { word: Word; sense: Sense }) {
  const [attempt, setAttempt] = useState(0); const [preview, setPreview] = useState<number | null>(null);
  const { result, loading, error } = useImages(word, sense, 'gallery', true, attempt);
  useEffect(() => {
    setPreview(null);
  }, [word, sense, attempt]);
  const fallback = word.photo && sense.id === word.senses[0].id ? offlineGallery(word.photo, `${word.simplified} · ${sense.english}`) : [];
  const photos = result?.images.length ? result.images : fallback;
  return <section className="gallery-section" aria-labelledby="gallery-title"><div className="section-heading"><div><span className="eyebrow">A WORD IN PICTURES</span><h2 id="gallery-title">看图认识 <span lang="zh-Hans">{word.simplified}</span></h2></div><span className="subtle">{loading ? 'Finding pictures…' : `${photos.length} ${photos.length === 1 ? 'picture' : 'pictures'}`} · Tap to explore</span></div>
    {loading && !fallback.length ? <div className="gallery-grid" aria-label="Loading pictures" role="status">{Array.from({ length: 8 }, (_, i) => <div className="skeleton gallery-skeleton" key={i}/>)}</div> : <div className={`gallery-grid ${photos.length === 1 ? 'single-photo' : ''}`}>{photos.map((photo, i) => <figure key={photo.id}><button aria-label={`Enlarge picture: ${photo.alt}`} onClick={() => setPreview(i)}><Photo key={photo.thumbnailUrl} photo={photo} eager={i < 2} display={i === 0}/><span className="expand-icon"><Expand size={18}/></span></button><Attribution photo={photo}/></figure>)}{photos.length === 1 && <div className="visual-word-note"><span className="eyebrow">LOOK CLOSELY. SAY IT ALOUD.</span><span lang="zh-Hans">{word.simplified}</span><p>{word.pinyin}</p><strong>{sense.english.split(';')[0]}</strong><small>{sense.malay}</small><div className="small-rule"/><p className="note-prompt">What do you notice in this picture?<br/>Can you find it around you?</p></div>}</div>}
    {(error || result?.message) && <div className="image-notice" role="status"><span>{error || result?.message}</span><button onClick={() => setAttempt(a => a + 1)}><RefreshCw size={15}/> Retry pictures</button></div>}
    {!loading && photos.length === 0 && <div className="empty-panel">图片暂时无法载入。<p>You can still explore the meaning and pronunciation below.</p></div>}
    {preview !== null && photos[preview] && <ImagePreview photos={photos} index={preview} onChange={setPreview} onClose={() => setPreview(null)}/>}
    {photos.length > 2 && <div className="context-section"><div><span className="eyebrow">LEARN WITH PICTURES</span><h3>看图学词</h3><p>Find the same idea in different real-world scenes.</p></div><div className="context-cards">{photos.slice(0, 3).map((photo, i) => <button key={photo.id} onClick={() => setPreview(i)}><Photo key={photo.thumbnailUrl} photo={photo}/><span>{photo.alt || sense.english}</span></button>)}</div></div>}
  </section>;
}
export function Attribution({ photo }: { photo: PhotoType }) { return <figcaption>{photo.photographer ? <>Photo by <a href={photo.photographerUrl} target="_blank" rel="noreferrer">{photo.photographer}</a> · </> : 'Photo · '}<a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.source}</a></figcaption>; }
function ImagePreview({ photos, index, onChange, onClose }: { photos: PhotoType[]; index: number; onChange: (index: number) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement; const modal = dialog.current; modal?.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { modal?.close(); document.body.style.overflow = overflow; previous?.focus(); }; }, []);
  const photo = photos[index];
  return <dialog ref={dialog} className="image-preview" aria-label="Picture preview" onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }} onKeyDown={e => { if (e.key === 'ArrowRight') onChange((index + 1) % photos.length); if (e.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length); }}><div className="preview-content"><button className="preview-close" autoFocus onClick={onClose} aria-label="Close picture preview"><X/></button><img src={photo.largeUrl} alt={photo.alt}/><div className="preview-footer"><button aria-label="Previous picture" onClick={() => onChange((index - 1 + photos.length) % photos.length)}><ChevronLeft/></button><div><p>{photo.alt}</p><Attribution photo={photo}/><small>{index + 1} / {photos.length}</small></div><button aria-label="Next picture" onClick={() => onChange((index + 1) % photos.length)}><ChevronRight/></button></div></div></dialog>;
}
