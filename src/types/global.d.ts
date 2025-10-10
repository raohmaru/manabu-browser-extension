export { };

declare global {
    var sqlite3ApiConfig: {
        warn?: () => void;
        error?: () => void;
        debug?: () => void;
        log?: () => void;
    };
}
