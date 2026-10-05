import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchImages, clearBrowserImageCache } from '../src/lib/images';
import { IMAGE_TTL } from '../src/lib/visual';
import { byId } from '../src/data/learning';
import { VisualGallery } from '../src/components/VisualGallery';
import { WordDetail } from '../src/pages/WordDetail';
import { WordCard } from '../src/components/WordCard';
import { Home } from '../src/pages/Home';
import type { ImageResult } from '../src/types';
import { fromRow, refreshWordVisuals } from '../src/lib/dictionary-entry';
import { VISUAL_SCHEMA } from '../src/lib/visual-inference';
import { imageCacheKey } from '../src/lib/visual';
import { visualQuery } from '../src/lib/visual';
const apple = byId.get('苹果')!;
const live = (label = 'Live apple', expiresAt = Date.now() + IMAGE_TTL): ImageResult => ({ status: 'live', expiresAt, images: [{ id: label, provider: 'pixabay', thumbnailUrl: 'https://pixabay.com/get/apple_340.jpg', displayUrl: 'https://pixabay.com/get/apple_640.jpg', largeUrl: 'https://pixabay.com/get/apple_1280.jpg', width: 900, height: 700, alt: label, source: 'Pixabay', sourceUrl: 'https://pixabay.com/photos/apple-1/' }] });
const response = (result: ImageResult) => ({ ok: true, json: async () => result }) as Response;
const observers: { callback: IntersectionObserverCallback; element?: Element }[] = [];
beforeEach(() => {
  clearBrowserImageCache(); observers.length = 0;
  vi.stubGlobal('IntersectionObserver', class { entry: typeof observers[number]; constructor(callback: IntersectionObserverCallback) { this.entry = { callback }; observers.push(this.entry); } observe(element: Element) { this.entry.element = element; } disconnect() {} });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
function intersect(element: Element) { for (const observer of observers) if (observer.element === element) observer.callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], {} as IntersectionObserver); }
describe('bounded browser image requests', () => {
  it('reclassifies old saved non-visual words and versions their query caches', () => {
    const word = fromRow(['恐慌', '恐慌', 'kong3 huang1', ['panic', 'panicky', 'panic-stricken']]);
    const stale = { ...word, senses: word.senses.map(s => ({ ...s, visualType: 'abstract' as const, visualQuery: undefined, visualSubject: undefined })) };
    const refreshed = refreshWordVisuals(stale);
    expect(refreshed.senses[0].visualType).toBe('emotion');
    expect(visualQuery(refreshed.senses[0])).toBe('panicked person facial expression');
    expect(imageCacheKey(refreshed, refreshed.senses[0])).toContain('dictionary-visual-v6');
    expect(imageCacheKey(refreshed, refreshed.senses[0])).not.toContain('dictionary-visual-v2');
    expect(refreshWordVisuals(apple).senses[0].visualQuery).toBe(apple.senses[0].visualQuery);
    const missingQuery = { ...word, senses: [{ ...stale.senses[0], visualOrigin: 'curated' as const, visualType: 'emotion' as const }] };
    expect(visualQuery(refreshWordVisuals(missingQuery).senses[0])).toBe('panicked person facial expression');
  });
  it('ignores old persisted image records and versions the current cache', async () => {
    localStorage.setItem('kanjian-images', JSON.stringify({ images: [], status: 'unavailable' }));
    expect(imageCacheKey(apple, apple.senses[0])).toContain(VISUAL_SCHEMA);
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live()));
    expect((await fetchImages(apple, apple.senses[0])).status).toBe('live'); expect(fetcher).toHaveBeenCalledTimes(1); localStorage.removeItem('kanjian-images');
  });
  it('deduplicates concurrent calls and expires at the original server deadline', async () => {
    vi.useFakeTimers(); const expiresAt = Date.now() + 1000;
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live('first', expiresAt)));
    await Promise.all([fetchImages(apple, apple.senses[0]), fetchImages(apple, apple.senses[0])]); vi.advanceTimersByTime(999); await fetchImages(apple, apple.senses[0]); expect(fetcher).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); fetcher.mockResolvedValue(response(live('fresh'))); expect((await fetchImages(apple, apple.senses[0])).images[0].alt).toBe('fresh'); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('caps even an excessive server expiry at 24 hours', async () => {
    vi.useFakeTimers(); const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => response(live('apple', Date.now() + IMAGE_TTL * 10)));
    await fetchImages(apple, apple.senses[0]); vi.advanceTimersByTime(IMAGE_TTL - 1); await fetchImages(apple, apple.senses[0]); expect(fetcher).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); await fetchImages(apple, apple.senses[0]); expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('separates senses and never promotes a single thumbnail into a gallery', async () => {
    const word = byId.get('开')!; const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live()));
    await fetchImages(word, word.senses[0], false, 'thumbnail'); await fetchImages(word, word.senses[0]); await fetchImages(word, word.senses[1]); expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it('reuses a pending gallery for a thumbnail without another request', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live()));
    const results = await Promise.all([fetchImages(apple, apple.senses[0]), fetchImages(apple, apple.senses[0], false, 'thumbnail')]); expect(results[1].images).toHaveLength(1); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects expired and malformed responses instead of caching them', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response(live('old', Date.now() - 1))).mockResolvedValueOnce(response({ status: 'live' } as ImageResult));
    await expect(fetchImages(apple, apple.senses[0])).rejects.toThrow('expired'); await expect(fetchImages(apple, apple.senses[0])).rejects.toThrow('unavailable');
  });
  it('honors an API 429 cooldown even for explicit retry and other cards', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 429, headers: new Headers({ 'Retry-After': '120' }) } as Response);
    await expect(fetchImages(apple, apple.senses[0])).rejects.toThrow('Too many'); await expect(fetchImages(apple, apple.senses[0], true)).rejects.toThrow('Too many'); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('uses bundled photos offline without making a request', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false); const fetcher = vi.spyOn(globalThis, 'fetch');
    const result = await fetchImages(apple, apple.senses[0], false, 'thumbnail'); expect(result.images).toHaveLength(1); expect(result.images[0].thumbnailUrl).toBe('/photos/apple.jpg'); expect(fetcher).not.toHaveBeenCalled();
  });
});
describe('lazy cards and gallery lifecycle', () => {
  it.each(['', 'however', 'used as a particle'])('uses the existing explanation when meaning %j has no eligible visual query', meaning => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const word = fromRow(['測試', '测试', 'ce4 shi4', [meaning]]);
    render(<WordDetail word={word} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
    expect(screen.getByText('Let’s understand this meaning.')).toBeVisible();
    expect(screen.queryByRole('status', { name: 'Loading pictures' })).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    ['恐慌', '恐慌', 'kong3 huang1', 'panic'],
    ['驚訝', '惊讶', 'jing1 ya4', 'amazed']
  ])('shows the definition immediately and a live emotion gallery for %s', async (traditional, simplified, pinyin, meaning) => {
    const word = fromRow([traditional, simplified, pinyin, [meaning]]);
    let finish!: (value: Response) => void;
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<WordDetail word={word} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
    expect(screen.getByText(meaning, { exact: true })).toBeVisible();
    expect(screen.getByRole('status', { name: 'Loading pictures' })).toBeVisible();
    expect(screen.queryByText(/does not have a reviewed visual explanation/)).not.toBeInTheDocument();
    await act(async () => finish(response(live('Emotion expression'))));
    await screen.findByRole('button', { name: 'Enlarge picture: Emotion expression' });
    const params = new URL(String(fetcher.mock.calls[0][0]), 'http://localhost').searchParams;
    expect(params.get('word')).toBe(word.id); expect(params.get('sense')).toBe('sense-0'); expect(params.get('mode')).toBe('gallery');
  });
  it('loads only a lazy thumbnail for a non-curated emotion card', async () => {
    const word = fromRow(['恐慌', '恐慌', 'kong3 huang1', ['panic']]);
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live('Emotion thumbnail')));
    const view = render(<WordCard word={word} onOpen={vi.fn()}/>);
    expect(fetcher).not.toHaveBeenCalled();
    act(() => intersect(view.container.querySelector('.word-thumbnail')!));
    await waitFor(() => expect(view.container.querySelector('img')).toHaveAttribute('alt', 'Emotion thumbnail'));
    expect(fetcher).toHaveBeenCalledTimes(1); expect(String(fetcher.mock.calls[0][0])).toContain('mode=thumbnail');
  });
  it('renders a live gallery for a full-dictionary entry outside the starter collection', async () => {
    const word = fromRow(['長頸鹿', '长颈鹿', 'chang2 jing3 lu4', ['giraffe', 'CL:只[zhi1]']]);
    expect(byId.has(word.id)).toBe(false);
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live('Giraffe animal')));
    render(<WordDetail word={word} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
    await screen.findByRole('button', { name: 'Enlarge picture: Giraffe animal' });
    expect(new URL(String(fetcher.mock.calls[0][0]), 'http://localhost').searchParams.get('word')).toBe(word.id);
    expect(screen.queryByText('Let’s understand this meaning.')).not.toBeInTheDocument();
  });
  it('loads category thumbnails only when near the viewport and deduplicates matching word cards', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live()));
    const view = render(<Home onSearch={vi.fn()} onOpen={vi.fn()} onCategory={vi.fn()} recent={[]} saved={[]} onSave={vi.fn()}/>);
    expect(fetcher).not.toHaveBeenCalled();
    const category = view.container.querySelector('[aria-label="Explore Food"] .word-thumbnail')!;
    act(() => intersect(category)); await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1)); expect(String(fetcher.mock.calls[0][0])).toContain('mode=thumbnail');
    const card = view.container.querySelector('.word-card .word-thumbnail')!;
    act(() => intersect(card)); await waitFor(() => expect(card.querySelector('img')).toHaveAttribute('src', 'https://pixabay.com/get/apple_340.jpg')); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('requests just a thumbnail for each visible related word and keeps text independent of image completion', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
    const view = render(<WordDetail word={apple} onOpen={vi.fn()} saved={[]} onSave={vi.fn()} onBack={vi.fn()}/>);
    expect(screen.getByRole('heading', { name: '苹果', level: 1 })).toBeVisible(); expect(fetcher).toHaveBeenCalledTimes(1);
    act(() => intersect(view.container.querySelector('.related-grid .word-thumbnail')!)); await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2)); expect(String(fetcher.mock.calls[1][0])).toContain('mode=thumbnail');
  });
  it('keeps a bundled card picture when the service or image fails', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(live()));
    const view = render(<WordCard word={apple} onOpen={vi.fn()}/>); act(() => intersect(view.container.querySelector('.word-thumbnail')!));
    await waitFor(() => expect(view.container.querySelector('img')).toHaveAttribute('src', 'https://pixabay.com/get/apple_340.jpg'));
    fireEvent.error(view.container.querySelector('img')!); expect(view.container.querySelector('img')).toHaveAttribute('src', '/photos/apple.jpg'); expect(view.container.querySelector('.thumbnail-credit')).toBeNull();
    view.unmount(); clearBrowserImageCache(); fetcher.mockRejectedValue(new Error('offline'));
    const failed = render(<WordCard word={apple} onOpen={vi.fn()}/>); act(() => intersect(failed.container.querySelector('.word-thumbnail')!)); await act(async () => {}); expect(failed.container.querySelector('img')).toHaveAttribute('src', '/photos/apple.jpg');
  });
  it('ignores an obsolete gallery response after switching words', async () => {
    let finish!: (response: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValue(response(live('New cat')));
    const view = render(<VisualGallery word={apple} sense={apple.senses[0]}/>); const cat = byId.get('猫')!;
    view.rerender(<VisualGallery word={cat} sense={cat.senses[0]}/>); await screen.findByRole('button', { name: 'Enlarge picture: New cat' });
    await act(async () => finish(response(live('Old apple')))); expect(screen.queryByRole('button', { name: 'Enlarge picture: Old apple' })).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Enlarge picture: New cat' })).toBeInTheDocument();
  });
  it('removes expired URLs and refreshes a gallery that remains mounted', async () => {
    vi.useFakeTimers(); const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response(live('Old apple', Date.now() + 1000))).mockResolvedValueOnce(response(live('Fresh apple')));
    render(<VisualGallery word={apple} sense={apple.senses[0]}/>); await act(async () => {}); expect(screen.getByRole('button', { name: 'Enlarge picture: Old apple' })).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); }); expect(screen.queryByRole('button', { name: 'Enlarge picture: Old apple' })).not.toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Enlarge picture: Fresh apple' })).toBeInTheDocument(); expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
