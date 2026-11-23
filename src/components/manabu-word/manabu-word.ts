import { getRandomWord } from '../../data/wordGenerator';
import { getData, subscribe, toggleBookmark, isBookmarked } from '../../utils/storage/storage';
import { JapaneseWord, StoredData } from '../../types/interfaces';
import { JLPTLevels, Categories } from '../../types/types';
import { getVoices, speakText } from '../../utils/voice';
import { DEFAULT_LANG } from '../../types/conf';
import Component from '../Component';
import template from './manabu-word-template';
import { kanaToRomaji } from '../../utils/kana';

export default class ManabuWord extends Component {
    private word: JapaneseWord | undefined;
    private isBookmarked: boolean = false;

    async connectedCallback() {
        super.connectedCallback();
        this.loadTemplateFunc(template);
        await this.loadNewWord();
        this.setupEventListeners();
    }

    async loadNewWord() {
        const data = await getData();
        this.word = await getRandomWord(data.category, data.level);
        if (this.word) {
            this.isBookmarked = await isBookmarked(this.word.id);
        }
        this.render();
    }

    async toggleBookmark() {
        if (this.word) {
            this.isBookmarked = await toggleBookmark(this.word.id);
            this.render();
        }
    }

    async render() {
        const data = await getData();
        const voices = await getVoices(DEFAULT_LANG);
        let romaji = '';
        if (this.word && this.word.category !== Categories.indexOf('kanji')) {
            romaji = kanaToRomaji(this.word.furigana || this.word.word);
        }
        super.render({
            ...data,
            word: {
                ...this.word,
                sanitized: this.word?.word.replace(/[〜（）]/g, ''),
                romaji
            },
            isBookmarked: this.isBookmarked,
            categories: Categories,
            JLPTLevels: JLPTLevels,
            hasVoices: !!voices.length
        });
    }

    subscribeTo(topic: keyof StoredData, callback: Function) {
        subscribe((data: Partial<StoredData>, cb: Function) => cb(data[topic], callback));
    }

    setupEventListeners() {
        this.subscribeTo('category', () => this.loadNewWord());
        this.subscribeTo('level', () => this.loadNewWord());
        this.subscribeTo('furigana', () => this.render());
        this.subscribeTo('romaji', () => this.render());
        this.subscribeTo('description', () => this.render());
        this.subscribeTo('examples', () => this.render());
    }

    async speak(_: Event, text: string) {
        const data = await getData();
        speakText(text, data.voice);
    }
}

customElements.define('manabu-word', ManabuWord);
