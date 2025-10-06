// Variabel global
let currentEditingId = null;

// Event listener untuk tab navigation
document.addEventListener('DOMContentLoaded', function() {
    // Setup tab navigation
    setupTabNavigation();
    
    // Load initial data
    loadDashboardData();
    loadProductsData();
    loadOrdersData();
    loadUsersData();
    
    // Setup modal
    setupModal();
    
    // Setup form submission
    setupFormSubmission();
});

// Fungsi untuk setup tab navigation
function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const tabContents = document.querySelectorAll('.tab-content');
    const adminTitle = document.getElementById('adminTitle');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and contents
            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Update admin title
            adminTitle.textContent = this.textContent;
        });
    });
}

// Fungsi untuk memuat data dashboard
async function loadDashboardData() {
    try {
        const [products, orders, users] = await Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/orders').then(r => r.json()),
            fetch('/api/users').then(r => r.json())
        ]);
        
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalUsers').textContent = users.length;
        
        // Hitung total pendapatan
        const totalRevenue = orders
            .filter(order => order.paymentStatus === 'paid')
            .reduce((sum, order) => sum + order.totalAmount, 0);
        
        document.getElementById('totalRevenue').textContent = 
            `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Fungsi untuk memuat data produk
async function loadProductsData() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProductsTable(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Fungsi untuk menampilkan data produk di tabel
function displayProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada produk</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>Rp ${product.price.toLocaleString('id-ID')}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editProduct('${product._id}')">Edit</button>
                <button class="btn-delete" onclick="deleteProduct('${product._id}')">Hapus</button>
            </td>
        </tr>
    `).join('');
}

// Fungsi untuk memuat data pesanan
async function loadOrdersData() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        displayOrdersTable(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Fungsi untuk menampilkan data pesanan di tabel
function displayOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Tidak ada pesanan</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderNumber}</td>
            <td>${order.customer.name}</td>
            <td>Rp ${order.totalAmount.toLocaleString('id-ID')}</td>
            <td>
                <select onchange="updateOrderStatus('${order._id}', this.value)" class="status-badge status-${order.status}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="viewOrderDetails('${order._id}')">Detail</button>
            </td>
        </tr>
    `).join('');
}

// Fungsi untuk memuat data pengguna
async function loadUsersData() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        displayUsersTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Fungsi untuk menampilkan data pengguna di tabel
function displayUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada pengguna</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <select onchange="updateUserRole('${user._id}', this.value)">
                    <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editUser('${user._id}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

// Fungsi untuk setup modal
function setupModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    
    // Open modal for adding product
    addProductBtn.addEventListener('click', () => {
        currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Tambah Produk';
        document.getElementById('productForm').reset();
        modal.style.display = 'block';
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Fungsi untuk setup form submission
function setupFormSubmission() {
    const form = document.getElementById('productForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            category: document.getElementById('productCategory').value
        };
        
        try {
            let response;
            if (currentEditingId) {
                // Update existing product
                response = await fetch(`/api/products/${currentEditingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Add new product
                response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }
            
            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                document.getElementById('productModal').style.display = 'none';
                loadProductsData(); // Reload products table
                loadDashboardData(); // Update dashboard stats
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Terjadi kesalahan saat menyimpan produk');
        }
    });
}

// Fungsi untuk edit produk
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        currentEditingId = productId;
        document.getElementById('modalTitle').textContent = 'Edit Produk';
        document.getElementById('productId').value = productId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category;
        
        document.getElementById('productModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading product for edit:', error);
        alert('Terjadi kesalahan saat memuat data produk');
    }
}

// Fungsi untuk menghapus produk
async function deleteProduct(productId) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                loadProductsData(); // Reload products table
                loadDashboardData(); // Update dashboard stats
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Terjadi kesalahan saat menghapus produk');
        }
    }
}

// Fungsi untuk update status pesanan
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Terjadi kesalahan saat mengupdate status pesanan');
    }
}

// Fungsi untuk update role pengguna
async function updateUserRole(userId, role) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        alert('Terjadi kesalahan saat mengupdate role pengguna');
    }
}

// Fungsi untuk melihat detail pesanan
function viewOrderDetails(orderId) {
    alert(`Fitur melihat detail pesanan untuk order ID: ${orderId} akan segera tersedia`);
}

// Fungsi untuk edit pengguna
function editUser(userId) {
    alert(`Fitur edit pengguna untuk user ID: ${userId} akan segera tersedia`);
}