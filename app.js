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


// Define a public route to display paginated products to everyone
app.get('/products', (req, res) => {
  const page = req.query.page || 1; // Get the page parameter from the URL or default to page 1
  const productsPerPage = 2; // Set the number of products to display per page

  db.all('SELECT * FROM products', (err, allProducts) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Calculate the range of products to display for the current page
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const products = allProducts.slice(startIndex, endIndex);

    // Calculate the total number of pages
    const totalPages = Math.ceil(allProducts.length / productsPerPage);

    res.render('public-products', { products, totalPages, currentPage: parseInt(page) });
  });
});


// Define a route for logging out
app.get('/logout', (req, res) => {
  // Clear the user's session or remove relevant cookies
  res.clearCookie('user');
  res.redirect('/login'); // Redirect to the login page after logging out
});


// Initialize an empty shopping cart array
const shoppingCart = [];

// Helper function to find a product by its ID
function findProductById(id) {
  return shoppingCart.find(item => item.id === id);
}

// Define a route to display the shopping cart
app.get('/cart', (req, res) => {
  res.render('cart', { cart: shoppingCart });
});

// Define a route to add a product to the shopping cart
app.post('/cart/add/:id', (req, res) => {
  const productId = req.params.id;

  // Query the product by ID
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (product) {
      // Check if the product is already in the shopping cart
      const existingProduct = findProductById(product.id);

      if (existingProduct) {
        // If the product is already in the cart, increase its quantity
        existingProduct.quantity += 1;
      } else {
        // If the product is not in the cart, add it with a quantity of 1
        product.quantity = 1;
        shoppingCart.push(product);
      }
    }

    res.redirect('/products'); // Redirect to the product listing page
  });
});

// Define a route to remove a product from the shopping cart
app.post('/cart/remove/:id', (req, res) => {
  const productId = req.params.id;

  // Find the index of the product in the shopping cart
  const index = shoppingCart.findIndex(item => item.id.toString() === productId.toString());

  if (index !== -1) {
    // Remove the product from the cart
    shoppingCart.splice(index, 1);
  } 

  res.redirect('/cart'); // Redirect to the shopping cart page
});