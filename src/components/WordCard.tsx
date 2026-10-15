import { ArrowUpRight, Bookmark } from 'lucide-react';
import type { Word } from '../types';
import { WordThumbnail } from './WordThumbnail';
import { PronunciationButton } from './PronunciationButton';
export function WordCard({ word, onOpen, saved, onSave }: { word: Word; onOpen: (word: Word) => void; saved?: boolean; onSave?: (id: string) => void }) {
  const sense = word.senses.find(s => s.id === word.matchedSenseId) ?? word.senses[0];
  return <article className="word-card"><button className="word-card-main" onClick={() => onOpen(word)}><WordThumbnail word={word}/><div className="word-card-info"><div><h3 lang="zh-Hans">{word.simplified}</h3><span className="pinyin">{word.pinyin}</span></div><ArrowUpRight size={20}/><p lang="en">{sense.english.split(';')[0]}</p>{sense.malay && <p className="card-malay" lang="ms">{sense.malay}</p>}</div></button><div className="word-card-tools"><PronunciationButton text={word.simplified} compact/>{onSave && <button className={`icon-button ${saved ? 'is-saved' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${word.simplified}`} aria-pressed={!!saved} onClick={() => onSave(word.id)}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'}/></button>}</div></article>;
}
