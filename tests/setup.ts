import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { clearBrowserImageCache } from '../src/lib/images';
afterEach(() => { cleanup(); clearBrowserImageCache(); vi.restoreAllMocks(); });
