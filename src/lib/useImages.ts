import { useEffect, useState } from 'react';
import type { ImageMode, ImageResult, Sense, Word } from '../types';
import { imageCacheKey } from './visual';
import { fetchImages } from './images';
// Shared lifecycle for cards and galleries: old requests cannot update a new meaning.
export function useImages(word: Word, sense: Sense, mode: ImageMode, enabled = true, attempt = 0) {
  const key = `${imageCacheKey(word, sense)}|${mode}`;
  const [state, setState] = useState<{ key: string; result?: ImageResult; error: string; loading: boolean }>({ key, error: '', loading: enabled });
  useEffect(() => {
    if (!enabled) return;
    let obsolete = false; let timer: ReturnType<typeof setTimeout>; let sequence = 0;
    const refresh = (retry = false) => {
      if (obsolete) return;
      clearTimeout(timer); const request = ++sequence;
      setState({ key, loading: true, error: '' });
      fetchImages(word, sense, retry, mode).then(result => {
        if (obsolete || request !== sequence) return;
        setState({ key, result, loading: false, error: '' });
        if (result.status === 'live' && result.expiresAt) timer = setTimeout(() => refresh(), Math.max(1, result.expiresAt - Date.now()));
      }).catch(() => { if (!obsolete && request === sequence) setState({ key, loading: false, error: '图片暂时无法载入。 Pictures are temporarily unavailable.' }); });
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
