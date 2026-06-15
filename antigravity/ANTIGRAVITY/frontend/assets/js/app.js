// Global layout, Auth modals, Theme switcher, and i18n translation engine

// Multi-language translation dictionaries
const TRANSLATIONS = {
    en: {
        nav_home: "Home",
        nav_products: "Marketplace",
        nav_cart: "Cart",
        nav_dashboard: "Portal",
        nav_logout: "Logout",
        nav_login: "Login / Register",
        hero_title: "Authentic Tribal Heritage",
        hero_subtitle: "Direct livelihood support for tribal artists, craftsmen, and organic farmers.",
        btn_explore: "Browse Crafts",
        footer_rights: "© 2026 Tribal E-Marketplace Portal. Preserving Heritage, Empowering Artisans.",
        theme_dark: "Dark Mode",
        theme_light: "Light Mode",
        lbl_language: "Language",
    },
    hi: {
        nav_home: "मुख्य पृष्ठ",
        nav_products: "बाज़ार",
        nav_cart: "टोकरी",
        nav_dashboard: "पोर्टल",
        nav_logout: "लॉगआउट",
        nav_login: "लॉगिन / पंजीकरण",
        hero_title: "प्रामाणिक जनजातीय विरासत",
        hero_subtitle: "जनजातीय कलाकारों, शिल्पकारों और जैविक किसानों के लिए प्रत्यक्ष आजीविका सहायता।",
        btn_explore: "उत्पाद देखें",
        footer_rights: "© 2026 जनजातीय ई-मार्केटप्लेस। विरासत का संरक्षण, कारीगरों का सशक्तिकरण।",
        theme_dark: "डार्क मोड",
        theme_light: "लाइट मोड",
        lbl_language: "भाषा",
    },
    gondi: {
        nav_home: "नेला",
        nav_products: "अंगडी",
        nav_cart: "झोल्ली",
        nav_dashboard: "गद्दी",
        nav_logout: "हन्दना",
        nav_login: "लोन ओड़ना / पोल्लो",
        hero_title: "अस्ल कोइतूर सांकृतिक",
        hero_subtitle: "कोइतूर कला, बुट्टा आनी नांग वेकतोर्कुन सीधा उदर-निर्वाह सहाय.",
        btn_explore: "चीज़ुल सुड़ना",
        footer_rights: "© 2026 कोइतूर ई-अंगडी. विरासत बचाओना, कामगार पोसना.",
        theme_dark: "चीकटी मोड",
        theme_light: "वेडचा मोड",
        lbl_language: "गोत्तो",
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    injectLayout();
    initAuthListeners();
    checkUrlAlerts();
    updateCartIconBadge();
    applyLanguage(localStorage.getItem("lang") || "en");
});

// Toast alerts helper
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" style="background:none;border:none;cursor:pointer;color:inherit;font-weight:bold;">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto dismiss after 4s
    const timer = setTimeout(() => {
        toast.style.animation = "slideOut 0.3s forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(timer);
        toast.remove();
    });
}

// Global Layout Injection (Navbar, Footer, Auth Modal)
function injectLayout() {
    const header = document.querySelector("header");
    if (header) {
        const activePage = window.location.pathname.split("/").pop() || "index.html";
        header.innerHTML = `
            <nav class="navbar">
                <div class="logo-container">
                    <a href="index.html" style="display:flex; flex-direction:column; align-items:flex-start;">
                        <span class="logo-text">Adivasi Portal</span>
                        <span class="logo-subtext">Tribal Crafts</span>
                    </a>
                </div>
                <ul class="nav-links">
                    <li><a href="index.html" class="nav-link ${activePage === 'index.html' ? 'active' : ''}" data-i18n="nav_home">Home</a></li>
                    <li><a href="products.html" class="nav-link ${activePage === 'products.html' ? 'active' : ''}" data-i18n="nav_products">Marketplace</a></li>
                    <li><a href="cart.html" class="nav-link ${activePage === 'cart.html' ? 'active' : ''}" data-i18n="nav_cart">Cart</a></li>
                    <li id="nav-dash-item" style="display:none;"><a href="dashboard.html" class="nav-link ${activePage === 'dashboard.html' ? 'active' : ''}" data-i18n="nav_dashboard">Portal</a></li>
                </ul>
                <div class="nav-actions">
                    <select id="lang-select" class="btn btn-sm btn-outline" style="padding:4px 8px;">
                        <option value="en">English</option>
                        <option value="hi">हिन्दी</option>
                        <option value="gondi">Gondi</option>
                    </select>
                    <button id="theme-toggle" class="nav-icon-btn" title="Toggle Theme">🌓</button>
                    <a href="cart.html" class="nav-icon-btn" style="display:inline-block;">
                        🛒<span id="cart-badge" class="badge">0</span>
                    </a>
                    <button id="auth-nav-btn" class="btn btn-primary btn-sm" data-i18n="nav_login">Login</button>
                </div>
            </nav>
        `;
        
        // Bind settings events
        document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
        document.getElementById("lang-select").addEventListener("change", (e) => {
            applyLanguage(e.target.value);
        });
        document.getElementById("lang-select").value = localStorage.getItem("lang") || "en";
    }
    
    // Inject footer
    const footer = document.querySelector("footer");
    if (footer) {
        footer.style.backgroundColor = "var(--bg-card)";
        footer.style.borderTop = "1px solid var(--border)";
        footer.style.padding = "30px 20px";
        footer.style.textAlign = "center";
        footer.style.marginTop = "60px";
        footer.innerHTML = `
            <div class="container" style="margin:0 auto; padding:0;">
                <p data-i18n="footer_rights" style="color:var(--text-muted); font-size:14px;">© 2026 Tribal E-Marketplace Portal. Preserving Heritage, Empowering Artisans.</p>
            </div>
        `;
    }
    
    // Inject Auth Modal Overlay
    const modalDiv = document.createElement("div");
    modalDiv.id = "auth-modal";
    modalDiv.className = "modal-overlay";
    modalDiv.innerHTML = `
        <div class="modal-container">
            <button class="modal-close" id="auth-modal-close">&times;</button>
            <div id="login-form-container">
                <h2 style="margin-bottom:20px; color:var(--primary);">Login to Your Account</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="login-email" class="form-control" placeholder="artisan@tribal.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="login-password" class="form-control" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Login</button>
                    <p style="text-align:center; margin-top:15px; font-size:14px; color:var(--text-muted);">
                        Artisan or buyer? <a href="#" id="show-register-btn" style="font-weight:bold;">Register Here</a>
                    </p>
                </form>
            </div>
            <div id="register-form-container" style="display:none;">
                <h2 style="margin-bottom:20px; color:var(--primary);">Create an Account</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="reg-name" class="form-control" placeholder="Jangarh Gond" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="reg-email" class="form-control" placeholder="artisan@tribal.com" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number (Optional)</label>
                        <input type="tel" id="reg-phone" class="form-control" placeholder="9876543210">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="reg-password" class="form-control" placeholder="Minimum 6 characters" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label>Register As</label>
                        <select id="reg-role" class="form-control">
                            <option value="customer">Customer (Buy Handicrafts)</option>
                            <option value="vendor">Tribal Seller (Apply to sell crafts)</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-accent" style="width:100%; margin-top:10px;">Register Account</button>
                    <p style="text-align:center; margin-top:15px; font-size:14px; color:var(--text-muted);">
                        Already have an account? <a href="#" id="show-login-btn" style="font-weight:bold;">Login Here</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
    
    // Modal toggle event listeners
    const modalClose = document.getElementById("auth-modal-close");
    modalClose.addEventListener("click", () => modalDiv.classList.remove("active"));
    
    document.getElementById("show-register-btn").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("login-form-container").style.display = "none";
        document.getElementById("register-form-container").style.display = "block";
    });
    
    document.getElementById("show-login-btn").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("register-form-container").style.display = "none";
        document.getElementById("login-form-container").style.display = "block";
    });
    
    // Bind submission forms
    document.getElementById("login-form").addEventListener("submit", handleLoginSubmit);
    document.getElementById("register-form").addEventListener("submit", handleRegisterSubmit);
}

// Authentication Listeners
function initAuthListeners() {
    updateAuthNavState();
    
    // Listen for storage or internal modifications
    window.addEventListener("auth-changed", () => {
        updateAuthNavState();
    });
    
    const authBtn = document.getElementById("auth-nav-btn");
    if (authBtn) {
        authBtn.addEventListener("click", () => {
            const token = localStorage.getItem("access_token");
            if (token) {
                // Logout clicked
                handleLogoutRedirect();
                showToast("Logged out successfully.", "success");
            } else {
                // Open login modal
                document.getElementById("auth-modal").classList.add("active");
                document.getElementById("login-form-container").style.display = "block";
                document.getElementById("register-form-container").style.display = "none";
            }
        });
    }
}

function updateAuthNavState() {
    const token = localStorage.getItem("access_token");
    const authBtn = document.getElementById("auth-nav-btn");
    const dashItem = document.getElementById("nav-dash-item");
    
    if (token) {
        const name = localStorage.getItem("user_name") || "User";
        if (authBtn) {
            authBtn.textContent = `Logout (${name})`;
            authBtn.classList.remove("btn-primary");
            authBtn.classList.add("btn-outline");
        }
        if (dashItem) dashItem.style.display = "block";
    } else {
        if (authBtn) {
            authBtn.textContent = "Login / Register";
            authBtn.classList.remove("btn-outline");
            authBtn.classList.add("btn-primary");
        }
        if (dashItem) dashItem.style.display = "none";
    }
}

// Submit Actions
async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    try {
        const response = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Invalid login credentials");
        }
        
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("user_name", data.name);
        
        document.getElementById("auth-modal").classList.remove("active");
        showToast(`Welcome back, ${data.name}!`, "success");
        
        // Dispatch event
        window.dispatchEvent(new Event("auth-changed"));
        
        // Redirect vendors/admins to dashboard automatically
        if (data.role === "vendor" || data.role === "admin") {
            window.location.href = "dashboard.html";
        }
    } catch (err) {
        showToast(err.message, "danger");
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const phone = document.getElementById("reg-phone").value;
    const password = document.getElementById("reg-password").value;
    const role = document.getElementById("reg-role").value;
    
    try {
        const response = await fetch("http://localhost:8000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password, role })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Registration failed. Try again.");
        }
        
        showToast("Registration successful! Please login with your details.", "success");
        // Open Login form
        document.getElementById("register-form-container").style.display = "none";
        document.getElementById("login-form-container").style.display = "block";
    } catch (err) {
        showToast(err.message, "danger");
    }
}

// Cart Icon Badge Sync
function updateCartIconBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    
    // If logged in, fetch from API, otherwise count local items
    const token = localStorage.getItem("access_token");
    if (token) {
        apiFetch("/cart/")
            .then(cart => {
                const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);
                badge.textContent = count;
            })
            .catch(() => {
                badge.textContent = 0;
            });
    } else {
        // Fallback to local storage (unauthenticated checkout session helper)
        const localCart = JSON.parse(localStorage.getItem("local_cart") || "[]");
        const count = localCart.reduce((acc, item) => acc + item.quantity, 0);
        badge.textContent = count;
    }
}

// Light & Dark Theme Manager
function initTheme() {
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    showToast(`Switched to ${next} theme!`, "success");
}

// Internationalization Switcher (i18n)
function applyLanguage(lang) {
    localStorage.setItem("lang", lang);
    const trans = TRANSLATIONS[lang] || TRANSLATIONS.en;
    
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        if (trans[key]) {
            elem.textContent = trans[key];
        }
    });
}

function checkUrlAlerts() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("loggedout") === "true") {
        showToast("Session expired. Please login again.", "warning");
    }
}
