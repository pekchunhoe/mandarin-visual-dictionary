import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Sense, Word } from '../types';
import type { TeacherAction } from '../lib/ai-teacher-schema';
import { buildTeacherCopyPrompt } from '../lib/teacher-copy-prompt';
import { copyTeacherText } from '../lib/teacher-clipboard';

export function CopyTeacherPromptButton({ word, sense, action }: { word: Word; sense: Sense; action: TeacherAction }) {
  const [state, setState] = useState<'ready' | 'copying' | 'copied' | 'failed'>('ready');
  const [manualText, setManualText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = useRef(true), busy = useRef(false), manual = useRef<HTMLTextAreaElement>(null);
  const name = action === 'sentences' ? 'sentence' : 'synonym and antonym';
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearTimeout(timer.current); };
  }, []);
  useEffect(() => { if (state === 'failed' && manualText) { manual.current?.focus(); manual.current?.select(); } }, [state, manualText]);

  async function copy() {
    if (busy.current) return;
    busy.current = true; clearTimeout(timer.current); setState('copying'); setManualText('');
    let text = '';
    try {
      text = buildTeacherCopyPrompt(word, sense, action);
      await copyTeacherText(text);
      if (!mounted.current) return;
      setState('copied'); timer.current = setTimeout(() => setState('ready'), 3000);
    } catch {
      if (mounted.current) { setManualText(text); setState('failed'); }
    } finally { busy.current = false; }
  }

  return <div className="teacher-prompt-control"><div className="teacher-prompt-line"><button type="button" className="teacher-prompt-button" aria-label={`Copy ${name} prompt for ${word.simplified}`} title={`Copy ${name} instructions to paste into your preferred AI chat.`} disabled={state === 'copying'} aria-busy={state === 'copying'} onClick={() => { void copy(); }}>{state === 'copied' ? <Check size={14}/> : <Copy size={14}/>}Copy Prompt</button>{state === 'copied' && <span className="teacher-prompt-feedback" role="status">Prompt copied!</span>}</div>{state === 'failed' && <div className="teacher-prompt-manual"><p role="alert">{manualText ? 'Could not copy automatically. Select the prompt below and copy it manually.' : 'Choose a dictionary entry and meaning, then try again.'}</p>{manualText && <textarea ref={manual} readOnly rows={3} value={manualText} aria-label={`${name} prompt for manual copying`}/>}</div>}</div>;
}
