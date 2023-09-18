const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const ejs = require('ejs');

const app = express();
const port = 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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



// Define a route to display the edit form for a product
app.get('/products/edit/:id', (req, res) => {
  const productId = req.params.id;
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('edit-product', { product: row });
  });
});

// Define a route to update a product
app.post('/products/edit/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price } = req.body;
  db.run('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, productId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/products');
  });
});

// Define a route to delete a product
app.get('/products/delete/:id', (req, res) => {
  const productId = req.params.id;
  db.run('DELETE FROM products WHERE id = ?', [productId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/products');
  });
});



// Define a route to display the form for adding a new product
app.get('/products/new', (req, res) => {
  res.render('new-product');
});

// Define a route to insert a new product
app.post('/products/new', (req, res) => {
  const { name, price } = req.body;
  db.run('INSERT INTO products (name, price) VALUES (?, ?)', [name, price], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/products');
  });
});
