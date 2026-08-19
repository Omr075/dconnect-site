const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.join(__dirname, "mozapi.db");
const schemaPath = path.join(__dirname, "schema.sql");

const db = new DatabaseSync(dbPath);

db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
`);

const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

console.log("SQLite Ligado:", dbPath);

module.exports = db;
