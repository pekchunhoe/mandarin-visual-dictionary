import { useEffect, useRef, useState } from 'react';
import { Square, Volume2 } from 'lucide-react';
import { speakMandarin } from '../lib/speech';
let currentStop: (() => void) | undefined;
export function PronunciationButton({ text, compact = false, sentence = false }: { text: string; compact?: boolean; sentence?: boolean }) {
  const [playing, setPlaying] = useState(false); const [error, setError] = useState('');
  const ownedStop = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => { if (currentStop === ownedStop.current) { currentStop?.(); currentStop = undefined; } }, []);
  function play() {
    const wasPlaying = playing; currentStop?.(); currentStop = undefined;
    if (wasPlaying) return;
    try { const cancel = speakMandarin(text, () => { setPlaying(false); if (currentStop === ownedStop.current) currentStop = undefined; }); setPlaying(true); setError(''); ownedStop.current = () => { cancel(); setPlaying(false); }; currentStop = ownedStop.current; }
    catch (e) { setError((e as Error).message); }
  }
  return <span className="speech-wrap"><button type="button" className={`speech-button ${compact ? 'compact' : ''}`} aria-label={playing ? 'Stop pronunciation' : `Listen to ${text}`} title={playing ? 'Stop' : 'Listen in Mandarin'} onClick={e => { e.stopPropagation(); play(); }}>{playing ? <Square size={17}/> : <Volume2 size={19}/>} {!compact && <span>{playing ? 'Stop' : sentence ? '听句子 · Listen' : '听发音 · Listen'}</span>}</button>{error && <span className="speech-error" role="status">{error}</span>}</span>;
}
