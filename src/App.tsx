import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, Compass, Heart, Search, WifiOff } from 'lucide-react';
import { byId, categories, words } from './data/learning';
import type { Word } from './types';
import { Home } from './pages/Home';
const WordDetail = lazy(() => import('./pages/WordDetail').then(module => ({ default: module.WordDetail })));
import { SearchBar } from './components/SearchBar';
import { WordCard } from './components/WordCard';
const PictureQuiz = lazy(() => import('./components/PictureQuiz').then(module => ({ default: module.PictureQuiz })));
import { searchDictionary } from './lib/search';
import { readStored, writeStored } from './lib/storage';
import { refreshSavedWords } from './lib/dictionary-client';
type Route = { page: 'home' | 'category' | 'saved' | 'practice' | 'search' | 'word'; value?: string; entry?: string };
function readRoute(): Route { const params = new URLSearchParams(location.hash.slice(1)); for (const page of ['word', 'category', 'search'] as const) if (params.has(page)) return { page, value: params.get(page)!, entry: params.get('entry') ?? undefined }; if (params.has('saved')) return { page: 'saved' }; if (params.has('practice')) return { page: 'practice' }; return { page: 'home' }; }
export default function App() {
  const [route, setRoute] = useState<Route>(readRoute); const [selected, setSelected] = useState<Word>(); const [found, setFound] = useState<Word[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const [recent, setRecent] = useState<string[]>(() => { const stored = readStored<unknown>('kanjian-recent', []); return Array.isArray(stored) ? stored.filter(v => typeof v === 'string').slice(0, 6) : []; });
  const [saved, setSaved] = useState<string[]>(() => { const stored = readStored<unknown>('kanjian-saved', []); return Array.isArray(stored) ? stored.filter(v => typeof v === 'string') : []; });
  const [savedEntries, setSavedEntries] = useState<Word[]>(() => { const stored = readStored<unknown>('kanjian-saved-entries', []); return Array.isArray(stored) ? stored.filter(w => w && typeof w.id === 'string' && typeof w.simplified === 'string' && Array.isArray(w.senses) && w.senses.length) : []; });
  const [savedReady, setSavedReady] = useState(savedEntries.length === 0);
  const preparingSaved = !savedReady && (route.page === 'saved' || route.page === 'word' && savedEntries.some(word => word.id === route.entry));
  const [offline, setOffline] = useState(!navigator.onLine); const [practiceIndex, setPracticeIndex] = useState(0); const [retry, setRetry] = useState(0); const heading = useRef<HTMLElement>(null); const first = useRef(true);
  const practiceWords = words.filter(w => w.photo);
  useEffect(() => { const change = () => setRoute(readRoute()); const online = () => setOffline(!navigator.onLine); window.addEventListener('hashchange', change); window.addEventListener('online', online); window.addEventListener('offline', online); return () => { window.removeEventListener('hashchange', change); window.removeEventListener('online', online); window.removeEventListener('offline', online); }; }, []);
  useEffect(() => {
    const controller = new AbortController(); setError(''); setLoading(false);
    if (!first.current) { window.scrollTo({ top: 0, behavior: 'instant' }); heading.current?.focus({ preventScroll: true }); } first.current = false;
    if (preparingSaved) {
      setLoading(true);
      refreshSavedWords(savedEntries, controller.signal).then(entries => {
        if (controller.signal.aborted) return;
        setSavedEntries(entries); setSavedReady(true);
      }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
      return () => controller.abort();
    }
    if (route.page === 'search' || route.page === 'word') {
      const query = route.value ?? ''; const cached = byId.get(query);
      if (route.page === 'word' && cached) { setSelected(cached); return; }
      setLoading(true);
      const savedEntry = savedEntries.find(w => w.id === route.entry);
      if (route.page === 'word' && savedEntry) { setSelected(savedEntry); setLoading(false); return; }
      searchDictionary(query, controller.signal).then(results => { if (controller.signal.aborted) return; setFound(results); if (route.page === 'word') setSelected(results.find(w => w.id === route.entry) ?? results.find(w => w.simplified === query) ?? results[0]); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }
    document.title = `${route.value ? route.value + ' · ' : ''}Kànjiàn · Visual Mandarin Dictionary`;
    return () => controller.abort();
  }, [route, retry, savedReady]);
  function go(page: Route['page'], value?: string, entry?: string) { const params = new URLSearchParams(); if (page !== 'home') params.set(page, value ?? ''); if (entry) params.set('entry', entry); const hash = params.toString(); if (location.hash.slice(1) === hash) setRoute({ page, value, entry }); else location.hash = hash; }
  function search(query: string) { setRecent(previous => { const next = [query, ...previous.filter(q => q !== query)].slice(0, 6); writeStored('kanjian-recent', next); return next; }); const match = byId.get(query); if (match) go('word', match.simplified); else go('search', query); }
  function openWord(word: Word) { setSelected(word); go('word', word.simplified, byId.has(word.id) ? undefined : word.id); }
  function save(id: string) { if (!byId.has(id) && selected?.id === id) setSavedEntries(previous => { const next = [...previous.filter(w => w.id !== id), selected]; writeStored('kanjian-saved-entries', next); return next; }); setSaved(previous => { const next = previous.includes(id) ? previous.filter(v => v !== id) : [...previous, id]; writeStored('kanjian-saved', next); return next; }); }
  const categoryWords = route.page === 'saved' ? [...words, ...savedEntries].filter(w => saved.includes(w.id)) : words.filter(w => route.value === 'All' || w.category === route.value);
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><div className="header-inner"><a className="brand" href="#" aria-label="Kànjiàn home"><span className="brand-mark"><BookOpen size={25}/><i/></span><span className="brand-text"><strong><span lang="zh-Hans">看见</span> <span>Kànjiàn</span></strong><small>VISUAL MANDARIN DICTIONARY</small></span></a><nav aria-label="Main navigation"><a className={['home', 'word', 'search'].includes(route.page) ? 'active' : ''} href="#"><BookOpen size={17}/><span>Discover</span></a><a className={route.page === 'category' ? 'active' : ''} href="#category=All"><Compass size={17}/><span>Explore</span></a><a className={route.page === 'practice' ? 'active' : ''} href="#practice="><span className="practice-nav-icon">✧</span><span>Practice</span></a></nav><a className={`saved-nav ${route.page === 'saved' ? 'active' : ''}`} href="#saved="><Bookmark size={18}/><span>My words</span>{saved.length > 0 && <small>{saved.length}</small>}</a></div></header>
    {offline && <div className="offline-banner" role="status"><WifiOff size={16}/> You’re offline. The learning collection is available; internet pictures need a connection.</div>}
    <main id="main" ref={heading} tabIndex={-1} className="main-container">{route.page !== 'home' && <div className="inner-search"><SearchBar onSearch={search} recent={recent} initial={route.page === 'search' ? route.value : ''}/></div>}
    {route.page === 'home' && <Home onSearch={search} onOpen={openWord} onCategory={c => go('category', c)} recent={recent} saved={saved} onSave={save}/>}
    {!error && (loading || preparingSaved) && <section className="search-loading" role="status" aria-label="Loading dictionary"><div className="skeleton text-skeleton"/><div className="skeleton text-skeleton short"/><p>Opening the dictionary…</p><div className="word-grid">{[0,1,2,3].map(i => <div key={i} className="skeleton card-skeleton"/>)}</div></section>}
    {error && <section className="empty-state" role="alert"><WifiOff size={40}/><h1>Let’s try that again.</h1><p>{error}</p><button className="primary-button" onClick={() => setRetry(r => r + 1)}>Retry dictionary <ArrowRight size={17}/></button><button className="text-button" onClick={() => go('category', 'All')}>Browse the offline learning collection</button></section>}
    {!loading && !preparingSaved && !error && route.page === 'word' && selected && <Suspense fallback={<p role="status">Opening the word...</p>}><WordDetail key={selected.id} word={selected} onOpen={openWord} saved={saved} onSave={save} onBack={() => go('home')}/></Suspense>}
    {!loading && !error && (route.page === 'search' || (route.page === 'word' && !selected)) && <section className="results-page"><div className="page-title"><span className="eyebrow">LET’S FIND YOUR WORD</span><h1>Results for “{route.value}”</h1><p>{found.length ? `${found.length} words to explore. Select a word to see its meanings.` : '找不到这个词语 · No matching words yet.'}</p></div>{found.length ? <div className="word-grid">{found.map(word => <WordCard key={word.id} word={word} onOpen={openWord}/>)}</div> : <div className="empty-state"><Search size={35}/><h2>A different spelling might help.</h2><p>Try simplified or traditional Chinese, pinyin without tones, English, or a Malay word from the learning collection.</p><div className="suggested-chips">{['苹果','猫','飞机','因为'].map(q => <button key={q} onClick={() => search(q)}>{q} <ArrowRight size={15}/></button>)}</div></div>}</section>}
    {!preparingSaved && ['category', 'saved'].includes(route.page) && <section className="browse-page"><button className="text-button back-link" onClick={() => go('home')}><ArrowLeft size={16}/> Back to discovering</button><div className="page-title"><span className="eyebrow">{route.page === 'saved' ? 'YOUR GROWING COLLECTION' : 'LET YOUR EYES LEAD THE WAY'}</span><h1>{route.page === 'saved' ? 'My little book of words.' : route.value === 'All' ? 'A world of words.' : `${categories.find(c => c[0] === route.value)?.[1] ?? ''} ${route.value}`}</h1><p>{route.page === 'saved' ? `${categoryWords.length} saved words. Keep your discoveries close.` : 'See something familiar. Learn something new.'}</p></div>{route.page === 'category' && <div className="category-tabs" aria-label="Choose a category">{['All', ...categories.map(c => c[0]), 'Connections', 'Places'].map(c => <button key={c} aria-pressed={route.value === c} onClick={() => go('category', c)}>{c}</button>)}</div>}{categoryWords.length ? <div className="word-grid browse-grid">{categoryWords.map(word => <WordCard key={word.id} word={word} onOpen={openWord} saved={saved.includes(word.id)} onSave={save}/>)}</div> : <div className="empty-state"><Bookmark size={38}/><h2>Your first discovery is waiting.</h2><p>Tap the bookmark beside a word to save it here on this device.</p><button className="primary-button" onClick={() => go('category', 'All')}>Find a word to love <ArrowRight size={17}/></button></div>}</section>}
    {route.page === 'practice' && <section className="practice-page"><div className="page-title"><span className="eyebrow">SMALL STEPS. LASTING CONNECTIONS.</span><h1>A picture is worth a word.</h1><p>Build your confidence with a little visual practice.</p></div><Suspense fallback={<p role="status">Opening practice...</p>}><PictureQuiz key={practiceWords[practiceIndex].id} word={practiceWords[practiceIndex]}/></Suspense><div className="practice-next"><span>Word {practiceIndex + 1} of {practiceWords.length}</span><button className="primary-button" onClick={() => setPracticeIndex(i => (i + 1) % practiceWords.length)}>Next picture <ArrowRight size={17}/></button></div></section>}
    </main><footer className="site-footer"><div><a className="footer-brand" href="#"><BookOpen size={20}/> 看见 Kànjiàn</a><p>A little more Mandarin. A little more of the world.</p></div><div className="footer-links"><a href="https://www.mdbg.net/chinese/dictionary?page=cedict" target="_blank" rel="noreferrer">Dictionary: CC-CEDICT</a><a href="https://www.pexels.com" target="_blank" rel="noreferrer">Photos provided by Pexels</a><a href="/data/NOTICE.txt" target="_blank" rel="noreferrer">Sources & license</a></div><span className="made-with">Made for curious minds <Heart size={13}/></span></footer></>;
}
