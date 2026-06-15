// Cart Operations, Coupon System, and Simulated Payment Gateways

let activeCart = null;
let appliedDiscountPercent = 0.0;
let appliedCouponCode = "";

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});

async function loadCart() {
    const listContainer = document.getElementById("cart-items-container");
    const summaryCard = document.getElementById("cart-summary-card");
    if (!listContainer) return;
    
    const token = localStorage.getItem("access_token");
    if (!token) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding:50px 0;">
                <p style="color:var(--text-muted); margin-bottom:20px;">Please login to view your shopping cart.</p>
                <button class="btn btn-primary" onclick="document.getElementById('auth-modal').classList.add('active')">Login / Register</button>
            </div>
        `;
        if (summaryCard) summaryCard.style.display = "none";
        return;
    }
    
    try {
        const cart = await apiFetch("/cart/");
        activeCart = cart;
        
        if (cart.items.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:50px 0;">
                    <p style="color:var(--text-muted); margin-bottom:20px;">Your shopping cart is empty.</p>
                    <a href="products.html" class="btn btn-primary">Browse Marketplace</a>
                </div>
            `;
            if (summaryCard) summaryCard.style.display = "none";
            return;
        }
        
        if (summaryCard) summaryCard.style.display = "block";
        
        // Render Cart Items
        listContainer.innerHTML = cart.items.map(item => renderCartItemRow(item)).join("");
        
        // Calculate Totals
        calculateCartTotals();
        
    } catch (err) {
        listContainer.innerHTML = `<div style="color:var(--danger); padding:20px; text-align:center;">Failed to retrieve cart items. Connection error.</div>`;
    }
}

function renderCartItemRow(item) {
    const p = item.product;
    const finalPrice = p.discount > 0 ? p.price * (1 - (p.discount / 100)) : p.price;
    const itemTotal = finalPrice * item.quantity;
    const fallbackImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60"><rect width="80" height="60" fill="%231b4332"/><text x="50%25" y="50%25" font-family="'Outfit', sans-serif" font-weight="bold" font-size="8" fill="%23d97706" dominant-baseline="middle" text-anchor="middle">Craft</text></svg>`;
    const img = p.images.length > 0 ? p.images[0].image_url : fallbackImg;
    
    return `
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border); padding:20px 0; gap:20px;">
            <div style="display:flex; align-items:center; gap:20px; flex-grow:1;">
                <img src="${img}" alt="${p.name}" style="width:80px; height:60px; object-fit:cover; border-radius:8px; border:1px solid var(--border);" onerror="this.onerror=null; this.src='${fallbackImg}';">
                <div>
                    <h4 style="margin-bottom:4px; color:var(--primary);">${p.name}</h4>
                    <span style="font-size:12px; color:var(--accent); font-weight:bold;">${p.vendor_community}</span>
                </div>
            </div>
            
            <div style="display:flex; align-items:center; gap:30px; min-width:300px; justify-content:space-between;">
                <div>
                    <span style="font-size:15px; font-weight:700;">Rs. ${finalPrice.toFixed(2)}</span>
                </div>
                
                <div style="display:flex; align-items:center; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                    <button style="padding:6px 12px; background:none; border:none; cursor:pointer;" onclick="changeQty('${item.id}', ${item.quantity - 1})">-</button>
                    <span style="padding:6px 14px; font-weight:bold; background-color:var(--border); font-size:14px;">${item.quantity}</span>
                    <button style="padding:6px 12px; background:none; border:none; cursor:pointer;" onclick="changeQty('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                
                <div style="min-width:80px; text-align:right;">
                    <span style="font-weight:bold; color:var(--text);">Rs. ${itemTotal.toFixed(2)}</span>
                </div>
                
                <button class="btn btn-sm btn-wishlist-toggle" onclick="deleteCartItem('${item.id}')" style="border:none; padding:8px;" title="Remove Item">&times;</button>
            </div>
        </div>
    `;
}

async function changeQty(itemId, newQty) {
    if (newQty < 1) {
        deleteCartItem(itemId);
        return;
    }
    
    try {
        await apiFetch(`/cart/items/${itemId}`, {
            method: "PUT",
            body: JSON.stringify({ quantity: newQty })
        });
        loadCart();
        updateCartIconBadge();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function deleteCartItem(itemId) {
    try {
        await apiFetch(`/cart/items/${itemId}`, { method: "DELETE" });
        showToast("Item removed from cart.", "success");
        loadCart();
        updateCartIconBadge();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Calculate totals and apply discounts
function calculateCartTotals() {
    if (!activeCart || activeCart.items.length === 0) return;
    
    let subtotal = 0.0;
    let totalWeight = 0.0;
    
    activeCart.items.forEach(item => {
        const p = item.product;
        const finalPrice = p.discount > 0 ? p.price * (1 - (p.discount / 100)) : p.price;
        subtotal += finalPrice * item.quantity;
        totalWeight += (p.weight || 0.1) * item.quantity;
    });
    
    // Calculate discounts
    const discount = subtotal * appliedDiscountPercent;
    
    // Calculate shipping (Rs. 40 base + Rs. 15 per kg + Rs. 24 region placeholder)
    const shipping = 40.0 + (totalWeight * 15.0) + 24.0;
    const finalTotal = subtotal - discount + shipping;
    
    document.getElementById("lbl-subtotal").textContent = `Rs. ${subtotal.toFixed(2)}`;
    document.getElementById("lbl-discount").textContent = `- Rs. ${discount.toFixed(2)}`;
    document.getElementById("lbl-shipping").textContent = `Rs. ${shipping.toFixed(2)}`;
    document.getElementById("lbl-total").textContent = `Rs. ${finalTotal.toFixed(2)}`;
}

// Apply Coupon validation
function applyCoupon() {
    const input = document.getElementById("coupon-input").value.toUpperCase().trim();
    const feedback = document.getElementById("coupon-feedback");
    
    if (!input) {
        feedback.textContent = "";
        return;
    }
    
    const coupons = {
        "WELCOME10": 0.10,
        "TRIBAL20": 0.20,
        "FESTIVE15": 0.15
    };
    
    if (input in coupons) {
        appliedDiscountPercent = coupons[input];
        appliedCouponCode = input;
        feedback.className = "discount-tag";
        feedback.style.color = "var(--success)";
        feedback.textContent = `Coupon Applied! ${coupons[input]*100}% discount active.`;
        showToast("Discount coupon successfully applied!", "success");
        calculateCartTotals();
    } else {
        appliedDiscountPercent = 0.0;
        appliedCouponCode = "";
        feedback.style.color = "var(--danger)";
        feedback.textContent = "Invalid coupon code.";
        calculateCartTotals();
    }
}

// Checkout Form Modal Trigger
function openCheckoutModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay active";
    modal.id = "checkout-modal";
    
    modal.innerHTML = `
        <div class="modal-container">
            <button class="modal-close" onclick="document.getElementById('checkout-modal').remove()">&times;</button>
            <h2 style="color:var(--primary); margin-bottom:20px;">Shipping & Checkout Details</h2>
            <form id="checkout-form">
                <div class="form-group">
                    <label>Fulfillment Address</label>
                    <textarea id="checkout-address" class="form-control" placeholder="House/Flat No, Street Name, City, State, Pincode" style="height:100px;" required minlength="10"></textarea>
                </div>
                <button type="submit" class="btn btn-accent" style="width:100%; margin-top:10px;">Proceed to Payment</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    const address = document.getElementById("checkout-address").value;
    document.getElementById("checkout-modal").remove();
    
    try {
        const order = await apiFetch("/orders/checkout", {
            method: "POST",
            body: JSON.stringify({
                shipping_address: address,
                coupon_code: appliedCouponCode || null
            })
        });
        
        // Trigger simulated payment dialog passing order details
        openSimulatedPaymentGateway(order);
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Simulated Payment popup
function openSimulatedPaymentGateway(order) {
    const gateway = document.createElement("div");
    gateway.className = "modal-overlay active";
    gateway.id = "payment-gateway-modal";
    
    gateway.innerHTML = `
        <div class="modal-container" style="max-width:480px; padding:0; overflow:hidden; border:none; background-color:hsl(225, 20%, 98%);">
            <div style="background-color:#020b2d; color:white; padding:25px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="margin-bottom:4px; font-size:16px;">Razorpay Checkout</h3>
                    <span style="font-size:12px; opacity:0.75;">Order ID: #${order.id.substring(0,8)}</span>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:18px; font-weight:800; color:#4df2a8;">Rs. ${order.total_amount.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="padding:30px;" id="gateway-body">
                <div style="text-align:center; margin-bottom:20px; font-weight:600; color:#555;">Simulated Transaction Environment</div>
                <form id="gateway-form">
                    <div class="form-group">
                        <label style="font-size:12px; color:#555;">Card Number</label>
                        <input type="text" class="form-control" placeholder="4111 2222 3333 4444" value="4111222233334444" required>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        <div class="form-group">
                            <label style="font-size:12px; color:#555;">Expiry Date</label>
                            <input type="text" class="form-control" placeholder="MM/YY" value="12/28" required>
                        </div>
                        <div class="form-group">
                            <label style="font-size:12px; color:#555;">CVV</label>
                            <input type="password" class="form-control" placeholder="123" value="123" required>
                        </div>
                    </div>
                    <button type="submit" class="btn" style="background-color:#3399cc; color:white; width:100%; margin-top:15px;">Pay Securely (Rs. ${order.total_amount.toFixed(2)})</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(gateway);
    document.getElementById("gateway-form").addEventListener("submit", (e) => handlePaymentVerification(e, order));
}

async function handlePaymentVerification(e, order) {
    e.preventDefault();
    const body = document.getElementById("gateway-body");
    
    // Simulate steps
    body.innerHTML = `
        <div style="text-align:center; padding:40px 0;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3399cc; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
            <p style="font-weight:600; color:#555;" id="loader-msg">Contacting payment gateway...</p>
        </div>
        <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;
    
    setTimeout(() => {
        document.getElementById("loader-msg").textContent = "Verifying transaction credentials...";
    }, 1500);
    
    setTimeout(async () => {
        try {
            // Call API backend payments verification
            const mockTxn = "TXN-VERIFY-" + Math.floor(Math.random()*100000000);
            await apiFetch("/payments/verify", {
                method: "POST",
                body: JSON.stringify({
                    order_id: order.id,
                    transaction_id: mockTxn
                })
            });
            
            // Show payment success details
            body.innerHTML = `
                <div style="text-align:center; padding:40px 0;">
                    <span style="font-size:48px; color:var(--success);">✓</span>
                    <h3 style="color:var(--success); margin:15px 0 10px 0;">Payment Successful!</h3>
                    <p style="font-size:14px; color:var(--text-muted); margin-bottom:25px;">Receipt details emailed. Order has been confirmed.</p>
                    <button class="btn btn-primary" onclick="redirectToDashboard()">Track Order</button>
                </div>
            `;
            showToast("Payment verified. Order confirmed!", "success");
            updateCartIconBadge();
        } catch (err) {
            body.innerHTML = `
                <div style="text-align:center; padding:40px 0;">
                    <span style="font-size:48px; color:var(--danger);">✗</span>
                    <h3 style="color:var(--danger); margin:15px 0 10px 0;">Verification Failed</h3>
                    <p style="font-size:14px; color:var(--text-muted);">${err.message}</p>
                    <button class="btn btn-outline" style="margin-top:20px;" onclick="document.getElementById('payment-gateway-modal').remove()">Dismiss</button>
                </div>
            `;
        }
    }, 3000);
}

function redirectToDashboard() {
    document.getElementById("payment-gateway-modal").remove();
    window.location.href = "dashboard.html";
}
