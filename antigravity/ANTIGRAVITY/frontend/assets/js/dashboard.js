// User, Vendor, and Admin Dashboard Controllers

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        showToast("Please login to access the portal.", "warning");
        window.location.href = "index.html";
        return;
    }
    
    initDashboardLayout();
});

// Configure base view tabs based on role
function initDashboardLayout() {
    const role = localStorage.getItem("user_role");
    const container = document.getElementById("dashboard-portal-container");
    if (!container) return;
    
    if (role === "admin") {
        renderAdminDashboard(container);
    } else if (role === "vendor") {
        renderVendorDashboard(container);
    } else {
        renderCustomerDashboard(container);
    }
    
    // Bind Tab Click Actions
    document.querySelectorAll(".sidebar-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const target = btn.getAttribute("data-tab");
            
            document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".dash-panel").forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(target).classList.add("active");
            
            // Reload specific tab data on open
            handleTabLoad(target);
        });
    });
    
    // Load initial tab data
    const activeTab = document.querySelector(".sidebar-btn.active")?.getAttribute("data-tab");
    if (activeTab) handleTabLoad(activeTab);
}

function handleTabLoad(tabId) {
    if (tabId === "cust-orders" || tabId === "vend-orders") loadOrdersList(tabId);
    if (tabId === "cust-wishlist") loadWishlistList();
    if (tabId === "cust-profile" || tabId === "vend-profile") loadProfileDetails();
    if (tabId === "vend-analytics") loadVendorAnalytics();
    if (tabId === "vend-inventory") loadVendorInventory();
    if (tabId === "admin-vendors") loadAdminVendorsList();
    if (tabId === "admin-analytics") loadAdminAnalytics();
    if (tabId === "admin-users") loadAdminUsersList();
}

/* ==========================================
   CUSTOMER DASHBOARD VIEW
   ========================================== */
function renderCustomerDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="dashboard-sidebar">
                <div class="sidebar-title">Buyer Portal</div>
                <ul class="sidebar-nav">
                    <li><button class="sidebar-btn active" data-tab="cust-orders">📦 My Orders</button></li>
                    <li><button class="sidebar-btn" data-tab="cust-wishlist">❤️ Wishlist</button></li>
                    <li><button class="sidebar-btn" data-tab="cust-profile">👤 Profile Setting</button></li>
                </ul>
            </div>
            <div class="dashboard-content">
                <div class="dash-panel active" id="cust-orders">
                    <h2 style="color:var(--primary); margin-bottom:20px;">My Order History</h2>
                    <div id="cust-orders-list">Loading orders...</div>
                </div>
                
                <div class="dash-panel" id="cust-wishlist">
                    <h2 style="color:var(--primary); margin-bottom:20px;">My Saved Wishlist</h2>
                    <div class="product-grid" id="cust-wishlist-grid">Loading wishlist items...</div>
                </div>
                
                <div class="dash-panel" id="cust-profile">
                    <h2 style="color:var(--primary); margin-bottom:20px;">Profile Settings</h2>
                    <div id="cust-profile-details">Loading details...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================
   VENDOR DASHBOARD VIEW
   ========================================== */
function renderVendorDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="dashboard-sidebar">
                <div class="sidebar-title">Seller Portal</div>
                <ul class="sidebar-nav">
                    <li><button class="sidebar-btn active" data-tab="vend-analytics">📈 Sales Analytics</button></li>
                    <li><button class="sidebar-btn" data-tab="vend-inventory">🪵 Manage Crafts</button></li>
                    <li><button class="sidebar-btn" data-tab="vend-orders">📋 Customer Orders</button></li>
                    <li><button class="sidebar-btn" data-tab="vend-profile">👤 Shop Profile</button></li>
                </ul>
            </div>
            <div class="dashboard-content">
                <div class="dash-panel active" id="vend-analytics">
                    <h2 style="color:var(--primary); margin-bottom:25px;">Store Sales Performance</h2>
                    <div id="vend-analytics-body">Loading statistics...</div>
                </div>
                
                <div class="dash-panel" id="vend-inventory">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                        <h2 style="color:var(--primary);">Manage Art & Crafts</h2>
                        <button class="btn btn-primary btn-sm" onclick="openAddProductModal()">+ Add New Product</button>
                    </div>
                    <div class="product-grid" id="vend-inventory-grid">Loading inventory items...</div>
                </div>
                
                <div class="dash-panel" id="vend-orders">
                    <h2 style="color:var(--primary); margin-bottom:20px;">Fulfillment Orders</h2>
                    <div id="vend-orders-list">Loading orders...</div>
                </div>
                
                <div class="dash-panel" id="vend-profile">
                    <h2 style="color:var(--primary); margin-bottom:20px;">Artisan Profile</h2>
                    <div id="vend-profile-details">Loading details...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================
   ADMIN DASHBOARD VIEW
   ========================================== */
function renderAdminDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="dashboard-sidebar">
                <div class="sidebar-title">Admin Console</div>
                <ul class="sidebar-nav">
                    <li><button class="sidebar-btn active" data-tab="admin-analytics">📊 Platform Reports</button></li>
                    <li><button class="sidebar-btn" data-tab="admin-vendors">📜 Vendor Approvals</button></li>
                    <li><button class="sidebar-btn" data-tab="admin-categories">🏷️ Categories</button></li>
                    <li><button class="sidebar-btn" data-tab="admin-users">👥 Audit Accounts</button></li>
                </ul>
            </div>
            <div class="dashboard-content">
                <div class="dash-panel active" id="admin-analytics">
                    <h2 style="color:var(--primary); margin-bottom:25px;">Platform Analytics</h2>
                    <div id="admin-analytics-body">Loading metrics...</div>
                </div>
                
                <div class="dash-panel" id="admin-vendors">
                    <h2 style="color:var(--primary); margin-bottom:20px;">Artisan Registration Approvals</h2>
                    <div id="admin-vendors-list">Loading pending applications...</div>
                </div>
                
                <div class="dash-panel" id="admin-categories">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                        <h2 style="color:var(--primary);">Manage Product Categories</h2>
                        <button class="btn btn-primary btn-sm" onclick="openAddCategoryModal()">+ Add Category</button>
                    </div>
                    <div id="admin-categories-list">Loading categories...</div>
                </div>
                
                <div class="dash-panel" id="admin-users">
                    <h2 style="color:var(--primary); margin-bottom:20px;">System User Directory</h2>
                    <div id="admin-users-list">Loading users...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================
   PORTAL DATA LOADERS & RENDERERS
   ========================================== */

// Profile & Settings Loading
async function loadProfileDetails() {
    const custContainer = document.getElementById("cust-profile-details");
    const vendContainer = document.getElementById("vend-profile-details");
    const container = custContainer || vendContainer;
    if (!container) return;
    
    try {
        const user = await apiFetch("/auth/me");
        
        let vendorFormHtml = "";
        if (user.role === "customer") {
            vendorFormHtml = `
                <div style="margin-top:30px; border-top:1px solid var(--border); padding-top:25px;">
                    <h3 style="color:var(--primary); margin-bottom:12px;">Become a Tribal Seller</h3>
                    <p style="font-size:14px; color:var(--text-muted); margin-bottom:20px;">Apply for an artisan shop and sell handicrafts directly. Applications are reviewed by administration within 24 hours.</p>
                    <form id="vendor-apply-form">
                        <div class="form-group">
                            <label>Tribal Community Name</label>
                            <input type="text" id="apply-community" class="form-control" placeholder="Warli Community / Gond Community" required>
                        </div>
                        <div class="form-group">
                            <label>Fulfillment Address / Workshop location</label>
                            <input type="text" id="apply-address" class="form-control" placeholder="Village name, District, State" required>
                        </div>
                        <div class="form-group">
                            <label>Bank Account details (for sales earnings payout)</label>
                            <input type="text" id="apply-bank" class="form-control" placeholder="Bank Name, A/c Number, IFSC Code" required>
                        </div>
                        <button type="submit" class="btn btn-accent">Submit Application</button>
                    </form>
                </div>
            `;
        } else if (user.role === "vendor") {
            const profile = await apiFetch("/vendors/profile");
            vendorFormHtml = `
                <div style="margin-top:30px; border-top:1px solid var(--border); padding-top:25px;">
                    <h3 style="color:var(--primary); margin-bottom:12px;">Artisan Shop Details</h3>
                    <div style="font-size:15px; margin-bottom:10px;"><strong>Community:</strong> ${profile.tribal_community}</div>
                    <div style="font-size:15px; margin-bottom:10px;"><strong>Fulfillment Hub:</strong> ${profile.address}</div>
                    <div style="font-size:15px; margin-bottom:10px;"><strong>Bank details:</strong> ${profile.bank_account}</div>
                    <div style="font-size:15px;">
                        <strong>Application status:</strong> 
                        <span class="discount-tag" style="background-color:var(--primary-glow); padding:4px 8px; border-radius:4px;">${profile.approval_status.toUpperCase()}</span>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = `
            <form id="profile-edit-form" style="max-width:500px;">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="profile-name" class="form-control" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label>Email Address (read-only)</label>
                    <input type="email" class="form-control" value="${user.email}" disabled>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" id="profile-phone" class="form-control" value="${user.phone || ''}">
                </div>
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </form>
            ${vendorFormHtml}
        `;
        
        // Bind Edit profile
        document.getElementById("profile-edit-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("profile-name").value;
            const phone = document.getElementById("profile-phone").value;
            try {
                const updated = await apiFetch(`/auth/me?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`, { method: "PUT" });
                localStorage.setItem("user_name", updated.name);
                showToast("Profile settings saved!", "success");
                window.dispatchEvent(new Event("auth-changed"));
            } catch (err) {
                showToast(err.message, "danger");
            }
        });
        
        // Bind Vendor apply
        const applyForm = document.getElementById("vendor-apply-form");
        if (applyForm) {
            applyForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const community = document.getElementById("apply-community").value;
                const address = document.getElementById("apply-address").value;
                const bank = document.getElementById("apply-bank").value;
                try {
                    await apiFetch("/vendors/register", {
                        method: "POST",
                        body: JSON.stringify({ tribal_community: community, address, bank_account: bank })
                    });
                    showToast("Artisan registration submitted! Awaiting administrator review.", "success");
                    loadProfileDetails();
                } catch (err) {
                    showToast(err.message, "danger");
                }
            });
        }
        
    } catch (err) {
        container.innerHTML = `<div style="color:var(--danger);">Failed to load profile details.</div>`;
    }
}

// Wishlist Loader
async function loadWishlistList() {
    const grid = document.getElementById("cust-wishlist-grid");
    if (!grid) return;
    
    try {
        const list = await apiFetch("/wishlist/");
        if (list.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px 0; color:var(--text-muted);">No saved crafts yet.</div>`;
            return;
        }
        
        grid.innerHTML = list.map(item => `
            <div class="product-card" id="wish-${item.product.id}">
                <div class="product-image-wrapper">
                    <img src="${item.product.images.length > 0 ? item.product.images[0].image_url : ''}" alt="${item.product.name}" class="product-image" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;300&quot; height=&quot;225&quot; viewBox=&quot;0 0 300 225&quot;><rect width=&quot;300&quot; height=&quot;225&quot; fill=&quot;%231b4332&quot;/><text x=&quot;50%25&quot; y=&quot;50%25&quot; font-family=&quot;Outfit&quot; font-weight=&quot;bold&quot; font-size=&quot;16&quot; fill=&quot;%23d97706&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot;>Craft</text></svg>';">
                </div>
                <div class="product-details">
                    <div class="product-community">${item.product.vendor_community}</div>
                    <h3 class="product-title">${item.product.name}</h3>
                    <div style="font-weight:bold; font-size:16px; margin-bottom:15px;">Rs. ${item.product.price.toFixed(2)}</div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn btn-primary btn-sm" style="flex-grow:1;" onclick="addWishToCart('${item.product.id}')">Add to Cart</button>
                        <button class="btn btn-outline btn-sm" onclick="removeWish('${item.product.id}')" title="Delete Saved">&times;</button>
                    </div>
                </div>
            </div>
        `).join("");
        
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1; color:var(--danger);">Failed to load wishlist items.</div>`;
    }
}

async function addWishToCart(prodId) {
    try {
        await apiFetch("/cart/items", { method: "POST", body: JSON.stringify({ product_id: prodId, quantity: 1 }) });
        showToast("Moved item to cart!", "success");
        updateCartIconBadge();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function removeWish(prodId) {
    try {
        await apiFetch(`/wishlist/${prodId}`, { method: "DELETE" });
        showToast("Removed from saved wishlist", "success");
        loadWishlistList();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Order Management Loader
async function loadOrdersList(tabId) {
    const list = document.getElementById(tabId === "cust-orders" ? "cust-orders-list" : "vend-orders-list");
    if (!list) return;
    
    try {
        const orders = await apiFetch("/orders/");
        if (orders.length === 0) {
            list.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px 0;">No order transactions found.</p>`;
            return;
        }
        
        list.innerHTML = orders.map(o => {
            const dateStr = new Date(o.created_at).toLocaleString();
            
            // Build items preview
            const itemsHtml = o.items.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; border-bottom:1px dashed var(--border); padding:8px 0;">
                    <span>${item.product.name} <strong>x${item.quantity}</strong></span>
                    <span>Rs. ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join("");
            
            // Action button for customer (invoice) vs vendor (update status dropdown)
            let actionHtml = "";
            if (tabId === "cust-orders") {
                actionHtml = `<a href="http://localhost:8000/api/orders/${o.id}/invoice" target="_blank" class="btn btn-outline btn-sm">📄 View Invoice</a>`;
            } else {
                // Vendor action dropdown to update order state
                actionHtml = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:12px; font-weight:bold;">Status:</label>
                        <select onchange="updateFulfillmentStatus('${o.id}', this.value)" class="form-control" style="padding:4px 8px; width:130px; font-size:13px; height:auto;">
                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="packed" ${o.status === 'packed' ? 'selected' : ''}>Packed</option>
                            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                `;
            }
            
            return `
                <div style="background-color:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                        <div>
                            <strong>Order ID:</strong> <span style="font-family:monospace; font-size:13px;">${o.id}</span><br>
                            <span style="font-size:12px; color:var(--text-muted);">${dateStr}</span>
                        </div>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <span class="discount-tag" style="background-color:var(--primary-glow); padding:4px 10px; border-radius:4px; font-weight:bold; font-size:12px; text-transform:uppercase;">${o.status}</span>
                            <span class="discount-tag" style="background-color:var(--accent-glow); color:var(--accent); padding:4px 10px; border-radius:4px; font-weight:bold; font-size:12px; text-transform:uppercase;">Payment: ${o.payment_status}</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        ${itemsHtml}
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div style="font-size:14px; color:var(--text-muted); max-width:400px;">
                            <strong>Shipping Address:</strong> ${o.shipping_address}
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:18px; font-weight:800; color:var(--text); margin-bottom:8px;">Total: Rs. ${o.total_amount.toFixed(2)}</div>
                            ${actionHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join("");
        
    } catch (err) {
        list.innerHTML = `<div style="color:var(--danger);">Failed to retrieve orders list.</div>`;
    }
}

async function updateFulfillmentStatus(orderId, nextStatus) {
    try {
        await apiFetch(`/orders/${orderId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status: nextStatus })
        });
        showToast(`Order status updated to '${nextStatus.toUpperCase()}'!`, "success");
        loadOrdersList("vend-orders");
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Vendor Inventory Controller
async function loadVendorInventory() {
    const grid = document.getElementById("vend-inventory-grid");
    if (!grid) return;
    
    try {
        const user = await apiFetch("/auth/me");
        const vendor = await apiFetch("/vendors/profile");
        
        // Fetch all products, filter locally by vendor profile
        const products = await apiFetch("/products/");
        const myProducts = products.filter(p => p.vendor_id === vendor.id);
        
        if (myProducts.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px 0; color:var(--text-muted);">No products uploaded yet. Click '+ Add New Product' to start.</div>`;
            return;
        }
        
        grid.innerHTML = myProducts.map(p => `
            <div class="product-card">
                <div class="product-image-wrapper">
                    <img src="${p.images.length > 0 ? p.images[0].image_url : ''}" alt="${p.name}" class="product-image" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;300&quot; height=&quot;225&quot; viewBox=&quot;0 0 300 225&quot;><rect width=&quot;300&quot; height=&quot;225&quot; fill=&quot;%231b4332&quot;/><text x=&quot;50%25&quot; y=&quot;50%25&quot; font-family=&quot;Outfit&quot; font-weight=&quot;bold&quot; font-size=&quot;16&quot; fill=&quot;%23d97706&quot; dominant-baseline=&quot;middle&quot; text-anchor=&quot;middle&quot;>Craft</text></svg>';">
                </div>
                <div class="product-details">
                    <h3 class="product-title" style="height:auto; min-height:44px;">${p.name}</h3>
                    <div style="font-size:14px; margin-bottom:6px;"><strong>Price:</strong> Rs. ${p.price.toFixed(2)}</div>
                    <div style="font-size:14px; margin-bottom:15px;">
                        <strong>Stock:</strong> 
                        ${p.stock < 5 ? `<span style="color:var(--danger); font-weight:bold;">${p.stock} (LOW STOCK ALERT)</span>` : `<span style="color:var(--success); font-weight:bold;">${p.stock} units</span>`}
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn btn-outline btn-sm" style="flex-grow:1;" onclick="openEditProductPriceModal('${p.id}', ${p.price}, ${p.stock})">✏️ Edit Spec</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProductListing('${p.id}')">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `).join("");
        
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1; color:var(--danger);">Failed to retrieve inventory items.</div>`;
    }
}

// Vendor Inventory CRUD Modals
async function openAddProductModal() {
    try {
        const categories = await apiFetch("/categories/");
        
        const modal = document.createElement("div");
        modal.className = "modal-overlay active";
        modal.id = "add-prod-modal";
        
        modal.innerHTML = `
            <div class="modal-container" style="max-width:550px;">
                <button class="modal-close" onclick="document.getElementById('add-prod-modal').remove()">&times;</button>
                <h2 style="color:var(--primary); margin-bottom:20px;">Upload New Tribal Craft</h2>
                <form id="add-prod-form">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="add-prod-cat" class="form-control" required>
                            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" id="add-prod-name" class="form-control" placeholder="E.g. Warli Canvas Painting" required>
                    </div>
                    <div class="form-group">
                        <label>Detailed Description</label>
                        <textarea id="add-prod-desc" class="form-control" style="height:80px;" required minlength="10"></textarea>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div class="form-group">
                            <label>Price (Rs.)</label>
                            <input type="number" id="add-prod-price" class="form-control" value="500" min="1" required>
                        </div>
                        <div class="form-group">
                            <label>Stock Quantity</label>
                            <input type="number" id="add-prod-stock" class="form-control" value="10" min="0" required>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div class="form-group">
                            <label>Weight (kg)</label>
                            <input type="number" step="0.1" id="add-prod-weight" class="form-control" value="0.5" required>
                        </div>
                        <div class="form-group">
                            <label>Base Shipping Cost (Rs.)</label>
                            <input type="number" id="add-prod-shipping" class="form-control" value="40" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Product Image File</label>
                        <input type="file" id="add-prod-file" class="form-control" accept="image/*">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">List Product</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById("add-prod-form").addEventListener("submit", handleProductUploadSubmit);
        
    } catch (err) {
        showToast("Failed to initialize categories dropdown.", "danger");
    }
}

async function handleProductUploadSubmit(e) {
    e.preventDefault();
    const catId = document.getElementById("add-prod-cat").value;
    const name = document.getElementById("add-prod-name").value;
    const desc = document.getElementById("add-prod-desc").value;
    const price = document.getElementById("add-prod-price").value;
    const stock = document.getElementById("add-prod-stock").value;
    const weight = document.getElementById("add-prod-weight").value;
    const shipping = document.getElementById("add-prod-shipping").value;
    const imgFile = document.getElementById("add-prod-file").files[0];
    
    try {
        // Step 1: Create listing meta
        const product = await apiFetch("/products/", {
            method: "POST",
            body: JSON.stringify({
                category_id: parseInt(catId),
                name,
                description: desc,
                price: parseFloat(price),
                stock: parseInt(stock),
                weight: parseFloat(weight),
                shipping_cost: parseFloat(shipping)
            })
        });
        
        // Step 2: Upload file if present
        if (imgFile) {
            const formData = new FormData();
            formData.append("file", imgFile);
            
            await apiFetch(`/products/${product.id}/images`, {
                method: "POST",
                body: formData
            });
        }
        
        showToast("Product listed successfully!", "success");
        document.getElementById("add-prod-modal").remove();
        loadVendorInventory();
        
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function openEditProductPriceModal(prodId, price, stock) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay active";
    modal.id = "edit-prod-modal";
    
    modal.innerHTML = `
        <div class="modal-container" style="max-width:400px;">
            <button class="modal-close" onclick="document.getElementById('edit-prod-modal').remove()">&times;</button>
            <h2 style="color:var(--primary); margin-bottom:20px;">Edit Specifications</h2>
            <form id="edit-prod-form">
                <div class="form-group">
                    <label>Price (Rs.)</label>
                    <input type="number" id="edit-prod-price" class="form-control" value="${price}" min="1" required>
                </div>
                <div class="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" id="edit-prod-stock" class="form-control" value="${stock}" min="0" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Save Changes</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById("edit-prod-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const p = document.getElementById("edit-prod-price").value;
        const s = document.getElementById("edit-prod-stock").value;
        try {
            await apiFetch(`/products/${prodId}`, {
                method: "PUT",
                body: JSON.stringify({ price: parseFloat(p), stock: parseInt(s) })
            });
            showToast("Changes saved successfully!", "success");
            document.getElementById("edit-prod-modal").remove();
            loadVendorInventory();
        } catch (err) {
            showToast(err.message, "danger");
        }
    });
}

async function deleteProductListing(prodId) {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
        await apiFetch(`/products/${prodId}`, { method: "DELETE" });
        showToast("Product listing deleted.", "success");
        loadVendorInventory();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Vendor Analytics Renderer
async function loadVendorAnalytics() {
    const body = document.getElementById("vend-analytics-body");
    if (!body) return;
    
    try {
        const stats = await apiFetch("/vendors/analytics");
        
        let alertsHtml = "";
        if (stats.low_stock_count > 0) {
            alertsHtml = `
                <div style="background-color:var(--danger); color:white; padding:15px; border-radius:8px; margin-bottom:25px; font-weight:bold;">
                    ⚠️ Low Stock Warning: You have ${stats.low_stock_count} products with less than 5 units left. Please update inventory.
                </div>
            `;
        }
        
        body.innerHTML = `
            ${alertsHtml}
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Total Revenue</span>
                    <span class="stat-value">Rs. ${stats.revenue.toFixed(2)}</span>
                    <span class="stat-trend trend-up">↑ +${stats.monthly_growth}% this month</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Fulfillment Orders</span>
                    <span class="stat-value">${stats.orders_count}</span>
                    <span class="stat-trend trend-up">Active status</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Units Sold</span>
                    <span class="stat-value">${stats.total_sales}</span>
                    <span class="stat-trend trend-up">Organic crafts</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:40px; min-height:300px;">
                <div style="background-color:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px; text-align:center;">
                    <h4 style="margin-bottom:15px;">Revenue Trend (Last 7 Days)</h4>
                    <canvas id="vendor-sales-chart" width="300" height="200" style="width:100%; max-width:100%; max-height:220px;"></canvas>
                </div>
                
                <div style="background-color:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px;">
                    <h4 style="margin-bottom:15px; text-align:center;">Top Products Sold</h4>
                    <div id="vendor-top-products-list">Loading performance...</div>
                </div>
            </div>
        `;
        
        // Render Canvas Sales Chart (Custom draw lines)
        setTimeout(() => {
            drawVendorSalesChart(stats.sales_trend);
            renderTopProductsList(stats.top_products);
        }, 100);
        
    } catch (err) {
        body.innerHTML = `<div style="color:var(--danger);">Connection error. Failed to retrieve sales stats.</div>`;
    }
}

function drawVendorSalesChart(trend) {
    const canvas = document.getElementById("vendor-sales-chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (trend.length === 0) {
        ctx.fillStyle = "var(--text-muted)";
        ctx.font = "14px Inter";
        ctx.fillText("No sales record to display", 50, 100);
        return;
    }
    
    const maxVal = Math.max(...trend.map(t => t.sales), 1000);
    const w = canvas.width;
    const h = canvas.height;
    const padding = 35;
    
    // Draw Grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    if (document.documentElement.getAttribute("data-theme") === "dark") {
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
    }
    
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.stroke();
    
    // Draw trend line
    ctx.strokeStyle = "#1b4332";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const stepX = (w - (padding * 2)) / (trend.length - 1 || 1);
    const graphH = h - (padding * 2);
    
    trend.forEach((t, i) => {
        const x = padding + (i * stepX);
        const y = h - padding - ((t.sales / maxVal) * graphH);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        // Draw Dot
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1b4332";
        ctx.beginPath();
    });
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = "var(--text)";
    ctx.font = "8px Inter";
    trend.forEach((t, i) => {
        const x = padding + (i * stepX) - 10;
        ctx.fillText(t.date, x, h - 12);
    });
}

function renderTopProductsList(topProds) {
    const list = document.getElementById("vendor-top-products-list");
    if (!list) return;
    
    if (topProds.length === 0) {
        list.innerHTML = `<p style="text-align:center;color:var(--text-muted);margin-top:40px;">No listings sold yet.</p>`;
        return;
    }
    
    list.innerHTML = topProds.map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
            <div>
                <strong>${p.product_name}</strong><br>
                <span style="font-size:12px; color:var(--text-muted);">${p.units_sold} units sold</span>
            </div>
            <span style="font-weight:bold; color:var(--success);">Rs. ${p.revenue.toFixed(2)}</span>
        </div>
    `).join("");
}

/* ==========================================
   ADMIN PANEL ACTIONS & APPROVALS
   ========================================== */

// Pending Vendor Application list
async function loadAdminVendorsList() {
    const list = document.getElementById("admin-vendors-list");
    if (!list) return;
    
    try {
        const pending = await apiFetch("/admin/vendors/pending");
        if (pending.length === 0) {
            list.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px 0;">No pending artisan profiles to approve.</p>`;
            return;
        }
        
        list.innerHTML = pending.map(v => `
            <div style="background-color:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                <div>
                    <h3 style="color:var(--primary);">${v.user?.name || "Artisan Application"}</h3>
                    <div style="font-size:14px; margin-bottom:4px;"><strong>Email:</strong> ${v.user?.email}</div>
                    <div style="font-size:14px; margin-bottom:4px;"><strong>Tribal Community:</strong> ${v.tribal_community}</div>
                    <div style="font-size:14px; margin-bottom:4px;"><strong>Workshop Hub:</strong> ${v.address}</div>
                    <div style="font-size:14px;"><strong>Bank payout Details:</strong> ${v.bank_account}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-primary btn-sm" onclick="approveVendorStatus('${v.id}')">Approve Shop</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectVendorStatus('${v.id}')">Reject</button>
                </div>
            </div>
        `).join("");
        
    } catch (err) {
        list.innerHTML = `<div style="color:var(--danger);">Failed to retrieve pending vendor applications.</div>`;
    }
}

async function approveVendorStatus(vendorId) {
    try {
        await apiFetch(`/admin/vendors/${vendorId}/approve`, { method: "POST" });
        showToast("Vendor profile approved! Credentials upgraded.", "success");
        loadAdminVendorsList();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function rejectVendorStatus(vendorId) {
    try {
        await apiFetch(`/admin/vendors/${vendorId}/reject`, { method: "POST" });
        showToast("Vendor profile rejected.", "warning");
        loadAdminVendorsList();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Categories Audit Management
async function openAddCategoryModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay active";
    modal.id = "add-cat-modal";
    
    modal.innerHTML = `
        <div class="modal-container" style="max-width:400px;">
            <button class="modal-close" onclick="document.getElementById('add-cat-modal').remove()">&times;</button>
            <h2 style="color:var(--primary); margin-bottom:20px;">Add New Category</h2>
            <form id="add-cat-form">
                <div class="form-group">
                    <label>Category Title</label>
                    <input type="text" id="add-cat-name" class="form-control" placeholder="E.g. Bamboo Crafts" required>
                </div>
                <div class="form-group">
                    <label>Short Description</label>
                    <input type="text" id="add-cat-desc" class="form-control" placeholder="Eco-friendly bamboo carvings">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Create Category</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById("add-cat-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const n = document.getElementById("add-cat-name").value;
        const d = document.getElementById("add-cat-desc").value;
        try {
            await apiFetch("/categories/", {
                method: "POST",
                body: JSON.stringify({ name: n, description: d })
            });
            showToast("New category successfully created!", "success");
            document.getElementById("add-cat-modal").remove();
            loadCategoriesList();
        } catch (err) {
            showToast(err.message, "danger");
        }
    });
}

async function loadCategoriesList() {
    const list = document.getElementById("admin-categories-list");
    if (!list) return;
    
    try {
        const categories = await apiFetch("/categories/");
        list.innerHTML = `
            <table class="compare-table" style="margin-top:0;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td><strong>${c.name}</strong></td>
                            <td style="text-align:left;">${c.description || ''}</td>
                            <td><button class="btn btn-danger btn-sm" onclick="deleteCategory('${c.id}')">&times; Delete</button></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    } catch (err) {
        list.innerHTML = `<div style="color:var(--danger);">Failed to retrieve categories.</div>`;
    }
}

async function deleteCategory(catId) {
    if (!confirm("Are you sure? This will delete the category!")) return;
    try {
        await apiFetch(`/categories/${catId}`, { method: "DELETE" });
        showToast("Category successfully deleted.", "success");
        loadCategoriesList();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// User accounts database audit directory
async function loadAdminUsersList() {
    const list = document.getElementById("admin-users-list");
    if (!list) return;
    
    try {
        const users = await apiFetch("/admin/users");
        
        list.innerHTML = `
            <table class="compare-table" style="margin-top:0;">
                <thead>
                    <tr>
                        <th>Registered Name</th>
                        <th>Email ID</th>
                        <th>Phone</th>
                        <th>Role Account</th>
                        <th>Verified</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td><strong>${u.name}</strong></td>
                            <td>${u.email}</td>
                            <td>${u.phone || 'N/A'}</td>
                            <td><span class="discount-tag" style="background-color:var(--primary-glow); padding:2px 6px; border-radius:4px;">${u.role.toUpperCase()}</span></td>
                            <td>${u.is_verified ? '💚 Yes' : '⚪ No'}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    } catch (err) {
        list.innerHTML = `<div style="color:var(--danger);">Failed to retrieve user accounts.</div>`;
    }
}

// Admin platform metrics
async function loadAdminAnalytics() {
    const body = document.getElementById("admin-analytics-body");
    if (!body) return;
    
    try {
        const stats = await apiFetch("/admin/analytics");
        
        body.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Total Platform Revenue</span>
                    <span class="stat-value">Rs. ${stats.revenue_analytics.total.toFixed(2)}</span>
                    <span class="stat-trend trend-up">↑ +${stats.revenue_analytics.monthly_growth}% monthly trend</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Registered Artisans</span>
                    <span class="stat-value">${stats.user_statistics.vendors}</span>
                    <span class="stat-trend trend-up">${stats.vendor_statistics.pending} applications pending</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Total Fulfillments</span>
                    <span class="stat-value">${stats.order_statistics.total}</span>
                    <span class="stat-trend" style="color:var(--text-muted);">${stats.order_statistics.completed} completed | ${stats.order_statistics.cancelled} cancelled</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:40px; min-height:300px;">
                <div style="background-color:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px; text-align:center;">
                    <h4 style="margin-bottom:15px;">Platform Revenue (Last 7 Days)</h4>
                    <canvas id="admin-revenue-chart" width="300" height="200" style="width:100%; max-width:100%; max-height:220px;"></canvas>
                </div>
                
                <div style="background-color:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px;">
                    <h4 style="margin-bottom:15px; text-align:center;">Category Performance Distribution</h4>
                    <div id="admin-category-performance-list">Loading performance...</div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            drawAdminRevenueChart(stats.monthly_revenue);
            renderAdminCategoryPerformanceList(stats.category_performance);
        }, 100);
        
    } catch (err) {
        body.innerHTML = `<div style="color:var(--danger);">Failed to load platform analytics.</div>`;
    }
}

function drawAdminRevenueChart(trend) {
    const canvas = document.getElementById("admin-revenue-chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (trend.length === 0) {
        ctx.fillStyle = "var(--text-muted)";
        ctx.font = "14px Inter";
        ctx.fillText("No transactions found", 50, 100);
        return;
    }
    
    const maxVal = Math.max(...trend.map(t => t.sales), 5000);
    const w = canvas.width;
    const h = canvas.height;
    const padding = 35;
    
    // Grid Lines
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    if (document.documentElement.getAttribute("data-theme") === "dark") {
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
    }
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.stroke();
    
    // Draw Bar Chart
    const stepX = (w - (padding * 2)) / trend.length;
    const graphH = h - (padding * 2);
    
    trend.forEach((t, i) => {
        const x = padding + (i * stepX) + 5;
        const barW = stepX - 10;
        const barH = (t.sales / maxVal) * graphH;
        const y = h - padding - barH;
        
        // Drawing fill
        ctx.fillStyle = "#1b4332";
        ctx.fillRect(x, y, barW, barH);
        
        // Draw label
        ctx.fillStyle = "var(--text)";
        ctx.font = "8px Inter";
        ctx.fillText(t.date, x + (barW/2) - 10, h - 12);
    });
}

function renderAdminCategoryPerformanceList(catProds) {
    const list = document.getElementById("admin-category-performance-list");
    if (!list) return;
    
    list.innerHTML = catProds.map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border);">
            <div>
                <strong>${c.category_name}</strong>
            </div>
            <span style="font-weight:bold; color:var(--accent);">Rs. ${c.revenue.toFixed(2)}</span>
        </div>
    `).join("");
}

// Global Category audit list loader hook
function openAddCategoryModal() {
    openAddCategoryModal(); // Self invoke
}
