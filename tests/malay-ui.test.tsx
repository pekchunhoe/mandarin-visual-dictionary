import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { WordDetail } from '../src/pages/WordDetail';
import { WordCard } from '../src/components/WordCard';
import type { Word } from '../src/types';
const word: Word = { id: 'fixture', simplified: '开', traditional: '開', numericPinyin: 'kai1', pinyin: 'kāi', source: 'CC-CEDICT', matchedSenseId: 'sense-1', matchedLanguage: 'malay', senses: [
  { id: 'sense-0', english: 'to open', malay: 'membuka', visualType: 'abstract', examples: [], translationStatus: 'unreviewed' },
  { id: 'sense-1', english: 'to boil', malay: 'mendidih', visualType: 'abstract', examples: [], translationStatus: 'unreviewed' }
] };
it('shows aligned meanings for the matched sense and changes language display without mutating content', () => {
  const before = JSON.stringify(word);
  render(<WordDetail word={word} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
  expect(document.querySelector('.meaning-panel p[lang="en"]')).toHaveTextContent('to boil');
  expect(document.querySelector('.meaning-panel p[lang="ms"]')).toHaveTextContent('mendidih');
  fireEvent.click(screen.getByRole('radio', { name: 'Bahasa Melayu only' }));
  expect(document.querySelector('.meaning-panel p[lang="en"]')).toBeNull();
  fireEvent.click(screen.getByRole('radio', { name: 'English only' }));
  expect(document.querySelector('.meaning-panel p[lang="ms"]')).toBeNull();
  fireEvent.click(screen.getByRole('radio', { name: 'English + Bahasa Melayu' }));
  fireEvent.click(screen.getByRole('button', { name: '1. to open' }));
  expect(document.querySelector('.meaning-panel p[lang="ms"]')).toHaveTextContent('membuka');
  expect(JSON.stringify(word)).toBe(before);
});
it('search cards show the matching sense instead of the first sense', () => {
  const open = vi.fn(); render(<WordCard word={word} onOpen={open}/>);
  expect(screen.getByText('mendidih')).toHaveAttribute('lang', 'ms');
  expect(screen.queryByText('membuka')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /to boil/ }));
  expect(open).toHaveBeenCalledWith(word);
});

it('shows the lexical equivalent prominently while preserving the independently labelled explanation', () => {
  const dual: Word = { ...word, matchedSenseId: 'sense-0', senses: [{ ...word.senses[0], english: 'electric current', malay: 'Kadar aliran cas elektrik.', translationKind: 'definition-translation', translationStatus: 'generated', malayLexical: { text: 'arus elektrik', status: 'generated', quality: 'automated-review-required', source: 'licensed reference', license: 'MIT', version: 'fixture' } }] };
  const before = JSON.stringify(dual);
  const detail = render(<WordDetail word={dual} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
  expect(document.querySelector('.malay-lexical p')).toHaveTextContent('arus elektrik');
  expect(document.querySelector('.malay-definition p')).toHaveTextContent('Kadar aliran cas elektrik.');
  expect(screen.getByText('PENERANGAN BAHASA MELAYU')).toBeVisible();
  expect(screen.getByText('Provisional equivalent · awaiting language review')).toBeVisible();
  fireEvent.click(screen.getByRole('radio', { name: 'English only' }));
  expect(document.querySelector('.malay-lexical')).toBeNull();
  expect(document.querySelector('.malay-definition')).toBeNull();
  expect(JSON.stringify(dual)).toBe(before);
  detail.unmount();
  render(<WordCard word={dual} onOpen={vi.fn()}/>);
  expect(screen.getByText('arus elektrik')).toBeVisible();
  expect(screen.queryByText('Kadar aliran cas elektrik.')).not.toBeInTheDocument();
});

it('distinguishes machine-translated definitions from lexical equivalents without claiming review', () => {
  const generated: Word = { ...word, senses: word.senses.map(s => ({ ...s, translationStatus: 'generated', translationKind: s.id === 'sense-1' ? 'definition-translation' : 'lexical-equivalent' })) };
  render(<WordDetail word={generated} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
  expect(screen.getByText('Machine-translated English definition · awaiting language review')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: '1. to open' }));
  expect(screen.getByText('Machine-translated equivalent · awaiting language review')).toBeVisible();
  expect(screen.queryByText('Reviewed Malay meaning')).not.toBeInTheDocument();
});

it('offers only missing senses an official English-to-Malay website link and keeps the selected definition intact', () => {
  const missing: Word = { ...word, matchedSenseId: 'sense-0', senses: [
    { id: 'sense-0', english: 'light (not heavy); light & portable?', visualType: 'abstract', examples: [] },
    { id: 'sense-1', english: 'light; ray', malay: 'cahaya', visualType: 'abstract', examples: [] },
    { id: 'sense-2', english: 'river bank / 岸[an4] # "edge"', visualType: 'abstract', examples: [] }
  ] };
  const before = JSON.stringify(missing);
  render(<WordDetail word={missing} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
  const destination = () => new URL(screen.getByRole('link', { name: 'Translate with Google' }).getAttribute('href')!);
  expect(destination().origin).toBe('https://translate.google.com');
  expect(destination().pathname).toBe('/');
  expect(destination().searchParams.get('sl')).toBe('en');
  expect(destination().searchParams.get('tl')).toBe('ms');
  expect(destination().searchParams.get('text')).toBe(missing.senses[0].english);
  expect(screen.getByRole('link', { name: 'Translate with Google' })).toHaveAttribute('target', '_blank');
  expect(screen.getByRole('link', { name: 'Translate with Google' })).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.getByRole('link', { name: 'Translate with Google' })).toHaveAttribute('referrerpolicy', 'no-referrer');
  fireEvent.click(screen.getByRole('radio', { name: 'English only' }));
  expect(screen.getByRole('link', { name: 'Translate with Google' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: `3. ${missing.senses[2].english}` }));
  expect(destination().searchParams.get('text')).toBe(missing.senses[2].english);
  fireEvent.click(screen.getByRole('radio', { name: 'Bahasa Melayu only' }));
  expect(screen.getByRole('link', { name: 'Translate with Google' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: '2. light; ray' }));
  expect(screen.queryByRole('link', { name: 'Translate with Google' })).not.toBeInTheDocument();
  expect(document.querySelector('.meaning-panel p[lang="ms"]')).toHaveTextContent('cahaya');
  expect(JSON.stringify(missing)).toBe(before);
});
