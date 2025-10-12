import { STORAGE_KEY } from './types/conf';
import { StoredData } from './types/interfaces';
import { setTheme } from './utils/theme';

if (window.chrome?.storage) {
    (async function() {
        const data: Partial<{manabuExtension: StoredData} | undefined> = await chrome.storage.local.get(STORAGE_KEY);
        setTheme(data?.[STORAGE_KEY]?.theme);
    })();
} else {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
        try {
            const data = JSON.parse(rawData);
            setTheme(data.theme);
        } catch(err) { }
    }
}
