# Japanese Word New Tab Chrome Extension - Implementation Details

## Project Overview

A Chrome Extension (Manifest V3) that displays random Japanese vocabulary words on new tabs. Built with vanilla TypeScript, Web Components, Tailwind CSS v4, and SQLite WASM for efficient offline vocabulary storage.

---

## Architecture

### Technology Stack
- **Language**: TypeScript (ES2022 modules)
- **UI Framework**: Vanilla Web Components (custom elements)
- **Styling**: Tailwind CSS v4 (PostCSS)
- **Data Storage**: SQLite WASM databases (one per JLPT level N1-N5)
- **Build Tools**: esbuild, PostCSS, custom Node.js build scripts
- **Storage API**: Chrome Storage API (extension context) with localStorage fallback
- **Speech**: Web Speech API (SpeechSynthesis)

### Project Structure
```
manabu-browser-extension/
├── manifest.json              # Chrome Extension Manifest V3
├── package.json               # npm dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── src/
│   ├── head.ts                # Early theme initialization (render-blocking script in <head>)
│   ├── main.ts                # Entry point (imports components)
│   ├── main.css               # Global styles & theme variables
│   ├── index.html             # New tab page template
│   ├── components/
│   │   ├── index.ts           # Barrel export (side-effect imports)
│   │   ├── Component.ts       # Base Web Component class
│   │   ├── manabu-word/       # Main word display component
│   │   ├── manabu-menu/       # Settings menu component
│   │   └── theme-toggle/      # Theme cycler component
│   ├── data/
│   │   ├── database.ts        # SQLite WASM wrapper
│   │   └── wordGenerator.ts   # Random word selection logic
│   ├── types/
│   │   ├── interfaces.ts      # TypeScript interfaces
│   │   ├── types.ts           # Type re-exports
│   │   ├── enums.js           # Category/JLPT/DB field enums (plain JS)
│   │   ├── enums.d.ts         # Type declarations for enums.js
│   │   └── conf.ts            # Constants (storage key, themes, lang)
│   ├── assets/                # Icons, patterns, play-sound.svg (source assets)
│   └── utils/
│       ├── storage/
│       │   ├── storage.ts         # High-level storage API
│       │   ├── storageFactory.ts  # Chrome/localStorage factory
│       │   ├── ChromeStorage.ts   # Chrome Storage implementation
│       │   └── LocalStorage.ts    # localStorage implementation
│       ├── theme.ts             # Theme class manipulation
│       ├── voice.ts             # Speech synthesis wrapper
│       ├── kana.ts              # Kana to romaji conversion
│       └── template.ts          # Micro-templating engine
├── build/
│   ├── config.js              # Build paths & esbuild config
│   ├── build.js               # JS bundling (esbuild)
│   ├── build-css.js           # CSS processing (PostCSS + Tailwind)
│   ├── copy-assets.js         # Asset copying to dist
│   ├── generate-db.js         # CSV → SQLite database generation
│   ├── inject-hotreload.js    # Injects live-reload client into index.html
│   └── serve.js               # Dev server with live reload
├── dist/                      # Built extension (generated)
```

---

## Core Implementation Details

### 1. Web Component Architecture

**Base Component (`src/components/Component.ts`)**
- Extends `HTMLElement` with open Shadow DOM
- Template system with `parseTemplate` / `bindEvents` utilities
- Supports inline `<template>` styles via `CSSStyleSheet` adoption
- Template functions receive data object, return HTML string
- Event binding via custom attributes (`:click="method(arg)"`) parsed by XPath

**Component Lifecycle**
```typescript
connectedCallback() {
  super.connectedCallback();
  this.loadTemplateFunc(template);  // Load template function
  await this.initialize();          // Async init (data loading)
  this.render();                    // Initial render
  this.setupEventListeners();       // Subscribe to storage changes
}
```

### 2. Data Layer - SQLite WASM

**Database Structure** (`src/data/database.ts`)
- One SQLite database per JLPT level (`n1.sqlite3` - `n5.sqlite3`)
- Databases loaded via `fetch()` → `ArrayBuffer` → `sqlite3_deserialize()`
- Tables: `words` with columns matching `JapaneseWord` interface
- `SQLiteDatabase` class wraps query/close operations

**Word Generator** (`src/data/wordGenerator.ts`)
- `getRandomWord(category, level)` - Main export
- SQL: `SELECT ... FROM words WHERE category=? AND level=? ORDER BY RANDOM() LIMIT 1`
- Falls back to unfiltered random if no matches
- Level 0 = random JLPT level (excludes "all" index 0)

**Build-time Database Generation** (`build/generate-db.js`)
- Reads CSV files from `src/data/vocab/{n1-n5}/*.csv`
- Converts to SQLite databases in `dist/data/vocab/`
- Maps string categories/levels to numeric indices
- Uses `@sqlite.org/sqlite-wasm` in Node.js

### 3. Storage System

**Dual Storage Strategy**
- `ChromeStorage` - Uses `chrome.storage.local` (async, persistent across sessions)
- `LocalStorage` - Fallback for non-extension contexts (dev/testing)
- `storageFactory()` auto-detects context via `window.chrome?.storage`

**Stored Data Schema** (`src/types/interfaces.ts`)
```typescript
interface StoredData {
  bookmarks: number[];    // Word IDs
  theme: number;          // 0=light, 1=noon, 2=dark
  category: number;       // Category index (0=all)
  level: number;          // JLPT level index (0=random)
  furigana: boolean;      // Show furigana
  romaji: boolean;        // Show romaji
  description: boolean;   // Show description
  examples: boolean;      // Show example sentences
  voice: number;          // Selected voice index
}
```

**Reactive Updates**
- `subscribe(callback)` - Register listener for storage changes
- `setProp(key, value)` - Updates storage + notifies all listeners
- Components subscribe in `setupEventListeners()` for live updates
---

### 4. Theming System

**Three Themes** (defined in `src/types/conf.ts`)
- `''` (empty) = Light (default)
- `'noon'` = Warm/sepia tone
- `'dark'` = Dark mode

**Implementation**
- CSS custom properties defined in `src/main.css` @layer theme
- `:root` = light, `.noon` = noon, `.dark` = dark
- `ThemeToggle` component cycles themes, persists to storage
- `head.ts` is bundled to an external `head.js` loaded synchronously in `<head>` (render-blocking) to apply the theme before the body renders
- `setTheme(idx)` / `removeTheme(idx)` manipulate `documentElement.classList`

### 5. Japanese Text Processing

**Kana → Romaji** (`src/utils/kana.ts`)
- Comprehensive hiragana/katakana mapping
- Handles: small tsu (っ/ッ → doubled consonant), long vowel (ー),
  digraphs (きゃ, シャ), extended katakana (ヴ, ファ, etc.)
- Used for romaji display when enabled

**Furigana Display**
- Stored in database `furigana` column
- Conditionally rendered based on `furigana` setting
- Kanji entries also show `onyomi` (katakana) / `kunyomi` (hiragana)

### 6. Speech Synthesis

**Voice Management** (`src/utils/voice.ts`)
- Filters `speechSynthesis.getVoices()` by `ja-JP` locale
- Caches voices; handles `onvoiceschanged` async loading
- `speakText(text, voiceIndex)` creates utterance with selected voice
- Exposed via speaker button on word component

### 7. Build System

**JavaScript** (`build/build.js`)
- esbuild: ESM format, ES2022 target, bundle=true
- Entry points: `head.ts` (classic script in `<head>`), `main.ts` (module)
- Dev mode: `--serve` flag starts WS server (port 3000) with live reload

**CSS** (`build/build-css.js`)
- PostCSS with `@tailwindcss/postcss` (Tailwind v4)
- Production: cssnano minification
- **Component CSS Injection**: In production, component CSS inlined into
  `<template>` elements in `index.html` for Shadow DOM adoption

**Assets** (`build/copy-assets.js`)
- Copies: HTML files, manifest.json, src/assets/, sqlite3.wasm
- (The `vocab/*.sqlite3` databases are generated by `generate-db.js`, not copied here)

**Database Generation** (`build/generate-db.js`)
- Runs concurrently with the CSS/JS builds via `concurrently` (`npm run build:db`)
- Processes CSV → SQLite per JLPT level
---

## Component Details

### manabu-word
- **Tag**: `<manabu-word>`
- **Features**:
  - Random word load on init & category/level change
  - Displays: word (large), furigana, romaji, onyomi/kunyomi, translation
  - Optional: description, example sentence + translation
  - Action buttons: Jisho.org, Kanshudo, Speaker (TTS)
  - Bookmark toggle (commented out in template)
  - Category badge (blue), JLPT level badge (green)
- **Subscriptions**: category, level, furigana, romaji, description, examples

### manabu-menu
- **Tag**: `<manabu-menu>`
- **Features**:
  - Slide-up panel with backdrop overlay
  - Hamburger menu button (top-right)
  - Category select (all + 16 categories)
  - JLPT level select (all levels + N1-N5)
  - Toggles: furigana, romaji, description, examples
  - Voice selector (available ja-JP voices)
- **Events**: `selectCategory`, `selectLevel`, `selectVoice`, `changeSetting`

### theme-toggle
- **Tag**: `<theme-toggle>`
- **Features**:
  - Single button (top-right) cycles: Light → Noon → Dark → Light
  - Icon via CSS `::after { content: var(--theme-icon) }`
  - Persists selection to storage
  - Hover preview of next theme color

---

## Data Flow

```
New Tab Open
    │
    ▼
index.html loads
    │
    ├─► head.js ──► chrome.storage.get ──► setTheme()
    │
    ▼
main.js (module) loads
    │
    ├─► imports components/index.ts
    │       ├─► manabu-word.ts  ──► customElements.define('manabu-word')
    │       ├─► manabu-menu.ts  ──► customElements.define('manabu-menu')
    │       └─► theme-toggle.ts ──► customElements.define('theme-toggle')
    │
    ▼
Components upgrade
    │
    ├─► manabu-word.connectedCallback()
    │       ├─► loadTemplateFunc()
    │       ├─► loadNewWord() ──► getData() ──► getRandomWord()
    │       └─► render()
    │
    ├─► manabu-menu.connectedCallback() ──► render()
    │
    └─► theme-toggle.connectedCallback() ──► loadSettings() ──► render()

User Interaction:
  Category/Level change ──► storage.setProp() ──► listeners ──► loadNewWord()
  Theme toggle ──► cycleTheme() ──► setTheme() + storage.setProp()
  Settings toggles ──► changeSetting() ──► storage.setProp() ──► re-render
```
---

## Key Implementation Guidelines

### 1. Code Organization
- **Single Responsibility**: Each component/file has one clear purpose
- **Barrel Exports**: `components/index.ts` uses side-effect imports for registration
- **Type Safety**: Strict TypeScript, interfaces in `types/interfaces.ts`
- **No External UI Libraries**: Pure Web Components + Tailwind utilities

### 2. Shadow DOM Styling
- Component styles in `.css` files co-located with component
- In production: CSS inlined into `<template>` in `index.html`
- Global theme variables via CSS custom properties on `:root`/`.noon`/`.dark`
- Components inherit theme vars via `@theme { --var: inherit }`

### 3. Async Data Loading
- All storage/database operations are Promise-based
- `getData()` caches result to avoid repeated storage calls
- Database connections opened per-query, closed immediately
- Word loading triggered reactively via storage subscriptions

### 4. Template System
- Custom micro-templating (`utils/template.ts`)
- `{{path.to.value}}` interpolation with dot notation
- `${expr}$` for inline JavaScript evaluation
- `:event="handler(args)"` for event binding
- XPath-based event binding in `bindEvents()`

### 5. Storage Persistence
- Defaults defined in `storage.ts` (merged with stored data)
- Bookmarks stored as array of word IDs (numbers)
- Theme/category/level stored as numeric indices
- Voice index stored for TTS selection

### 6. Performance Considerations
- SQLite databases loaded on-demand per JLPT level
- `head.ts` runs synchronously in `<head>` to prevent flash of wrong theme
- Component CSS inlined in production (no extra network requests)
- Voice list cached after first `speechSynthesis.onvoiceschanged`
- Word IDs are sequential integers (efficient storage)

### 7. Chrome Extension Specifics
- Manifest V3: `chrome_url_overrides.newtab = index.html`
- CSP: `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'` (for SQLite WASM)
- Permissions: `storage` only
- Icons: 16/48/128px PNG in assets/
- `dist/` folder is the loadable extension

### 8. Development Workflow
```bash
npm run dev          # Watch mode, rebuild on change
npm run dev:chrome   # Dev mode + extension context
npm run build        # Production build to dist/
npm run build:dist   # Production build (NODE_ENV=production)
```
- Dev server serves `dist/` with live reload via WebSocket
- `--extension` flag enables Chrome storage API in dev
---

## Data Schema Reference

### JapaneseWord Interface
```typescript
interface JapaneseWord {
  id: number;                    // Unique identifier
  word: string;                  // Kanji/kana representation
  furigana: string;              // Hiragana reading
  translation: string;           // English meaning
  category: number;              // Category index (see Categories enum)
  level: number;                 // JLPT level index (see JLPTLevels enum)
  description: string;           // Extended definition
  example: string;               // Japanese example sentence
  example_translation: string;   // English translation of example
  onyomi: string;                // Katakana onyomi (kanji only)
  kunyomi: string;               // Hiragana kunyomi (kanji only)
}
```

### Categories (17)
`['all words', 'adjective', 'adverb', 'conjunction', 'copula', 'counter', 'expression', 'interjection', 'interrogative', 'kanji', 'noun', 'number', 'particle', 'phrase', 'pronoun', 'suffix', 'verb']`

### JLPT Levels (6)
`['all levels', 'n1', 'n2', 'n3', 'n4', 'n5']`

---

## Extension Points / Future Enhancements

1. **Bookmark UI**: Template has commented bookmark button - needs implementation
2. **New Word Button**: Commented in template - could add manual refresh
3. **Statistics**: Track words viewed, mastered, review intervals
4. **Spaced Repetition**: Integrate SRS algorithm for learning
5. **Export/Import**: Backup bookmarks and settings
6. **Additional Languages**: Support for other target languages
7. **Offline Dictionary**: Full Jisho/Kanshudo data cached locally
8. **Keyboard Shortcuts**: Quick actions (new word, toggle theme, speak)

---

## Build Output (dist/)

```
dist/
├── manifest.json
├── index.html          # With inlined component CSS templates
├── head.js             # Early theme initialization (render-blocking)
├── main.js             # Bundled ES module
├── main.css            # Global styles
├── assets/             # Icons, patterns, play-sound.svg
├── data/
│   └── vocab/
│       ├── n1.sqlite3
│       ├── n2.sqlite3
│       ├── n3.sqlite3
│       ├── n4.sqlite3
│       └── n5.sqlite3
└── sqlite3.wasm        # SQLite WASM binary
```

---

## Testing Checklist

- [ ] New tab loads without errors
- [ ] Random word displays with furigana/romaji/translation
- [ ] Category filter changes word selection
- [ ] JLPT level filter changes word selection
- [ ] Theme toggle cycles Light → Noon → Dark → Light
- [ ] Theme persists across tab reloads
- [ ] Settings (furigana, romaji, etc.) persist and apply
- [ ] Voice selection works and speaks Japanese
- [ ] Jisho.org / Kanshudo links open correctly
- [ ] Bookmark toggle adds/removes from storage
- [ ] Responsive layout on different viewport sizes
- [ ] Extension loads in Chrome (Manifest V3)
- [ ] CSP allows SQLite WASM execution