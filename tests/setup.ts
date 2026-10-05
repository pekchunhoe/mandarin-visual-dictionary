import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { clearBrowserImageCache } from '../src/lib/images';
// No automated test may reach a live image service. Individual tests override
// this default with explicit provider fixtures when exercising network behavior.
beforeEach(() => { vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ results: [] }) } as Response); });
afterEach(() => { cleanup(); clearBrowserImageCache(); vi.restoreAllMocks(); });
