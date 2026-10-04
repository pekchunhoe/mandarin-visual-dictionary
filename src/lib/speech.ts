export function speakMandarin(text: string, onEnd: () => void, synth = window.speechSynthesis) {
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') throw new Error('Pronunciation is not supported in this browser.');
  synth.cancel();
  const voice = synth.getVoices().find(v => /^zh[-_]CN/i.test(v.lang)) ?? synth.getVoices().find(v => /^zh|cmn/i.test(v.lang));
  if (!voice) throw new Error('A Mandarin voice is not installed. Add a Chinese voice in your device’s speech settings.');
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'zh-CN'; utterance.voice = voice; utterance.rate = 0.8;
  utterance.onend = onEnd; utterance.onerror = onEnd; synth.speak(utterance);
  return () => synth.cancel();
}
