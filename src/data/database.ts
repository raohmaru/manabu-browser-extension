import sqlite3InitModule, { Sqlite3Static, Database } from '@sqlite.org/sqlite-wasm';

/**
 * 
 */
export class SQLiteDatabase {
    private db: Database | undefined;
    private level: Number;

    constructor(level: Number) {
        this.level = level;
    }

    /**
     * Opens a SQLite database file corresponding to the specified JLPT level. The database is fetched from the `data/vocab` directory and loaded into memory using the SQLite WASM module.
     * @param sqlite3 
     * @returns 
     */
    async open(sqlite3: Sqlite3Static) {
        console.log('Running SQLite3 version', sqlite3.version.libVersion);
        return fetch(`data/vocab/n${this.level}.sqlite3`)
            .then(res => res.arrayBuffer())
            .then((arrayBuffer) => {
                // https://sqlite.org/wasm/doc/trunk/cookbook.md
                const p = sqlite3.wasm.allocFromTypedArray(arrayBuffer);
                this.db = new sqlite3.oo1.DB();
                const rc = sqlite3.capi.sqlite3_deserialize(
                    this.db.pointer!,
                    'main',
                    p,
                    arrayBuffer.byteLength,
                    arrayBuffer.byteLength,
                    sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
                );
                this.db.checkRc(rc);
            });
    };

    /**
     * Executes a SQL query on the opened SQLite database and returns the result as an array of rows. Each row is represented as an array of strings or numbers. If the database is not open, it resolves to an empty array.
     * @param sql - SQL query
     * @returns 
     */
    query(sql: string): Promise<Array<Array<string|number>>> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return resolve([]);
            }
            const resultRows: [] = [];
            try {
                this.db.exec({
                    sql,
                    resultRows
                });
            } catch(err) {
                reject(err);
            } finally {
                resolve(resultRows);
            }
        });
    }

    /**
     * Closes the SQLite database and releases any associated resources. If the database is not open, this method does nothing.
     */
    close() {
        if (this.db) {
            this.db.close();
            delete this.db;
        }
    }
}

/**
 * Opens a SQLite database corresponding to the specified JLPT level. It initializes the SQLite WASM module, fetches the appropriate database file, and returns an instance of `SQLiteDatabase` that can be used to query the database.
 * @param level JLPT level
 * @returns 
 */
export async function openDatabase(level: Number): Promise<SQLiteDatabase> {
    return new Promise(async (resolve) => {
        // Silent logs
        globalThis.sqlite3ApiConfig = {
            warn: () => {},
            error: () => {},
            debug: () => {},
            log: () => {}
        };
        const sqlite3 = await sqlite3InitModule();
        try {
            const db = new SQLiteDatabase(level);
            await db.open(sqlite3);
            // const res = await db.query(`
            //     SELECT COUNT(word)
            //     FROM words
            // `);
            // console.log(`Database loaded with ${res} words`);
            resolve(db);
        } catch (err: any) {
            console.error(err.name, err.message);
        }
    });
}
