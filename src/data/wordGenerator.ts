import { JapaneseWord } from '../types/interfaces';
import { openDatabase, SQLiteDatabase } from './database';
import { JLPTLevels, DBFields } from '../types/types';

/**
 * Generates a SQL query to fetch a random word from the database based on the specified columns and optional filters.
 * @param fields 
 * @param filters 
 * @returns 
 */
function getQuery(fields: string[], filters: string[]|null = null) {
    return `
        SELECT ${fields.join(', ')}
        FROM words
        ${filters?.length && (
            'WHERE ' + filters.join(' AND ')
        ) || ''}
        ORDER BY RANDOM() LIMIT 1;
    `;
}

/**
 * Fetches a random word from the database based on the specified category and level. If no words match the criteria, it will return a completely random word from the database.
 * @param category 
 * @param level 
 * @returns 
 */
export async function getRandomWord(
    category: number = 0,
    level: number = 0
): Promise<JapaneseWord|undefined> {
    const filters = [];
    if (category > 0) {
        filters.push(`category = ${category}`);
    }
    if (level === 0) {
        // Get a random level not including the "all" level at position 0
        level = Math.floor( Math.random() * (JLPTLevels.length - 1) ) + 1;
    }
    filters.push(`level = ${level}`);
    const fields = Object.values(DBFields);
    const db: SQLiteDatabase = await openDatabase(level);
    let res = await db.query(getQuery(fields, filters));
    // If no matches, return random word
    if (!res.length) {
        res = await db.query(getQuery(fields));
        if (!res.length) {
            return;
        }
    }
    const values = res[0];
    const word: { [key: string]: any } = {};
    fields.forEach((key, i) => {
        word[key] = values[i];
    });

    db.close();
    return word as JapaneseWord;
}

