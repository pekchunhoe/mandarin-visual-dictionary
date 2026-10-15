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
