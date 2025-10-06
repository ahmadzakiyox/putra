require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/toko_online', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Terhubung ke MongoDB'))
.catch(err => console.error('Kesalahan koneksi MongoDB:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diizinkan!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Model Database
const Product = require('./models/product');
const Order = require('./models/order');
const User = require('./models/user');

// Routes untuk halaman
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/callback', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'callback.html'));
});

// API Routes - Produk
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category
    };

    // Jika ada file gambar yang diupload
    if (req.file) {
      productData.image = '/uploads/' + req.file.filename;
    } else {
      productData.image = '/images/default-product.jpg';
    }

    const product = new Product(productData);
    await product.save();
    
    res.json({ 
      message: 'Produk berhasil ditambahkan', 
      product 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category
    };

    // Jika ada file gambar baru yang diupload
    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
      
      // Hapus gambar lama jika ada
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct.image && oldProduct.image !== '/images/default-product.jpg') {
        const oldImagePath = path.join(__dirname, oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    res.json({ 
      message: 'Produk berhasil diupdate', 
      product 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Gagal mengupdate produk' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    // Hapus gambar jika ada
    if (product.image && product.image !== '/images/default-product.jpg') {
      const imagePath = path.join(__dirname, product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Gagal menghapus produk' });
  }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('products.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pesanan' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json({ message: 'Pesanan berhasil dibuat', order });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat pesanan' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Pesanan berhasil diupdate', order });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate pesanan' });
  }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Pengguna berhasil diupdate', user });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate pengguna' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
