// API Gateway Integration Wrapper
const API_BASE_URL = "http://localhost:8000/api";

async function apiFetch(endpoint, options = {}) {
    // 1. Prepare Headers
    options.headers = options.headers || {};
    if (!(options.body instanceof FormData)) {
        options.headers["Content-Type"] = options.headers["Content-Type"] || "application/json";
    }
    
    // Inject access token if logged in
    const token = localStorage.getItem("access_token");
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        let response = await fetch(url, options);
        
        // 2. Intercept 401 Unauthorized to trigger token refresh
        if (response.status === 401) {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken && endpoint !== "/auth/refresh") {
                const refreshed = await attemptTokenRefresh(refreshToken);
                if (refreshed) {
                    // Retry original call with new token
                    options.headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`;
                    response = await fetch(url, options);
                } else {
                    // Refresh failed - logout user
                    handleLogoutRedirect();
                }
            }
        }
        
        if (response.status === 204) {
            return null;
        }
        
        const data = await response.json();
        if (!response.ok) {
            throw { status: response.status, message: data.detail || "Request failed" };
        }
        return data;
    } catch (error) {
        console.error("API Call Error:", error);
        throw error;
    }
}

async function attemptTokenRefresh(refreshToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_name", data.name);
            return true;
        }
    } catch (e) {
        console.error("Failed to refresh token:", e);
    }
    return false;
}

function handleLogoutRedirect() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    
    // Dispatch authentication status update
    window.dispatchEvent(new Event("auth-changed"));
    
    // Redirect if on auth-protected dashboard
    if (window.location.pathname.includes("dashboard.html")) {
        window.location.href = "index.html?loggedout=true";
    }
}
