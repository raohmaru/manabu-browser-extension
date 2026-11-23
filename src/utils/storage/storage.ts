import { storageFactory } from './storageFactory';
import { StorageInterface, StoredData } from '../../types/interfaces';
import { STORAGE_KEY } from '../../types/conf';

const defaults: StoredData = {
    theme: 0,
    bookmarks: [],
    category: 0,
    level: 0,
    furigana: true,
    romaji: true,
    description: true,
    examples: true,
    voice: 0,
};

const storage: StorageInterface = storageFactory(STORAGE_KEY);
let cachedData: Partial<StoredData | undefined>;
const listeners: ((data: Partial<StoredData>, cb: Function) => void)[] = [];

/**
 * Gets the complete stored data, using cached values when available.
 * @returns The merged default and persisted stored data.
 */
export async function getData(): Promise<StoredData> {
    return new Promise(async (resolve) => {
        if (cachedData) {
            resolve(cachedData as StoredData);
        }
        const data = await storage.get() || {};
        cachedData = {
            ...defaults,
            ...data
        };
        resolve(cachedData as StoredData);
    });
}

/**
 * Updates the cached and persisted stored data.
 * @param data Partial stored values to merge.
 * @returns A promise that resolves after the data is persisted.
 */
async function setData(data: Partial<StoredData>): Promise<void> {
    return new Promise(async (resolve) => {
        cachedData = { ...cachedData, ...data };
        await storage.set(cachedData);
        resolve();
    });
}

/**
 * Toggles whether a word is bookmarked.
 * @param wordId The identifier of the word to toggle.
 * @returns Whether the word is now bookmarked.
 */
export async function toggleBookmark(wordId: number): Promise<boolean> {
    const data = await getData();
    const { bookmarks } = data;
    const index = bookmarks.indexOf(wordId);
    if (index > -1) {
        bookmarks.splice(index, 1);
        await setData({ bookmarks });
        return false;
    } else {
        bookmarks.push(wordId);
        await setData({ bookmarks });
        return true;
    }
}

/**
 * Checks whether a word is bookmarked.
 * @param wordId The identifier of the word to check.
 * @returns Whether the word is bookmarked.
 */
export async function isBookmarked(wordId: number): Promise<boolean> {
    const { bookmarks } = await getData();
    return bookmarks.includes(wordId);
}

/**
 * Gets a stored property value.
 * @template T The key of the stored data property.
 * @param key The property to retrieve.
 * @returns The stored value for the property.
 */
export async function getProp<T extends keyof StoredData>(key: T): Promise<StoredData[T]> {
    const data: StoredData = await getData();
    return data[key];
}

/**
 * Updates a stored property and notifies subscribers.
 * @param key The property to update.
 * @param value The new property value.
 * @returns A promise that resolves after the data is persisted.
 */
export async function setProp(key: string, value: any): Promise<void> {
    await setData({ [key]: value });
    listeners.forEach(listener => {
        const changed: Partial<StoredData> = {[key]: value};
        listener(changed, (value: any, cb: Function) => {
            if (typeof value !== 'undefined') {
                cb(value);
            }
        });
    });
}

/**
 * Subscribes to stored-data changes.
 * @param callback Function invoked when a property changes.
 * @returns A function that removes the subscription.
 */
export function subscribe(callback: (data: Partial<StoredData>, cb: Function) => void): () => void {
    listeners.push(callback);
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
}
