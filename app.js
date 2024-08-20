const express = require('express');
const fs = require('fs');
const session = require('express-session');
const app = express();

// Set up EJS
app.set('view engine', 'ejs');

// Serve static files (CSS, Images, etc.)
app.use(express.static('public'));

// Set up session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Load watches data from JSON file
const watches = JSON.parse(fs.readFileSync('./data/watches.json', 'utf-8'));

// Routes

// Trang chủ
app.get('/', (req, res) => {
  const cart = req.session.cart || []; // Đảm bảo giỏ hàng luôn có giá trị
  res.render('index', { watches: watches, cart: cart });
});

// Trang chi tiết sản phẩm
app.get('/watch/:id', (req, res) => {
  const watch = watches.find(w => w.id === parseInt(req.params.id));
  const cart = req.session.cart || []; // Đảm bảo giỏ hàng luôn có giá trị
  res.render('watch', { watch: watch, cart: cart });
});

// Thêm sản phẩm vào giỏ hàng
app.post('/add-to-cart/:id', (req, res) => {
  const watchId = parseInt(req.params.id);
  const watch = watches.find(w => w.id === watchId);

  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart.push(watch);
  res.redirect('/cart');
});

// Trang giỏ hàng
app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  res.render('cart', { cart: cart });
});

// Tìm kiếm sản phẩm
app.get('/search', (req, res) => {
  const query = req.query.q.toLowerCase();
  const filteredWatches = watches.filter(watch => 
    watch.name.toLowerCase().includes(query) || 
    watch.description.toLowerCase().includes(query)
  );
  const cart = req.session.cart || [];
  res.render('index', { watches: filteredWatches, cart: cart });
});

// Lọc sản phẩm theo giá
app.get('/filter', (req, res) => {
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
  const filteredWatches = watches.filter(watch => 
    watch.price >= minPrice && watch.price <= maxPrice
  );
  const cart = req.session.cart || [];
  res.render('index', { watches: filteredWatches, cart: cart });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
