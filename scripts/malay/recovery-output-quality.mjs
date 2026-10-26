import { qualityIssues } from './quality.mjs';
import { normalizeMalay } from '../../src/lib/malay-search.ts';
export function recoveryOutputQuality(text,sense,{approvedReferenceTerms=[]}={}) {
 const record={...sense,malay:text,translationSource:'Controlled offline evaluation',translationVersion:'recovery-1',translationLicense:'Apache-2.0',translationStatus:'generated',translationConfidence:0.5,idiomExplanation:sense.idiom};
 const flags=qualityIssues(record,sense);
 const exactReference=approvedReferenceTerms.some(t=>normalizeMalay(t)===normalizeMalay(text));
 const hardErrors=flags.filter(f=>!(f==='english-copy'&&exactReference));
 if(!text.trim()||/\[REVIEW_REQUIRED\]|<think>|<\/think>|```|\p{Script=Cyrillic}|\p{Script=Arabic}/u.test(text))hardErrors.push('invalid-or-abstaining-output');
 const reviewFlags=[];
 if(flags.includes('english-copy')&&exactReference)reviewFlags.push('same-text-supported-by-exact-reference-still-needs-human-review');
 if(sense.idiom||sense.category==='idiom')reviewFlags.push('figurative-fidelity-requires-review');
 return {hardErrors:[...new Set(hardErrors)],reviewFlags,semanticVerified:false,naturalnessVerified:false};
}
