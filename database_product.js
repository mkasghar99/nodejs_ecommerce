// Create a file named "database.js"
//this s
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  // Create a "products" table with an id, name, and price column
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      price REAL
    )
  `);
  
  // Insert some example products
  const products = [
    { name: 'Product 1', price: 10.99 },
    { name: 'Product 2', price: 19.99 },
    { name: 'Product 3', price: 5.99 }
  ];

  const insert = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
  for (const product of products) {
    insert.run(product.name, product.price);
  }
  insert.finalize();
});

db.close();
