document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path === '/') {
        loadProducts();
        initializeCartInteractions();
    } else if (path === '/admin') {
        // ... fungsi admin tetap sama
        loadAdminData();
    } else if (path === '/checkout') {
        // ... fungsi checkout tetap sama
        loadCheckoutSummary();
    }
    updateCartCount();
});

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === FUNGSI HALAMAN UTAMA (Diperbarui) ===
async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <div class="product-image-container">
                        <img src="${product.imageUrl}" alt="${product.name}">
                        <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.imageUrl}')">
                            <i class="fas fa-shopping-bag"></i> Tambah ke Keranjang
                        </button>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            `;
            productList.innerHTML += productCard;
        });
    } catch (error) {
        console.error('Gagal memuat produk:', error);
    }
}

function addToCart(id, name, price, imageUrl) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1, imageUrl });
    }
    updateCartDisplay();
    showCartPopup();
}

function updateCartDisplay() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartPopup();
    updateCartCount();
}

function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function initializeCartInteractions() {
    const cartIcon = document.getElementById('cart-icon');
    const closeBtn = document.getElementById('close-cart-popup');
    const overlay = document.getElementById('cart-overlay');

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah pindah halaman langsung
            showCartPopup();
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', hideCartPopup);
    if (overlay) overlay.addEventListener('click', hideCartPopup);
}

function showCartPopup() {
    const popup = document.getElementById('cart-popup');
    const overlay = document.getElementById('cart-overlay');
    if (popup) popup.classList.add('active');
    if (overlay) overlay.classList.add('active');
    updateCartPopup();
}

function hideCartPopup() {
    const popup = document.getElementById('cart-popup');
    const overlay = document.getElementById('cart-overlay');
    if (popup) popup.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function updateCartPopup() {
    const cartBody = document.getElementById('cart-popup-body');
    const cartTotalEl = document.getElementById('cart-total');
    if (!cartBody || !cartTotalEl) return;

    if (cart.length === 0) {
        cartBody.innerHTML = '<p class="empty-cart">Keranjang Anda kosong.</p>';
        cartTotalEl.textContent = '0';
        return;
    }

    let total = 0;
    cartBody.innerHTML = '';
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartBody.innerHTML += `
            <div class="cart-popup-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                    <div class="quantity-control">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
    });

    cartTotalEl.textContent = total.toLocaleString('id-ID');
}

function changeQuantity(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}


// === FUNGSI LAINNYA (TIDAK BERUBAH) ===
// ... (Salin semua fungsi untuk halaman admin dan checkout dari kode sebelumnya)

// (Tempelkan fungsi loadAdminData, loadAdminProducts, updateStock, deleteProduct, dll. di sini)
// (Tempelkan fungsi loadCheckoutSummary, handleCheckout di sini)

// Letakkan semua fungsi lama untuk admin dan checkout di bawah ini agar tetap berfungsi.