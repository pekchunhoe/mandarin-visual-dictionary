import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Attribution } from '../src/components/VisualGallery';
import { normalizeOpenverse } from '../server/providers';

it('renders title, creator, source and license links in the existing caption; treats attribution as text', () => {
  const photo = normalizeOpenverse([{ id: 'test', title: 'Apple fruit', creator: 'A Creator', creator_url: 'https://example.com/creator', url: 'https://example.com/apple.jpg', foreign_landing_url: 'https://example.com/apple', width: 900, height: 600, source: 'flickr', license: 'by-sa', license_version: '4.0', license_url: 'https://creativecommons.org/licenses/by-sa/4.0/', attribution: '<script>untrusted()</script>' }], 'apple fruit')[0];
  const view = render(<figure><Attribution photo={photo}/></figure>);
  expect(screen.getByRole('link', { name: 'Apple fruit' })).toHaveAttribute('href', photo.sourceUrl);
  expect(screen.getByRole('link', { name: 'A Creator' })).toHaveAttribute('href', photo.photographerUrl);
  expect(screen.getByRole('link', { name: 'Openverse / flickr' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', photo.licenseUrl);
  expect(view.container.querySelector('script')).toBeNull();
  expect(screen.queryByText(/public domain/i)).not.toBeInTheDocument();
});
