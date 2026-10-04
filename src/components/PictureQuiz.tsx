import { useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { words } from '../data/learning';
import { localPhoto } from '../data/photos';
import type { Word } from '../types';
import { Photo } from './Photo';
export function PictureQuiz({ word }: { word: Word }) {
  const [answer, setAnswer] = useState<string>(); const [round, setRound] = useState(0);
  const photo = word.photo ? localPhoto(word.photo, 'Identify the object in this picture') : undefined;
  if (!photo) return null;
  const distractors = words.filter(w => w.photo && w.id !== word.id).slice(round % 3, round % 3 + 3);
  const choices = [...distractors]; choices.splice((word.simplified.length + round) % 4, 0, word);
  return <section className="quiz-card"><div className="quiz-copy"><span className="eyebrow">A LITTLE PRACTICE</span><h2>看图选词</h2><p>Which word matches this picture?</p><span className="quiz-hint">Look. Think. Give it a try.</span></div><Photo photo={photo}/><div className="quiz-options">{choices.map((choice, i) => <button key={choice.id} className={answer === choice.id ? (choice.id === word.id ? 'correct' : 'incorrect') : ''} onClick={() => setAnswer(choice.id)}><span>{String.fromCharCode(65 + i)}</span><strong lang="zh-Hans">{choice.simplified}</strong>{answer === choice.id && choice.id === word.id ? <Check size={18}/> : <ArrowRight size={17}/>}</button>)}<div className="quiz-feedback" aria-live="polite">{answer && (answer === word.id ? '答对了！ That’s right. Well done!' : 'Look once more. You can try again!')}{answer === word.id && <button className="text-button" onClick={() => { setAnswer(undefined); setRound(r => r + 1); }}><RotateCcw size={14}/> Try again</button>}</div></div></section>;
}
