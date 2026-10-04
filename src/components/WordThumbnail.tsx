import { useEffect, useRef, useState } from 'react';
import type { Word } from '../types';
import { byId } from '../data/learning';
import { localPhoto } from '../data/photos';
import { visualQuery } from '../lib/visual';
import { useImages } from '../lib/useImages';
import { Photo } from './Photo';
export function WordThumbnail({ word }: { word: Word }) {
  const target = useRef<HTMLSpanElement>(null); const [visible, setVisible] = useState(false);
  const [failedUrl, setFailedUrl] = useState('');
  useEffect(() => {
    const element = target.current;
    if (!element || typeof IntersectionObserver === 'undefined') return; // Bundled photo on older browsers.
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '100px' });
    observer.observe(element); return () => observer.disconnect();
  }, [word.id]);
  const { result } = useImages(word, word.senses[0], 'thumbnail', visible && byId.has(word.id) && !!visualQuery(word.senses[0]));
  const fallback = word.photo ? localPhoto(word.photo, word.senses[0].english) : undefined;
  const candidate = result?.images[0] ?? fallback;
  const photo = candidate?.thumbnailUrl === failedUrl ? fallback : candidate;
  return <span ref={target} className="word-thumbnail">{photo ? <Photo key={photo.thumbnailUrl} photo={photo} onUnavailable={() => setFailedUrl(photo.thumbnailUrl)}/> : <span className="word-art" lang="zh-Hans">{word.simplified}</span>}{photo?.provider && <span className="thumbnail-credit">{photo.photographer ? `${photo.photographer} · ` : ''}{photo.source}</span>}</span>;
}
