import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AITeacher } from '../src/components/AITeacher';
import { byId } from '../src/data/learning';
import { clearTeacherClientCache, requestTeacher } from '../src/lib/ai-teacher-client';
import { copyTeacherText, sentenceText, relationsText } from '../src/lib/teacher-clipboard';
import { sentences, relations, teacherResponse } from './teacher-fixtures';
const word = byId.get('苹果')!;
beforeEach(() => clearTeacherClientCache());
afterEach(() => { vi.unstubAllGlobals(); });
const mount = () => render(<AITeacher word={word} sense={word.senses[0]}/>);
const buttons = () => ({ sentences: screen.getByRole('button', { name: /造句 · Example Sentences/ }), relations: screen.getByRole('button', { name: /近义词和反义词 · Synonyms/ }) });
it('renders exactly two feature buttons and performs no request on mount', () => {
  const fetcher = vi.spyOn(globalThis, 'fetch'); mount(); expect(screen.getAllByRole('button')).toHaveLength(4); expect(screen.getAllByRole('button', { name: /^Copy .+ prompt for/ })).toHaveLength(2); expect(fetcher).not.toHaveBeenCalled();
});
it('generates only on click and copies just the selected trilingual sentence', async () => {
  const clipboard = vi.fn().mockResolvedValue(undefined); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboard } });
  const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(teacherResponse('sentences', sentences)))); mount();
  fireEvent.click(buttons().sentences); await screen.findByText(sentences.sentences[0].chinese);
  expect(fetcher).toHaveBeenCalledTimes(1); expect(screen.getAllByRole('button', { name: '复制 · Copy' })).toHaveLength(3);
  fireEvent.click(screen.getAllByRole('button', { name: '复制 · Copy' })[1]);
  await screen.findByText('已复制 · Copied'); expect(clipboard).toHaveBeenCalledWith(sentenceText(sentences.sentences[1]));
  expect(clipboard.mock.calls[0][0]).not.toContain(sentences.sentences[0].chinese);
});
it('shows empty relations, one Copy All button and switches without regenerating', async () => {
  const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
    const action = JSON.parse(String(init?.body)).action;
    return new Response(JSON.stringify(teacherResponse(action, action === 'sentences' ? sentences : relations)));
  });
  mount(); fireEvent.click(buttons().relations); await screen.findByText('No commonly recognized antonym.', { exact: false });
  expect(screen.getAllByRole('button', { name: '复制全部 · Copy All' })).toHaveLength(1);
  fireEvent.click(buttons().sentences); await screen.findByText(sentences.sentences[0].chinese);
  fireEvent.click(buttons().relations); await screen.findByText('No commonly recognized antonym.', { exact: false });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it('copies the entire large collection even before expanding it', async () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({ chinese: `词语${i}`, english: `Meaning ${i}`, malay: `Makna ${i}` }));
  const value = { ...relations, synonyms: rows };
  const clipboard = vi.fn().mockResolvedValue(undefined); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboard } });
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(teacherResponse('synonyms-antonyms', value)))); mount();
  fireEvent.click(buttons().relations); await screen.findByText('词语0'); expect(screen.queryByText('词语19')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '复制全部 · Copy All' })); await waitFor(() => expect(clipboard).toHaveBeenCalledWith(relationsText(value)));
  fireEvent.click(screen.getByRole('button', { name: /Show all 20/ })); expect(screen.getByText('词语19')).toBeInTheDocument();
});
it('shows a retryable error and recovers after an explicit retry', async () => {
  const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ code: 'unavailable' }), { status: 503 })).mockResolvedValueOnce(new Response(JSON.stringify(teacherResponse('sentences', sentences)))); mount();
  fireEvent.click(buttons().sentences); expect(await screen.findByRole('alert')).toHaveTextContent('temporarily unavailable');
  fireEvent.click(screen.getByRole('button', { name: /重试 · Retry/ })); await screen.findByText(sentences.sentences[0].chinese); expect(fetcher).toHaveBeenCalledTimes(2);
});
it.each([['not_configured', 503, 'not configured'], ['rate_limited', 429, 'wait a minute']])('handles %s without breaking the dictionary', async (code, status, message) => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code }), { status: Number(status) })); mount();
  fireEvent.click(buttons().sentences); expect(await screen.findByRole('alert')).toHaveTextContent(String(message));
});
it('does not display an old response after a sense remount', async () => {
  let resolve!: (value: Response) => void;
  vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>(done => { resolve = done; }));
  const view = mount(); fireEvent.click(buttons().sentences); await waitFor(() => expect(resolve).toBeDefined());
  view.rerender(<AITeacher key="new-sense" word={word} sense={{ ...word.senses[0], id: 'sense-1', english: 'another sense' }}/>);
  resolve(new Response(JSON.stringify(teacherResponse('sentences', sentences))));
  await waitFor(() => expect(screen.queryByText(sentences.sentences[0].chinese)).not.toBeInTheDocument());
  expect(screen.getByText(/another sense/)).toBeInTheDocument();
});
it('deduplicates browser requests and rejects malformed data', async () => {
  const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(teacherResponse('sentences', sentences))));
  await Promise.all([requestTeacher(word.id, 'sense-0', 'sentences', word.simplified, 'apple'), requestTeacher(word.id, 'sense-0', 'sentences', word.simplified, 'apple')]); expect(fetcher).toHaveBeenCalledTimes(1);
  clearTeacherClientCache(); fetcher.mockResolvedValue(new Response(JSON.stringify({ model: 'other-model' })));
  await expect(requestTeacher(word.id, 'sense-0', 'sentences', word.simplified, 'apple')).rejects.toThrow();
});
it('rejects historical prompt-version output and accepts fresh output only after explicit retry', async () => {
  const old = { ...teacherResponse('sentences', sentences), version: 'teacher-v1' };
  const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(old))).mockResolvedValueOnce(new Response(JSON.stringify(teacherResponse('sentences', sentences))));
  mount(); fireEvent.click(buttons().sentences);
  expect(await screen.findByRole('alert')).toHaveTextContent('temporarily unavailable');
  expect(screen.queryByText(sentences.sentences[0].chinese)).not.toBeInTheDocument(); expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: /重试 · Retry/ }));
  await screen.findByText(sentences.sentences[0].chinese); expect(fetcher).toHaveBeenCalledTimes(2);
});
it('keeps independent loading states when switching features', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {})); mount();
  fireEvent.click(buttons().sentences); expect(buttons().sentences).toBeDisabled(); expect(buttons().relations).toBeEnabled();
  fireEvent.click(buttons().relations); expect(buttons().relations).toBeDisabled();
  expect(within(screen.getByRole('status')).getByText('Preparing your learning notes…')).toBeInTheDocument();
});
it('offers an offline state without making a network call', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'onLine'); Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
  try { const fetcher = vi.spyOn(globalThis, 'fetch'); mount(); fireEvent.click(buttons().sentences); expect(await screen.findByRole('alert')).toHaveTextContent('offline'); expect(fetcher).not.toHaveBeenCalled(); }
  finally { if (descriptor) Object.defineProperty(navigator, 'onLine', descriptor); else delete (navigator as unknown as Record<string, unknown>).onLine; }
});
it('supports clipboard fallback and restores focus', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  const copy = vi.fn().mockReturnValue(true); Object.defineProperty(document, 'execCommand', { configurable: true, value: copy });
  const view = render(<button>Focused button</button>); const button = screen.getByRole('button'); button.focus();
  await copyTeacherText('中文：苹果\nEnglish: apple\nBahasa Melayu: epal');
  expect(copy).toHaveBeenCalledWith('copy'); expect(button).toHaveFocus(); expect(document.querySelector('textarea')).toBeNull(); view.unmount();
});
