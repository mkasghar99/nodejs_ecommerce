const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const ejs = require('ejs');

const app = express();
const port = 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Create a database connection
const db = new sqlite3.Database('database.db');

// Define a route to retrieve and display products
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Render the "products.ejs" template and pass the products data
    res.render('products', { products: rows });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
