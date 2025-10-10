const kanaMap: Record<string, string> = {
    // Hiragana to romaji mapping
    // Basic vowels
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',

    // K-row
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',

    // G-row
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',

    // S-row
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',

    // Z-row
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',

    // T-row
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',

    // D-row
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo',

    // N-row
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',

    // H-row
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',

    // B-row
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',

    // P-row
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',

    // M-row
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',

    // Y-row
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',

    // R-row
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',

    // W-row
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',

    // Small characters
    'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ゎ': 'wa',

    // Katakana to romaji mapping
    // Basic vowels
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',

    // K-row
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',

    // G-row
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',

    // S-row
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',

    // Z-row
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',

    // T-row
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',

    // D-row
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'ヂャ': 'ja', 'ヂュ': 'ju', 'ヂョ': 'jo',

    // N-row
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',

    // H-row
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',

    // B-row
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',

    // P-row
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
    'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',

    // M-row
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',

    // Y-row
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',

    // R-row
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',

    // W-row
    'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n',

    // Small characters
    'ァ': 'a', 'ィ': 'i', 'ゥ': 'u', 'ェ': 'e', 'ォ': 'o',
    'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo', 'ヮ': 'wa',

    // Extended katakana (for foreign words)
    'ヴ': 'vu',
    'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo',
    'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
    'ティ': 'ti', 'ディ': 'di',
    'トゥ': 'tu', 'ドゥ': 'du',
    'シェ': 'she', 'ジェ': 'je', 'チェ': 'che',
    'ツァ': 'tsa', 'ツィ': 'tsi', 'ツェ': 'tse', 'ツォ': 'tso',
};

const vowels = ['a', 'i', 'u', 'e', 'o'];

/**
 * Converts a string in Japanese hiragana or katakana writing to romaji.
 * @param kana - String in hiragana or katakana
 * @returns The string converted to romaji
 */
export function kanaToRomaji(kana: string): string {
    if (!kana) {
        return '';
    }
    let result = '';
    let i = 0;
    while (i < kana.length) {
        const char = kana[i];
        // Check for small tsu (っ/ッ) - doubles the next consonant
        if (char === 'っ' || char === 'ッ') {
            // Look ahead to get the next character's first consonant
            if (i + 1 < kana.length) {
                const nextChar = kana[i + 1];
                const romaji = kanaMap[nextChar];
                if (romaji) {
                    // Double the first consonant
                    result += romaji[0];
                }
            }
            i++;
            continue;
        }
        // Check for long vowel marker (ー)
        if (char === 'ー') {
            // Repeat the previous vowel
            if (result.length > 0) {
                const lastChar = result[result.length - 1];
                if (vowels.includes(lastChar)) {
                    result += lastChar;
                }
            }
            i++;
            continue;
        }
        // Try to match 2-character combinations first (like きゃ, シャ, etc.)
        if (i + 1 < kana.length) {
            const twoChar = kana.substring(i, i + 2);
            if (kanaMap[twoChar]) {
                result += kanaMap[twoChar];
                i += 2;
                continue;
            }
        }
        // Try single character
        if (kanaMap[char]) {
            result += kanaMap[char];
        } else {
            // If not found in map, keep the original character
            result += char;
        }
        i++;
    }
    return result;
}
