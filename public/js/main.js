// Fungsi untuk memuat produk dari API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Fungsi untuk menampilkan produk di halaman
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">Tidak ada produk tersedia</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : 'Gambar Produk'}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p class="product-stock">Stok: ${product.stock}</p>
                <button class="btn-primary" onclick="addToCart('${product._id}')">
                    Tambah ke Keranjang
                </button>
            </div>
        </div>
    `).join('');
}

// Fungsi untuk menambahkan produk ke keranjang
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produk berhasil ditambahkan ke keranjang!');
}

// Fungsi untuk scroll ke bagian produk
function scrollToProducts() {
    document.getElementById('produk').scrollIntoView({
        behavior: 'smooth'
    });
}

// Event listener untuk memuat produk saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});