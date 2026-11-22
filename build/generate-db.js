import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { distDir, srcDir } from './config.js';
import { join, dirname } from 'node:path';
import { Categories, JLPTLevels, DBFields } from '../src/types/enums.js';
import fs from 'node:fs';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import csv from 'csv-parser';

async function start() {
    console.log('[DB] Running SQLite3 version', sqlite3.version.libVersion);

    const vocabDir = join(srcDir, 'data', 'vocab');
    let dirs = readdirSync(vocabDir);
    let id = 1;  // Term ID
    // Get folders by level
    for (const dir of dirs) {
        const fullPath = join(vocabDir, dir);
        if (statSync(fullPath).isDirectory()) {
            console.log('\n[DB] Processing CSV files in', fullPath);
            const files = fs.globSync(join(fullPath, '*.csv'));
            const levelData = [];
            for (let i = 0; i < files.length; i++) {
                const filename = files[i];
                console.log('[DB] Reading rows from', filename);
                const rows = await readCSV(filename);
                const records = await createDatabase({
                    data: rows,
                    // filename.replace(/\.\w+$/, '.sqlite3'),
                    id
                });
                console.log(`     ${records.length} rows`);
                levelData.push(...records);
            }
            // Merge all databases of the same level
            console.log(`[DB] Creating ${dir.toUpperCase()} database`);
            await createDatabase({
                data: levelData,
                filename: join(distDir, 'data', 'vocab', `${dir}.sqlite3`)
            });
        }
    }
}

async function readCSV(filename) {
    return new Promise((resolve) => {
        const results = [];
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results));
    });
}

async function createDatabase({data, filename, id}) {
    return new Promise((resolve) => {
        const db = new sqlite3.oo1.DB(':memory:', 'c');
        const numRecords = [];
        const records = [];
        let count = 0;
        try {
            let stmt;
            if (filename) {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS words (
                        id INTEGER,
                        word TEXT NOT NULL,
                        furigana TEXT,
                        translation TEXT NOT NULL,
                        category INTEGER NOT NULL,
                        level INTEGER NOT NULL,
                        description TEXT,
                        example TEXT,
                        example_translation TEXT,
                        onyomi TEXT,
                        kunyomi TEXT
                    );
                    --VACUUM;
                `);
                // Prepare statement to insert words
                stmt = db.prepare(`
                    INSERT INTO words (${DBFields.join(', ')})
                    VALUES (${Array(DBFields.length).fill('?').join(', ')})
                `);
            }
            for (let i = 0; i < data.length; i++) {
                let arr = data[i];
                if (id) {
                    arr = DBFields.map((field) => data[i][field]);
                    arr[0] = id++; // Push ID to first position
                    arr[4] = Categories.indexOf(arr[4]);  // String category to number
                    arr[5] = JLPTLevels.indexOf(arr[5]);  // String level to number
                }
                if (filename) {
                    stmt.bind(arr);
                    stmt.stepReset();
                }
                count++;
                records.push(arr);
            }
            if (!filename) {
                resolve(records);
                return;
            }
            stmt.finalize();
            db.exec({
                sql: `
                    SELECT COUNT(word)
                    FROM words
                `,
                resultRows: numRecords
            });
        } catch(err) {
            console.log(err);
        } finally {
            // Save into file system
            const distFile = filename
                .replace(srcDir, distDir);
            mkdirSync(dirname(distFile), { recursive: true });

            const byteArray = sqlite3.capi.sqlite3_js_db_export(db);
            writeFileSync(distFile, Buffer.from(byteArray));

            db.close();
            console.log(`[DB] Inserted ${numRecords[0]} records in the database out of ${count} entries from the CSV data`);
            console.log(`[DB] Database created in ${distFile}`);
            resolve(records);
        }
    });
};

const sqlite3 = await sqlite3InitModule({
    print: console.log,
    printErr: console.error,
});
try {
    start();
} catch (err) {
    console.error(err.name, err.message);
}
