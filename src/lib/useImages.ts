import { useEffect, useState } from 'react';
import type { ImageMode, ImageResult, Sense, Word } from '../types';
import { imageCacheKey } from './visual';
import { cachedImages, fetchImages } from './images';
// Shared lifecycle for cards and galleries: old requests cannot update a new meaning.
export function useImages(word: Word, sense: Sense, mode: ImageMode, enabled = true, attempt = 0) {
  const key = `${imageCacheKey(word, sense)}|${mode}`;
  const [state, setState] = useState<{ key: string; result?: ImageResult; error: string; loading: boolean }>(() => {
    const result = enabled ? cachedImages(word, sense, mode) : undefined;
    return { key, result, error: '', loading: enabled && !result };
  });
  useEffect(() => {
    if (!enabled) return;
    let obsolete = false; let timer: ReturnType<typeof setTimeout>; let sequence = 0;
    const refresh = (retry = false) => {
      if (obsolete) return;
      clearTimeout(timer); const request = ++sequence;
      const show = (result: ImageResult, loading: boolean) => {
        if (obsolete || request !== sequence) return;
        setState(previous => {
          if (previous.key === key && previous.result === result && previous.loading === loading && !previous.error) return previous;
          // Preserve the positions of surviving pictures. Membership is always
          // the latest jointly ranked selection; late better matches still win.
          const order = new Map(result.images.map(photo => [photo.id, photo]));
          const retained = previous.key === key ? (previous.result?.images ?? []).filter(photo => order.has(photo.id)).map(photo => order.get(photo.id)!) : [];
          const ids = new Set(retained.map(photo => photo.id));
          return { key, result: { ...result, images: [...retained, ...result.images.filter(photo => !ids.has(photo.id))] }, loading, error: '' };
        });
        clearTimeout(timer);
        if (result.status === 'live' && result.expiresAt) timer = setTimeout(() => refresh(), Math.max(1, result.expiresAt - Date.now()));
      };
      const available = retry ? undefined : cachedImages(word, sense, mode);
      if (available) { show(available, false); return; }
      setState(previous => ({ key, result: previous.key === key && (previous.result?.expiresAt ?? 0) > Date.now() ? previous.result : undefined, loading: true, error: '' }));
      fetchImages(word, sense, retry, mode, result => show(result, true)).then(result => {
        if (obsolete || request !== sequence) return;
        show(result, false);
      }).catch(() => { if (!obsolete && request === sequence) setState(previous => ({ ...previous, key, loading: false, error: '图片暂时无法载入。 Pictures are temporarily unavailable.' })); });
    };
    refresh(attempt > 0);
    const resume = () => {
      if (document.visibilityState !== 'hidden') { clearTimeout(timer); refresh(); }
    };
    window.addEventListener('online', resume); window.addEventListener('focus', resume);
    return () => { obsolete = true; clearTimeout(timer); window.removeEventListener('online', resume); window.removeEventListener('focus', resume); };
  }, [word, sense, key, mode, enabled, attempt]);
  if (state.key !== key || (state.result?.expiresAt && state.result.expiresAt <= Date.now())) return { result: undefined, error: '', loading: enabled };
  return state;
}
