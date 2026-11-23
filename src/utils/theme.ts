import { THEME } from "../types/conf";

/**
 * Removes the theme class from the document's root element based on the provided index.
 * @param themeIdx 
 */
export function removeTheme(themeIdx: number | undefined) {
    if (themeIdx !== undefined && THEME[themeIdx]) {
        document.documentElement.classList.remove(THEME[themeIdx]);
    }
}

/**
 * Adds the theme class to the document's root element based on the provided index.
 * @param themeIdx 
 */
export function setTheme(themeIdx: number | undefined) {
    if (themeIdx !== undefined && THEME[themeIdx]) {
        document.documentElement.classList.add(THEME[themeIdx]);
    }
}
