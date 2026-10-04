import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from '../src/components/SearchBar';
import { WordDetail } from '../src/pages/WordDetail';
import { byId } from '../src/data/learning';
import { speakMandarin } from '../src/lib/speech';
import { VisualGallery } from '../src/components/VisualGallery';
import { PronunciationButton } from '../src/components/PronunciationButton';
describe('search input', () => {
  it('clears while preserving input focus', () => { render(<SearchBar onSearch={vi.fn()} recent={[]} initial="苹果"/>); fireEvent.click(screen.getByRole('button', { name: 'Clear search' })); expect(screen.getByRole('combobox')).toHaveValue(''); expect(screen.getByRole('combobox')).toHaveFocus(); });
  it('does not submit during Chinese IME composition', () => { const search = vi.fn(); render(<SearchBar onSearch={search} recent={[]}/>); const input = screen.getByRole('combobox'); fireEvent.compositionStart(input); fireEvent.change(input, { target: { value: '苹' } }); fireEvent.submit(screen.getByRole('search')); expect(search).not.toHaveBeenCalled(); fireEvent.compositionEnd(input, { data: '苹果', target: { value: '苹果' } }); fireEvent.submit(screen.getByRole('search')); expect(search).toHaveBeenCalledWith('苹果'); });
  it('supports clicking recent searches', () => { const search = vi.fn(); render(<SearchBar onSearch={search} recent={['苹果']}/>); fireEvent.focus(screen.getByRole('combobox')); fireEvent.click(screen.getByRole('option').querySelector('button')!); expect(search).toHaveBeenCalledWith('苹果'); });
});
describe('visual learning states', () => {
  it('shows an abstract diagram without requesting photos', () => { const fetcher = vi.spyOn(globalThis, 'fetch'); render(<WordDetail word={byId.get('因为')!} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>); expect(screen.getByText('An idea you can picture.')).toBeInTheDocument(); expect(fetcher).not.toHaveBeenCalled(); });
  it('shows loading skeletons for an uncached gallery', () => { vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {})); const word = byId.get('银行')!; render(<VisualGallery word={word} sense={word.senses[0]}/>); expect(screen.getByRole('status', { name: 'Loading pictures' })).toBeInTheDocument(); });
  it('switches sense and examples without mixing meanings', async () => { vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ images: [], status: 'unavailable' }) } as Response); render(<WordDetail word={byId.get('开')!} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>); expect(screen.getByText('Please open the door.')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: /2. to turn on/ })); expect(screen.getByText('Please turn on the light.')).toBeInTheDocument(); expect(screen.queryByText('Please open the door.')).not.toBeInTheDocument(); await waitFor(() => expect(screen.queryByText('Finding pictures…')).not.toBeInTheDocument()); });
});
describe('Mandarin speech', () => {
  it('switches between buttons without an old component cancelling the new speech', () => {
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} });
    const synth = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [{ lang: 'zh-CN' }] };
    vi.stubGlobal('speechSynthesis', synth);
    const rendered = render(<><PronunciationButton text="苹果"/><PronunciationButton text="猫"/></>);
    fireEvent.click(screen.getByRole('button', { name: 'Listen to 苹果' }));
    fireEvent.click(screen.getByRole('button', { name: 'Listen to 猫' }));
    expect(synth.speak).toHaveBeenCalledTimes(2);
    expect(synth.cancel.mock.invocationCallOrder.at(-1)).toBeLessThan(synth.speak.mock.invocationCallOrder.at(-1)!);
    expect(screen.getAllByRole('button', { name: 'Stop pronunciation' })).toHaveLength(1);
    rendered.unmount(); vi.unstubAllGlobals();
  });
  it('cancels before speaking and always uses a Mandarin voice', () => { const fakeUtterance = class { text: string; lang = ''; voice: unknown; rate = 1; constructor(text: string) { this.text = text; } }; vi.stubGlobal('SpeechSynthesisUtterance', fakeUtterance); const chinese = { lang: 'zh-CN' }; const synth = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [{ lang: 'en-US' }, chinese] }; speakMandarin('苹果', vi.fn(), synth as unknown as SpeechSynthesis); speakMandarin('猫', vi.fn(), synth as unknown as SpeechSynthesis); expect(synth.cancel).toHaveBeenCalledTimes(2); expect(synth.speak.mock.calls[0][0].voice).toBe(chinese); expect(synth.speak.mock.calls[0][0].lang).toBe('zh-CN'); expect(synth.cancel.mock.invocationCallOrder[1]).toBeLessThan(synth.speak.mock.invocationCallOrder[1]); vi.unstubAllGlobals(); });
  it('does not silently use an English voice for Chinese', () => { vi.stubGlobal('SpeechSynthesisUtterance', class {}); const synth = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [{ lang: 'en-US' }] }; expect(() => speakMandarin('猫', vi.fn(), synth as unknown as SpeechSynthesis)).toThrow('Mandarin voice'); expect(synth.speak).not.toHaveBeenCalled(); vi.unstubAllGlobals(); });
});
