const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.join(__dirname, "mozapi.db");

const db = new DatabaseSync(dbPath);

db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
`);

console.log("SQLite Ligado:", dbPath);

module.exports = db;
