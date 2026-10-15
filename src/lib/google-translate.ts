/** User-initiated website navigation only. No translation API or persistence. */
export function googleTranslateUrl(english: string): string {
  const url = new URL('https://translate.google.com/');
  url.search = new URLSearchParams({ sl: 'en', tl: 'ms', text: english, op: 'translate' }).toString();
  return url.href;
}
