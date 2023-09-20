const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const ejs = require('ejs');
const cookieParser = require('cookie-parser'); // Import cookie-parser


const app = express();
const port = 3000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up cookie-parser middleware
app.use(cookieParser());

// Define a middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  const user = req.cookies.user;
  if (!user) {
    return res.redirect('/login');
  }
  next();
}

// Create a database connection
const db = new sqlite3.Database('database.db');

// Define a route to retrieve and display products
app.get('/admin/products', isAuthenticated, (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Render the "products.ejs" template and pass the products data
    res.render('admin/products', { products: rows });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



// Define a route to display the edit form for a product
// Example: place middleware to check authentication to admin/private routes
app.get('/admin/products/edit/:id', isAuthenticated, (req, res) => {
  const productId = req.params.id;
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('admin/edit-product', { product: row });
  });
});

// Define a route to update a product
app.post('/admin/products/edit/:id', isAuthenticated, (req, res) => {
  const productId = req.params.id;
  const { name, price } = req.body;
  db.run('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, productId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/admin/products');
  });
});

// Define a route to delete a product
app.get('/admin/products/delete/:id', isAuthenticated, (req, res) => {
  const productId = req.params.id;
  db.run('DELETE FROM products WHERE id = ?', [productId], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/admin/products');
  });
});



// Define a route to display the form for adding a new product
app.get('/admin/products/new', isAuthenticated, (req, res) => {
  res.render('admin/new-product');
});

// Define a route to insert a new product
app.post('/admin/products/new', isAuthenticated, (req, res) => {
  const { name, price } = req.body;
  db.run('INSERT INTO products (name, price) VALUES (?, ?)', [name, price], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/admin/products');
  });
});

// Define a route to display the registration form
app.get('/register', (req, res) => {
  res.render('registration');
});

// Define a route to handle user registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  // Validate and insert the user into the "users" table
  // You should hash the password before storing it in the database for security.
  // You can use libraries like bcrypt for password hashing.
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/login');
  });
});

// Define a route to display the login form
app.get('/login', (req, res) => {
  res.render('login');
});

// Define a route to handle user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Query the user from the "users" table and check the password
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // For a real application, you should use sessions or JWT for authentication.
    // Here, we'll just set a simple cookie to indicate a logged-in user.
    res.cookie('user', username);
    res.redirect('/admin/products');
  });
});


// Define a public route to display products to everyone
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('public-products', { products: rows });
  });
});

// Define a route for logging out
app.get('/logout', (req, res) => {
  // Clear the user's session or remove relevant cookies
  res.clearCookie('user');
  res.redirect('/login'); // Redirect to the login page after logging out
});