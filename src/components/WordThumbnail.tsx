import { useEffect, useRef, useState } from 'react';
import type { Word } from '../types';
import { localPhoto } from '../data/photos';
import { photoLicense, visualQuery } from '../lib/visual';
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
  const sense = word.senses.find(s => s.id === word.matchedSenseId) ?? word.senses[0];
  const { result } = useImages(word, sense, 'thumbnail', visible && !!visualQuery(sense));
  const fallback = word.photo && sense.id === word.senses[0].id ? localPhoto(word.photo, sense.english) : undefined;
  const candidate = result?.images[0] ?? fallback;
  const photo = candidate?.thumbnailUrl === failedUrl ? fallback : candidate;
  return <span ref={target} className="word-thumbnail">{photo ? <Photo key={photo.thumbnailUrl} photo={photo} onUnavailable={() => setFailedUrl(photo.thumbnailUrl)}/> : <span className="word-art" lang="zh-Hans">{word.simplified}</span>}{photo?.provider && <span className="thumbnail-credit" title={photo.attribution}>{photo.photographer ? `${photo.photographer} · ` : ''}{photo.source}{photo.license ? ` · ${photoLicense(photo)}` : ''}</span>}</span>;
}
