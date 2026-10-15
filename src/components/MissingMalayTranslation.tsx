import { ExternalLink } from 'lucide-react';
import { googleTranslateUrl } from '../lib/google-translate';

export function MissingMalayTranslation({ english }: { english: string }) {
  return <div className="translation-help"><a className="text-button" href={googleTranslateUrl(english)} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Translate with Google <ExternalLink size={14} aria-hidden="true"/></a><small>Opens Google Translate in a new tab. The result is not saved to this dictionary.</small></div>;
}
