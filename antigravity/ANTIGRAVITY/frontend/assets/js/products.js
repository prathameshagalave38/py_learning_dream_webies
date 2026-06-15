// Product Marketplace & Comparison Logic

let comparisonList = [];
let activeWishlistIds = new Set();

document.addEventListener("DOMContentLoaded", () => {
    loadCategoriesFilter();
    loadProducts();
    loadWishlistStates();
    initFilterEventListeners();
    setupCompareDrawer();
});

// Load category filters in sidebar
async function loadCategoriesFilter() {
    try {
        const categories = await apiFetch("/categories/");
        const filterBox = document.getElementById("category-filters");
        if (!filterBox) return;
        
        filterBox.innerHTML = categories.map(cat => `
            <label class="checkbox-label">
                <input type="checkbox" class="cat-checkbox" value="${cat.id}">
                <span>${cat.name}</span>
            </label>
        `).join("");
        
        // Add listeners to checkboxes
        document.querySelectorAll(".cat-checkbox").forEach(chk => {
            chk.addEventListener("change", loadProducts);
        });
    } catch (err) {
        console.error("Failed to load category filters:", err);
    }
}

// Fetch products with active queries
async function loadProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">Loading authentic products...</div>`;
    
    // Get search term
    const search = document.getElementById("search-input")?.value || "";
    
    // Get category checkboxes
    const catCheckboxes = document.querySelectorAll(".cat-checkbox:checked");
    const categoryId = catCheckboxes.length === 1 ? catCheckboxes[0].value : ""; // multiple categories can be handled if API supports it, here we pass the first or filter locally
    
    // Get community filter
    const community = document.getElementById("community-filter")?.value || "";
    
    // Get price boundaries
    const priceMin = document.getElementById("price-min")?.value || "";
    const priceMax = document.getElementById("price-max")?.value || "";
    
    // Get sorting choice
    const sortBy = document.getElementById("sort-select")?.value || "newest";
    
    // Query string construction
    let query = `?sort_by=${sortBy}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (categoryId) query += `&category_id=${categoryId}`;
    if (community) query += `&community=${encodeURIComponent(community)}`;
    if (priceMin) query += `&price_min=${priceMin}`;
    if (priceMax) query += `&price_max=${priceMax}`;
    
    try {
        let products = await apiFetch(`/products/${query}`);
        
        // If multiple categories checked, do client-side filter fallback
        if (catCheckboxes.length > 1) {
            const checkedIds = Array.from(catCheckboxes).map(c => parseInt(c.value));
            products = products.filter(p => checkedIds.includes(p.category_id));
        }
        
        if (products.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No products match your filters.</div>`;
            return;
        }
        
        grid.innerHTML = products.map(p => renderProductCard(p)).join("");
        
        // Load personalized suggestions at bottom if catalog is ready
        loadPersonalizedSuggestions();
        
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--danger);">Failed to load products. Connection error.</div>`;
    }
}

// Map beautiful vector representations for seed mock products if urls do not load
function getFallbackImage(prodName) {
    // Generate a beautiful, styled inline SVG background based on product name characteristics
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="225" viewBox="0 0 300 225"><rect width="300" height="225" fill="%231b4332"/><text x="50%25" y="50%25" font-family="'Outfit', sans-serif" font-weight="bold" font-size="16" fill="%23d97706" dominant-baseline="middle" text-anchor="middle">${encodeURIComponent(prodName)}</text></svg>`;
}

function renderProductCard(p) {
    const isDiscounted = p.discount > 0;
    const finalPrice = isDiscounted ? p.price * (1 - (p.discount / 100)) : p.price;
    const mainImage = p.images.length > 0 ? p.images[0].image_url : getFallbackImage(p.name);
    
    const isWished = activeWishlistIds.has(p.id);
    const isComparing = comparisonList.some(item => item.id === p.id);
    
    return `
        <div class="product-card" id="card-${p.id}">
            ${isDiscounted ? `<span class="product-badge">${Math.round(p.discount)}% OFF</span>` : ""}
            <div class="product-image-wrapper">
                <img src="${mainImage}" alt="${p.name}" class="product-image" onerror="this.onerror=null; this.src='${getFallbackImage(p.name)}';">
            </div>
            <div class="product-details">
                <div class="product-community">${p.vendor_community || 'Tribal Artisans'}</div>
                <h3 class="product-title">${p.name}</h3>
                
                <div class="product-rating">
                    ★ <span>${p.average_rating ? p.average_rating.toFixed(1) : '0.0'}</span>
                    <span class="rating-count">(${p.reviews_count} reviews)</span>
                </div>
                
                <div class="product-price-row">
                    <span class="price-current">Rs. ${finalPrice.toFixed(2)}</span>
                    ${isDiscounted ? `<span class="price-original">Rs. ${p.price.toFixed(2)}</span>` : ""}
                </div>
                
                <div class="product-actions" style="margin-bottom:12px;">
                    <button class="btn btn-primary btn-sm" onclick="addToCart('${p.id}')">Add to Cart</button>
                    <button class="btn btn-wishlist-toggle ${isWished ? 'active' : ''}" onclick="toggleWishlist('${p.id}')">
                        ${isWished ? '❤️' : '🤍'}
                    </button>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
                    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" onclick="toggleCompare('${p.id}', '${encodeURIComponent(JSON.stringify(p))}')" ${isComparing ? 'checked' : ''}>
                        <span>Compare Spec</span>
                    </label>
                    <a href="#" style="font-weight:bold; color:var(--primary);" onclick="openProductDetail('${p.id}'); return false;">Quick View &rarr;</a>
                </div>
            </div>
        </div>
    `;
}

// Fetch user wishlist IDs to set Active buttons
async function loadWishlistStates() {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
        const list = await apiFetch("/wishlist/");
        activeWishlistIds = new Set(list.map(item => item.product_id));
    } catch (err) {
        console.error("Wishlist sync error:", err);
    }
}

// Add/remove wishlist items
async function toggleWishlist(productId) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        showToast("Please login to manage your wishlist.", "warning");
        document.getElementById("auth-modal").classList.add("active");
        return;
    }
    
    try {
        if (activeWishlistIds.has(productId)) {
            await apiFetch(`/wishlist/${productId}`, { method: "DELETE" });
            activeWishlistIds.delete(productId);
            showToast("Removed from wishlist.", "success");
        } else {
            await apiFetch("/wishlist/", {
                method: "POST",
                body: JSON.stringify({ product_id: productId })
            });
            activeWishlistIds.add(productId);
            showToast("Saved to wishlist!", "success");
        }
        loadProducts(); // Rerender
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Add Item to Shopping Cart
async function addToCart(productId) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        showToast("Please login to add items to your cart.", "warning");
        document.getElementById("auth-modal").classList.add("active");
        return;
    }
    
    try {
        await apiFetch("/cart/items", {
            method: "POST",
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        showToast("Item added to cart!", "success");
        updateCartIconBadge();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Product Details Quick View Modal
async function openProductDetail(productId) {
    try {
        const p = await apiFetch(`/products/${productId}`);
        const reviews = await apiFetch(`/reviews/product/${productId}`);
        
        // Track recently viewed in LocalStorage
        let viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
        viewed = viewed.filter(id => id !== productId);
        viewed.push(productId);
        if (viewed.length > 5) viewed.shift();
        localStorage.setItem("recently_viewed", JSON.stringify(viewed));
        
        // Build modal details
        const modal = document.createElement("div");
        modal.className = "modal-overlay active";
        modal.id = "detail-modal";
        
        const finalPrice = p.discount > 0 ? p.price * (1 - (p.discount / 100)) : p.price;
        const mainImage = p.images.length > 0 ? p.images[0].image_url : getFallbackImage(p.name);
        
        let stockMessage = `<span style="color:var(--success); font-weight:bold;">In Stock (${p.stock} available)</span>`;
        if (p.stock === 0) {
            stockMessage = `<span style="color:var(--danger); font-weight:bold;">Out of Stock</span>`;
        } else if (p.stock < 5) {
            stockMessage = `<span style="color:var(--danger); font-weight:bold;">Hurry! Only ${p.stock} left in stock.</span>`;
        }
        
        const reviewsListHtml = reviews.length === 0 
            ? `<p style="color:var(--text-muted); font-size:14px; font-style:italic;">No reviews yet for this product.</p>`
            : reviews.map(r => `
                <div style="border-bottom:1px solid var(--border); padding:12px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <strong>${r.user_name}</strong>
                        <span style="color:var(--warning); font-size:14px;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <p style="font-size:14px; color:var(--text-muted);">${r.review || "No text description."}</p>
                </div>
            `).join("");
            
        modal.innerHTML = `
            <div class="modal-container" style="max-width:800px;">
                <button class="modal-close" onclick="document.getElementById('detail-modal').remove()">&times;</button>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:20px;">
                    <div>
                        <img src="${mainImage}" alt="${p.name}" style="width:100%; border-radius:12px; object-fit:cover; border:1px solid var(--border);" onerror="this.onerror=null; this.src='${getFallbackImage(p.name)}';">
                    </div>
                    <div style="display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <span style="font-size:12px; font-weight:700; text-transform:uppercase; color:var(--accent);">${p.vendor_community}</span>
                            <h2 style="color:var(--primary); margin:6px 0 12px 0;">${p.name}</h2>
                            <p style="font-size:14px; color:var(--text-muted); margin-bottom:15px; max-height:150px; overflow-y:auto;">${p.description}</p>
                            
                            <div style="margin-bottom:12px; font-size:14px;">
                                <strong>Weight:</strong> ${p.weight} kg | 
                                <strong>Shipping:</strong> Rs. ${p.shipping_cost}
                            </div>
                            
                            <div style="margin-bottom:15px; font-size:14px;">
                                <strong>Status:</strong> ${stockMessage}
                            </div>
                        </div>
                        
                        <div>
                            <div style="display:flex; align-items:baseline; gap:12px; margin-bottom:20px;">
                                <span style="font-size:26px; font-weight:800; color:var(--text);">Rs. ${finalPrice.toFixed(2)}</span>
                                ${p.discount > 0 ? `<span style="text-decoration:line-through; color:var(--text-muted);">Rs. ${p.price.toFixed(2)}</span>` : ""}
                            </div>
                            <button class="btn btn-primary" onclick="addToCart('${p.id}'); document.getElementById('detail-modal').remove();" style="width:100%;" ${p.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:35px; border-top:1px solid var(--border); padding-top:20px;">
                    <h3 style="color:var(--primary); margin-bottom:15px;">Customer Reviews & Ratings</h3>
                    <div style="max-height:220px; overflow-y:auto; padding-right:10px;">
                        ${reviewsListHtml}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (err) {
        showToast("Error retrieving product details", "danger");
    }
}

// Dynamic Filter Panel Observers
function initFilterEventListeners() {
    document.getElementById("search-input")?.addEventListener("input", debounce(loadProducts, 400));
    document.getElementById("community-filter")?.addEventListener("change", loadProducts);
    document.getElementById("price-min")?.addEventListener("change", loadProducts);
    document.getElementById("price-max")?.addEventListener("change", loadProducts);
    document.getElementById("sort-select")?.addEventListener("change", loadProducts);
}

// Compare Drawer Setup
function setupCompareDrawer() {
    const drawer = document.createElement("div");
    drawer.className = "compare-drawer";
    drawer.id = "compare-drawer";
    drawer.innerHTML = `
        <div class="compare-header">
            <h3>Product Specification Comparison</h3>
            <button class="btn btn-sm btn-outline" onclick="closeCompareDrawer()">Minimize</button>
        </div>
        <div id="compare-table-container"></div>
    `;
    document.body.appendChild(drawer);
}

function toggleCompare(productId, jsonString) {
    const product = JSON.parse(decodeURIComponent(jsonString));
    const index = comparisonList.findIndex(item => item.id === productId);
    
    if (index >= 0) {
        comparisonList.splice(index, 1);
        showToast("Removed from comparison list.", "success");
    } else {
        if (comparisonList.length >= 3) {
            showToast("You can compare up to 3 products at a time.", "warning");
            loadProducts(); // Uncheck checkbox
            return;
        }
        comparisonList.push(product);
        showToast("Added to comparison list.", "success");
    }
    
    updateCompareDrawer();
}

function updateCompareDrawer() {
    const drawer = document.getElementById("compare-drawer");
    const container = document.getElementById("compare-table-container");
    
    if (comparisonList.length === 0) {
        drawer.classList.remove("active");
        return;
    }
    
    drawer.classList.add("active");
    
    // Draw table comparison
    const columns = comparisonList.map(p => {
        const finalPrice = p.discount > 0 ? p.price * (1 - (p.discount / 100)) : p.price;
        return `
            <td>
                <strong>${p.name}</strong><br>
                <span style="font-size:12px;color:var(--accent);">${p.vendor_community}</span>
                <div style="margin:8px 0; font-weight:bold; font-size:16px;">Rs. ${finalPrice.toFixed(2)}</div>
                <button class="btn btn-primary btn-sm" onclick="addToCart('${p.id}')">Buy Now</button>
            </td>
        `;
    }).join("");
    
    const weightRow = comparisonList.map(p => `<td>${p.weight} kg</td>`).join("");
    const shippingRow = comparisonList.map(p => `<td>Rs. ${p.shipping_cost}</td>`).join("");
    const ratingRow = comparisonList.map(p => `<td>★ ${p.average_rating ? p.average_rating.toFixed(1) : '0.0'} (${p.reviews_count} reviews)</td>`).join("");
    const descRow = comparisonList.map(p => `<td style="font-size:12px; color:var(--text-muted); text-align:left; max-width:200px;">${p.description}</td>`).join("");
    
    container.innerHTML = `
        <table class="compare-table">
            <tr>
                <th>Detail Specifications</th>
                ${columns}
            </tr>
            <tr>
                <strong><td>Weight</td></strong>
                ${weightRow}
            </tr>
            <tr>
                <strong><td>Shipping Cost</td></strong>
                ${shippingRow}
            </tr>
            <tr>
                <strong><td>Artisan Rating</td></strong>
                ${ratingRow}
            </tr>
            <tr>
                <strong><td>Product Description</td></strong>
                ${descRow}
            </tr>
        </table>
    `;
}

function closeCompareDrawer() {
    document.getElementById("compare-drawer").classList.remove("active");
}

// Personalized recommendations based on viewed lists
async function loadPersonalizedSuggestions() {
    const suggestionBox = document.getElementById("personalized-suggestions");
    if (!suggestionBox) return;
    
    const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    if (viewed.length === 0) {
        suggestionBox.innerHTML = ``;
        return;
    }
    
    try {
        const url = `/products/personalized-recommendations?recently_viewed=${viewed.join(",")}&limit=4`;
        const products = await apiFetch(url);
        
        if (products.length === 0) {
            suggestionBox.innerHTML = ``;
            return;
        }
        
        suggestionBox.innerHTML = `
            <h2 style="color:var(--primary); margin:50px 0 20px 0; text-align:center;">AI Recommended For You</h2>
            <div class="product-grid">
                ${products.map(p => renderProductCard(p)).join("")}
            </div>
        `;
    } catch (err) {
        console.error("Personalized suggestions failed:", err);
    }
}

// Utility Helpers
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
