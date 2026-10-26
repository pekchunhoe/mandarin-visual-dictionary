import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AITeacher } from '../src/components/AITeacher';
import { byId } from '../src/data/learning';
import { buildTeacherCopyPrompt } from '../src/lib/teacher-copy-prompt';

const word = byId.get('苹果')!, sense = word.senses[0];
const mount = () => render(<AITeacher word={word} sense={sense}/>);
const sentenceButton = () => screen.getByRole('button', { name: 'Copy sentence prompt for 苹果' });
const relationButton = () => screen.getByRole('button', { name: 'Copy synonym and antonym prompt for 苹果' });
let writeText: ReturnType<typeof vi.fn>;
let clipboardDescriptor: PropertyDescriptor | undefined, commandDescriptor: PropertyDescriptor | undefined;
beforeEach(() => {
  clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  commandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');
  writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});
afterEach(() => {
  vi.useRealTimers();
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else Reflect.deleteProperty(navigator, 'clipboard');
  if (commandDescriptor) Object.defineProperty(document, 'execCommand', commandDescriptor);
  else Reflect.deleteProperty(document, 'execCommand');
});

it('adds exactly two secondary controls without replacing or triggering the two Gemini functions', async () => {
  const fetcher = vi.spyOn(globalThis, 'fetch'); mount();
  expect(screen.getAllByRole('button', { name: /^Copy .+ prompt for/ })).toHaveLength(2);
  expect(screen.getByRole('button', { name: /造句 · Example Sentences/ })).toBeEnabled();
  expect(screen.getByRole('button', { name: /近义词和反义词 · Synonyms/ })).toBeEnabled();
  fireEvent.click(sentenceButton()); await waitFor(() => expect(writeText).toHaveBeenCalledWith(buildTeacherCopyPrompt(word, sense, 'sentences')));
  fireEvent.click(relationButton()); await waitFor(() => expect(writeText).toHaveBeenCalledWith(buildTeacherCopyPrompt(word, sense, 'synonyms-antonyms')));
  expect(screen.getAllByText('Prompt copied!')).toHaveLength(2); expect(fetcher).not.toHaveBeenCalled();
  expect(screen.queryByText('Preparing your learning notes…')).not.toBeInTheDocument();
});
it('clears the brief accessible success feedback', async () => {
  vi.useFakeTimers(); mount();
  await act(async () => { fireEvent.click(sentenceButton()); });
  expect(screen.getByRole('status')).toHaveTextContent('Prompt copied!');
  act(() => { vi.advanceTimersByTime(3000); }); expect(screen.queryByText('Prompt copied!')).not.toBeInTheDocument();
});
it.each([['rate_limited', 429], ['not_configured', 503], ['unavailable', 503]])('keeps copying available after Gemini %s', async (code, status) => {
  const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code }), { status: Number(status) })); mount();
  fireEvent.click(screen.getByRole('button', { name: /造句 · Example Sentences/ })); await screen.findByRole('alert');
  expect(sentenceButton()).toBeEnabled(); expect(relationButton()).toBeEnabled();
  fireEvent.click(relationButton()); await screen.findByText('Prompt copied!');
  expect(writeText).toHaveBeenCalledWith(buildTeacherCopyPrompt(word, sense, 'synonyms-antonyms')); expect(fetcher).toHaveBeenCalledTimes(1);
});
it('does not tie prompt copying to an in-flight generation', async () => {
  const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {})); mount();
  fireEvent.click(screen.getByRole('button', { name: /造句 · Example Sentences/ }));
  expect(screen.getByRole('button', { name: /造句 · Example Sentences/ })).toBeDisabled(); expect(sentenceButton()).toBeEnabled();
  fireEvent.click(sentenceButton()); await screen.findByText('Prompt copied!'); expect(fetcher).toHaveBeenCalledTimes(1);
});
it('works offline for the already loaded dictionary entry', async () => {
  const previous = Object.getOwnPropertyDescriptor(navigator, 'onLine');
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
  try { const fetcher = vi.spyOn(globalThis, 'fetch'); mount(); fireEvent.click(sentenceButton()); await screen.findByText('Prompt copied!'); expect(fetcher).not.toHaveBeenCalled(); }
  finally { if (previous) Object.defineProperty(navigator, 'onLine', previous); else delete (navigator as unknown as Record<string, unknown>).onLine; }
});
it('uses the existing legacy clipboard fallback if direct access fails', async () => {
  writeText.mockRejectedValue(new Error('Clipboard denied'));
  const execCommand = vi.fn(() => { expect(document.querySelector('textarea')?.value).toBe(buildTeacherCopyPrompt(word, sense, 'sentences')); return true; });
  Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });
  mount(); fireEvent.click(sentenceButton()); await screen.findByText('Prompt copied!'); expect(execCommand).toHaveBeenCalledWith('copy');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
it('offers an accessible selected manual-copy field when both clipboard methods fail', async () => {
  writeText.mockRejectedValue(new Error('Clipboard denied'));
  Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => false) });
  const fetcher = vi.spyOn(globalThis, 'fetch'); mount(); fireEvent.click(relationButton());
  expect(await screen.findByRole('alert')).toHaveTextContent('copy it manually');
  const field = screen.getByRole('textbox', { name: 'synonym and antonym prompt for manual copying' }) as HTMLTextAreaElement;
  expect(field).toHaveValue(buildTeacherCopyPrompt(word, sense, 'synonyms-antonyms')); expect(field).toHaveFocus();
  expect(field.selectionStart).toBe(0); expect(field.selectionEnd).toBe(field.value.length); expect(field.readOnly).toBe(true);
  expect(fetcher).not.toHaveBeenCalled();
});
it('updates context and resets feedback when the selected entry or sense changes', async () => {
  const view = mount(); fireEvent.click(sentenceButton()); await screen.findByText('Prompt copied!');
  const next = byId.get('开')!, selected = next.senses.find(item => /\bto turn on\b/.test(item.english))!;
  view.rerender(<AITeacher word={next} sense={selected}/>);
  expect(screen.queryByText('Prompt copied!')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copy sentence prompt for 开' }));
  await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(buildTeacherCopyPrompt(next, selected, 'sentences')));
  view.rerender(<AITeacher word={next} sense={next.senses[0]}/>);
  fireEvent.click(screen.getByRole('button', { name: 'Copy sentence prompt for 开' }));
  await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(buildTeacherCopyPrompt(next, next.senses[0], 'sentences')));
});
