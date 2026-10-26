import { BookOpen, Check, Copy, LoaderCircle, Sparkles } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { Word, Sense } from '../types';
import type { TeacherAction, TeacherResponse, RelationResult, TrilingualText } from '../lib/ai-teacher-schema';
import { EMPTY_ANTONYMS, EMPTY_SYNONYMS, copyTeacherText, relationsText, sentenceText } from '../lib/teacher-clipboard';
import { CopyTeacherPromptButton } from './CopyTeacherPromptButton';

function CopyButton({ text, all = false }: { text: string; all?: boolean }) {
  const [state, setState] = useState<'ready' | 'copied' | 'failed'>('ready');
  return <div className="teacher-copy"><button type="button" onClick={() => { void copyTeacherText(text).then(() => setState('copied'), () => setState('failed')); }} aria-label={all ? '复制全部 · Copy All' : '复制 · Copy'}>{state === 'copied' ? <Check size={15}/> : <Copy size={15}/>}<span>{state === 'copied' ? '已复制 · Copied' : all ? '复制全部 · Copy All' : '复制 · Copy'}</span></button><span role="status">{state === 'failed' ? 'Copy unavailable. Please select and copy the text.' : state === 'copied' ? 'Copied · Disalin' : ''}</span></div>;
}
function RelationList({ items, antonyms }: { items: TrilingualText[]; antonyms?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return <section className="teacher-relations"><h4>{antonyms ? '反义词 · Antonyms' : '近义词 · Synonyms'} <small lang="ms">{antonyms ? 'Antonim' : 'Sinonim'}</small><span className="teacher-count">{items.length}</span></h4>{items.length ? <><div className="teacher-table"><table><thead><tr><th scope="col" lang="zh-Hans">中文</th><th scope="col">English</th><th scope="col" lang="ms">Bahasa Melayu</th></tr></thead><tbody>{(expanded ? items : items.slice(0, 8)).map(row => <tr key={row.chinese}><td lang="zh-Hans">{row.chinese}</td><td lang="en">{row.english}</td><td lang="ms">{row.malay}</td></tr>)}</tbody></table></div>{items.length > 8 && <button className="text-button teacher-more" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show fewer · Kurangkan' : `Show all ${items.length} · Lihat semua`}</button>}</> : <p className="teacher-empty">{(antonyms ? EMPTY_ANTONYMS : EMPTY_SYNONYMS).split('\n').map((line, index) => <span lang={['zh-Hans', 'en', 'ms'][index]} key={line}>{line}</span>)}</p>}</section>;
}
const features: [TeacherAction, string, string][] = [['sentences', '造句 · Example Sentences', 'Contoh ayat'], ['synonyms-antonyms', '近义词和反义词 · Synonyms & Antonyms', 'Sinonim dan antonim']];
const errorMessages: Record<string, [string, string]> = {
  offline: ['You’re offline. Connect to use AI Teacher.', 'Anda di luar talian. Sambungkan internet untuk menggunakan Guru AI.'],
  not_configured: ['AI Teacher is not configured yet. The dictionary is still available.', 'Guru AI belum tersedia. Kamus masih boleh digunakan.'],
  rate_limited: ['Please wait a minute before trying again.', 'Sila tunggu seminit sebelum mencuba lagi.'],
  unavailable: ['AI Teacher is temporarily unavailable. Please try again.', 'Guru AI tidak tersedia buat sementara waktu. Sila cuba lagi.'],
};
export function AITeacher({ word, sense }: { word: Word; sense: Sense }) {
  const [active, setActive] = useState<TeacherAction>();
  const [results, setResults] = useState<Partial<Record<TeacherAction, TeacherResponse>>>({});
  const [loading, setLoading] = useState<Partial<Record<TeacherAction, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<TeacherAction, string>>>({});
  const busy = useRef(new Set<TeacherAction>()); const panel = useId();
  async function generate(action: TeacherAction) {
    setActive(action);
    if (busy.current.has(action) || (results[action]?.expiresAt ?? 0) > Date.now()) return;
    busy.current.add(action); setLoading(previous => ({ ...previous, [action]: true })); setErrors(previous => ({ ...previous, [action]: undefined }));
    try {
      const { requestTeacher } = await import('../lib/ai-teacher-client');
      const result = await requestTeacher(word.id, sense.id, action, word.simplified, sense.english);
      setResults(previous => ({ ...previous, [action]: result }));
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'unavailable';
      setErrors(previous => ({ ...previous, [action]: errorMessages[code] ? code : 'unavailable' }));
    } finally { busy.current.delete(action); setLoading(previous => ({ ...previous, [action]: false })); }
  }
  const result = active ? results[active]?.result : undefined;
  const error = active ? errors[active] : undefined;
  return <section className="ai-teacher" aria-labelledby={`${panel}-title`}><div className="teacher-heading"><span className="teacher-symbol"><Sparkles size={22}/></span><div><span className="eyebrow">A LITTLE GUIDANCE, IN THREE LANGUAGES</span><h2 id={`${panel}-title`}>AI 老师 <span>AI Teacher</span> <small lang="ms">Guru AI</small></h2></div></div><p className="teacher-context">Explore <strong lang="zh-Hans">{word.simplified}</strong> · {sense.english}</p><div className="teacher-actions">{features.map(([action, label, malay]) => <div className="teacher-feature" key={action}><button type="button" className={`teacher-generate ${active === action ? 'is-active' : ''}`} aria-pressed={active === action} aria-controls={panel} aria-label={`${label} · ${malay}`} disabled={!!loading[action]} onClick={() => { void generate(action); }}>{loading[action] ? <LoaderCircle className="teacher-spinner" size={19}/> : action === 'sentences' ? <BookOpen size={19}/> : <Sparkles size={19}/>}<span>{label}<small lang="ms">{malay}</small></span></button><CopyTeacherPromptButton key={`${word.id}:${sense.id}:${action}`} word={word} sense={sense} action={action}/></div>)}</div>
    {!active && <div id={panel} hidden/>}
    {active && <div id={panel} className="teacher-panel" aria-busy={!!loading[active]}>{loading[active] ? <div className="teacher-progress" role="status"><LoaderCircle className="teacher-spinner" size={23}/><div><p lang="zh-Hans">AI 老师正在准备内容…</p><span>Preparing your learning notes…</span><small lang="ms">Guru AI sedang menyediakan bahan…</small></div></div> : error ? <div className="teacher-error" role="alert"><p lang="zh-Hans">暂时无法生成，请重试。</p><p>{errorMessages[error][0]}</p><p lang="ms">{errorMessages[error][1]}</p><button className="text-button" onClick={() => { void generate(active); }}>重试 · Retry · Cuba lagi</button></div> : result && 'sentences' in result ? <><h3>造句 · Example Sentences <small lang="ms">Contoh ayat</small></h3><div className="teacher-sentences">{result.sentences.map((row, index) => <article className="teacher-sentence" key={row.chinese}><span className="teacher-number">0{index + 1}</span><div><p className="teacher-chinese" lang="zh-Hans"><span className="teacher-language">中文</span>{row.chinese}</p><p lang="en"><span className="teacher-language">English</span>{row.english}</p><p lang="ms"><span className="teacher-language">Bahasa Melayu</span>{row.malay}</p><CopyButton text={sentenceText(row)}/></div></article>)}</div></> : result && <><div className="teacher-result-heading"><h3>近义词和反义词 <span>Synonyms &amp; Antonyms</span></h3><CopyButton all text={relationsText(result as RelationResult)}/></div><RelationList items={(result as RelationResult).synonyms}/><RelationList items={(result as RelationResult).antonyms} antonyms/></>}</div>}
    <p className="teacher-note">AI-generated learning notes · 内容由 AI 生成 · <span lang="ms">Bahan pembelajaran dijana oleh AI</span></p>
  </section>;
}
