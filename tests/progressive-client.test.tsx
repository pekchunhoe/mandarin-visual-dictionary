import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { VisualGallery } from '../src/components/VisualGallery';
import { cachedImages, clearBrowserImageCache, fetchImages } from '../src/lib/images';
import { byId } from '../src/data/learning';
import type { ImageResult } from '../src/types';
const word = byId.get('跑')!;
const result = (ids: string[]): ImageResult => ({ status: 'live', expiresAt: Date.now() + 86400000, images: ids.map(id => ({ id, provider: id.startsWith('late') ? 'openverse' : 'pixabay', thumbnailUrl: '/photos/school.jpg', largeUrl: '/photos/school.jpg', width: 900, height: 700, alt: id, source: 'Fixture', sourceUrl: 'https://example.org/photo' })) });
function stream() {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start(c) { controller = c; } });
  const encoder = new TextEncoder();
  return { response: new Response(body, { headers: { 'Content-Type': 'application/x-ndjson' } }),
    emit(ids: string[], done = false) {
      const bytes = encoder.encode(JSON.stringify({ result: result(ids), done }) + '\n');
      // Split through Unicode and JSON tokens, as real network packets may do.
      for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7));
      if (done) controller.close();
    }, close() { controller.close(); } };
}
beforeEach(clearBrowserImageCache);
it('renders a complete warm gallery immediately without a loading transition or a new request', async () => {
  const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(result(['cached']))));
  await fetchImages(word, word.senses[0]);
  render(<VisualGallery word={word} sense={word.senses[0]}/>);
  expect(screen.getByRole('button', { name: 'Enlarge picture: cached' })).toBeVisible();
  expect(screen.queryByText(/Finding pictures/)).not.toBeInTheDocument(); expect(fetcher).toHaveBeenCalledTimes(1);
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  expect(cachedImages(word, word.senses[0], 'gallery')).toBeUndefined();
});
it('shares progress and the final cache across concurrent subscribers, never caches an incomplete stream', async () => {
  const source = stream(), first = vi.fn(), second = vi.fn();
  const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(source.response);
  const a = fetchImages(word, word.senses[0], false, 'gallery', first);
  source.emit(['早期']); await waitFor(() => expect(first).toHaveBeenCalled());
  const b = fetchImages(word, word.senses[0], false, 'gallery', second);
  expect(second.mock.calls[0][0].images[0].id).toBe('早期');
  expect((await fetchImages(word, word.senses[0], false, 'thumbnail')).images).toHaveLength(1);
  source.emit(['late-strong', '早期'], true);
  expect((await a).images.map(photo => photo.id)).toEqual(['late-strong', '早期']); await b;
  await fetchImages(word, word.senses[0]); expect(fetcher).toHaveBeenCalledTimes(1);
  clearBrowserImageCache(); const broken = stream(); fetcher.mockResolvedValueOnce(broken.response);
  const rejected = fetchImages(word, word.senses[0]); broken.emit(['partial']); broken.close();
  await expect(rejected).rejects.toThrow('interrupted');
  fetcher.mockResolvedValueOnce(new Response(JSON.stringify(result(['new']))));
  expect((await fetchImages(word, word.senses[0])).images[0].id).toBe('new');
});
it('renders the first picture, retains survivor positions, and ignores progress after switching words', async () => {
  const source = stream(); const other = stream();
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(source.response).mockResolvedValueOnce(other.response);
  const view = render(<VisualGallery word={word} sense={word.senses[0]}/>);
  await act(async () => source.emit(['early']));
  await screen.findByRole('button', { name: 'Enlarge picture: early' });
  expect(screen.getByText(/Finding pictures/)).toBeVisible();
  await act(async () => source.emit(['late-strong', 'early']));
  expect([...view.container.querySelectorAll('.gallery-grid img')].map(img => img.getAttribute('alt'))).toEqual(['early', 'late-strong']);
  const cat = byId.get('猫')!; view.rerender(<VisualGallery word={cat} sense={cat.senses[0]}/>);
  await act(async () => other.emit(['new-cat'], true));
  await act(async () => source.emit(['old-running'], true));
  await screen.findByRole('button', { name: 'Enlarge picture: new-cat' });
  expect(screen.queryByRole('button', { name: 'Enlarge picture: old-running' })).not.toBeInTheDocument();
});
