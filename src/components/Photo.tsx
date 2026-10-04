import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { Photo as PhotoType } from '../types';
export function Photo({ photo, onUnavailable, className = '', eager = false, display = false }: { photo: PhotoType; onUnavailable?: () => void; className?: string; eager?: boolean; display?: boolean }) {
  const [loaded, setLoaded] = useState(false); const [broken, setBroken] = useState(false);
  return <span className={`photo ${className} ${loaded ? 'loaded' : 'loading'} ${broken ? 'broken' : ''}`}>{!broken ? <img src={display ? photo.displayUrl ?? photo.thumbnailUrl : photo.thumbnailUrl} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)} onError={() => { setBroken(true); setLoaded(true); onUnavailable?.(); }}/> : <span className="photo-fallback"><ImageOff size={28}/><span>{photo.alt}</span><small>Picture unavailable</small></span>}</span>;
}
