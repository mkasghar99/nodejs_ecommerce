// ...
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
// Create a "users" table for user registration
db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
  });
  
  // ...
  