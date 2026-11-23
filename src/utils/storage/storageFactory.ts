import { ChromeStorage } from './ChromeStorage';
import { LocalStorage } from './LocalStorage';
import { StorageInterface } from '../../types/interfaces';

/**
 * Creates an instance of StorageInterface based on the environment (Chrome extension or local storage).
 * @param key The storage key to use for storing data.
 * @returns 
 */
export function storageFactory(key: string): StorageInterface {
    const isChromeExtension = window.chrome?.storage;
    if (isChromeExtension) {
        return new ChromeStorage(key);
    } else {
        return new LocalStorage(key);
    }
}
