let cachedVoices :SpeechSynthesisVoice[];

/**
 * Fetches the available speech synthesis voices for a given language.
 * @param lang The language code for which to fetch voices (e.g., "en-US").
 * @returns A promise that resolves to an array of SpeechSynthesisVoice objects matching the specified language.
 */
export async function getVoices(lang: string): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
        if (typeof window.speechSynthesis === "undefined") {
            resolve([]);
        }
        if (!cachedVoices) {
            // Fetch voices and filter by language
            window.speechSynthesis.onvoiceschanged = function() {
                cachedVoices = filterVoicesByLang(window.speechSynthesis.getVoices(), lang);
                resolve(cachedVoices);
            };
            return;
        }
        resolve(cachedVoices);
    });
}

/**
 * Filters the provided list of voices to include only those that match the specified language.
 * @param voices 
 * @param lang 
 * @returns An array of SpeechSynthesisVoice objects that match the specified language.
 */
function filterVoicesByLang(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice[] {
    return voices.filter((voice :SpeechSynthesisVoice) => {
        return voice.lang === lang;
    });
}

// https://eeejay.github.io/webspeechdemos/
/**
 * Speaks the provided text using the specified voice ID.
 * @param text 
 * @param voiceID 
 */
export function speakText(text: string, voiceID: number) {
    if ('speechSynthesis' in window) {
        const voice = cachedVoices[voiceID];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang; // Android Chrome required?
        utterance.volume = 1; // 0 ~ 1
        utterance.pitch = 1; // 0 ~ 2
        utterance.rate = 1; // 0.1 ~ 10
        speechSynthesis.speak(utterance);
    } else {
        console.warn('Speech synthesis not supported');
    }
}
