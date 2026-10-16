import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { Photo as PhotoType } from '../types';
export function Photo({ photo, onUnavailable, className = '', eager = false, display = false }: { photo: PhotoType; onUnavailable?: () => void; className?: string; eager?: boolean; display?: boolean }) {
  const [loaded, setLoaded] = useState(false); const [broken, setBroken] = useState(false);
  // Use the smaller supplied variant on low-density phones. Do not invent
  // width descriptors: Pixabay's _340 variant is 340px tall, not 340px wide.
  const responsive = display && photo.provider === 'pixabay' && photo.displayUrl !== photo.thumbnailUrl;
  return <span className={`photo ${className} ${loaded ? 'loaded' : 'loading'} ${broken ? 'broken' : ''}`}>{!broken ? <picture>{responsive && <source media="(max-width: 640px) and (max-resolution: 1.5dppx)" srcSet={photo.thumbnailUrl}/>}<img src={display ? photo.displayUrl ?? photo.thumbnailUrl : photo.thumbnailUrl} alt={photo.alt} width={photo.width} height={photo.height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onLoad={() => setLoaded(true)} onError={() => { setBroken(true); setLoaded(true); onUnavailable?.(); }}/></picture> : <span className="photo-fallback"><ImageOff size={28}/><span>{photo.alt}</span><small>Picture unavailable</small></span>}</span>;
}
