export interface StorageInterface {
    get(): Promise<any>;
    set(value: any): Promise<void>;
}

export interface StoredData {
    bookmarks: number[];
    theme: number;
    category: number;
    level: number;
    furigana: boolean;
    romaji: boolean;
    description: boolean;
    examples: boolean;
    voice: number;
}

export interface JapaneseWord {
    id: number,
    word: string;
    furigana: string;
    translation: string;
    category: number;
    level: number;
    description: string;
    example: string;
    example_translation: string;
    onyomi: string;
    kunyomi: string;
}
