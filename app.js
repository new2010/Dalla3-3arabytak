// دلع عربيتك - الوظائف الرئيسية
// Main JavaScript functionality for the car accessories store

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize cart from localStorage
function initializeCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cart = [];
        }
    }
    updateCartCount();
}

// Add item to cart
function addToCart(product) {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
        // Item already exists, increase quantity
        cart[existingItemIndex].quantity += product.quantity || 1;
    } else {
        // New item
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity || 1
        });
    }
    
    saveCart();
    updateCartCount();
    showToast(MESSAGES.addedToCart, 'success');
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
}

// Update item quantity in cart
function updateCartQuantity(productId, newQuantity) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            cart[itemIndex].quantity = Math.min(newQuantity, 10); // Max quantity 10
        }
    }
    
    saveCart();
    updateCartCount();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart count display
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    const itemCount = getCartItemCount();
    
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = itemCount;
            element.style.display = itemCount > 0 ? 'flex' : 'none';
        }
    });
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        const response = await fetch(endpoint, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Get all products
async function fetchProducts() {
    return await apiRequest(`${API_BASE}?action=products`);
}

// Get single product
async function fetchProduct(productId) {
    return await apiRequest(`${API_BASE}?action=product&id=${productId}`);
}

// Submit order
async function submitOrderData(orderData) {
    return await apiRequest(`${API_BASE}?action=order`, {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

// Admin API calls
async function adminApiRequest(action, data) {
    return await apiRequest(`${API_BASE}?action=${action}`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Utility Functions
function formatPrice(price) {
    return `${price} ${STORE_CONFIG.currency}`;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function validatePhone(phone) {
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form validation helpers
function validateRequired(fields) {
    const errors = [];
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && !element.value.trim()) {
            errors.push(`${field.label} مطلوب`);
        }
    });
    
    return errors;
}

function showFormErrors(errors) {
    if (errors.length > 0) {
        showToast(errors[0], 'error');
        return true;
    }
    return false;
}

// Search and filter functionality
function filterProducts(products, filters) {
    return products.filter(product => {
        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const descMatch = (product.short_desc || '').toLowerCase().includes(searchTerm);
            const categoryMatch = (product.category || '').toLowerCase().includes(searchTerm);
            
            if (!nameMatch && !descMatch && !categoryMatch) {
                return false;
            }
        }
        
        // Category filter
        if (filters.category && product.category !== filters.category) {
            return false;
        }
        
        // Price range filter
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            const price = product.price;
            
            if (max) {
                if (price < min || price > max) return false;
            } else {
                if (price <= min) return false;
            }
        }
        
        return true;
    });
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// URL parameter helpers
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateUrlParameter(name, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(name, value);
    } else {
        url.searchParams.delete(name);
    }
    window.history.pushState({}, '', url);
}

// Loading state management
function setLoadingState(elementId, isLoading) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (isLoading) {
        element.disabled = true;
        element.classList.add('loading');
    } else {
        element.disabled = false;
        element.classList.remove('loading');
    }
}

// Image handling
function handleImageError(img) {
    img.style.display = 'none';
    const placeholder = img.parentElement.querySelector('.image-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
}

// Smooth scrolling
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Device detection
function isMobile() {
    return window.innerWidth <= 768;
}

function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

// Event listeners for common functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    
    // Close toast on click
    const toast = document.getElementById('toast');
    if (toast) {
        toast.addEventListener('click', function() {
            toast.classList.remove('show');
        });
    }
    
    // Handle form submissions with loading states
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                setLoadingState(submitBtn.id || 'submitBtn', true);
            }
        });
    });
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showToast('حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    showToast('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'error');
});

// Export functions for use in other scripts
window.CarStore = {
    // Cart functions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartItemCount,
    updateCartCount,
    
    // API functions
    fetchProducts,
    fetchProduct,
    submitOrderData,
    adminApiRequest,
    
    // Utility functions
    formatPrice,
    formatDate,
    validatePhone,
    validateEmail,
    showToast,
    filterProducts,
    
    // Storage functions
    saveToLocalStorage,
    loadFromLocalStorage,
    
    // UI functions
    setLoadingState,
    smoothScrollTo,
    
    // Device detection
    isMobile,
    isTablet
};

// Product quantity management for product pages
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    const currentValue = parseInt(quantityInput.value) || 1;
    const maxValue = parseInt(quantityInput.max) || 10;
    const minValue = parseInt(quantityInput.min) || 1;
    
    const newValue = currentValue + delta;
    
    if (newValue >= minValue && newValue <= maxValue) {
        quantityInput.value = newValue;
    }
}

// Auto-hide toast after delay
function autoHideToast(delay = 4000) {
    setTimeout(() => {
        const toast = document.getElementById('toast');
        if (toast && toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }, delay);
}

// Enhanced toast function with auto-hide
function showToast(message, type = 'success', autoHide = true) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    if (autoHide) {
        autoHideToast();
    }
}

// Print functionality
function printPage() {
    window.print();
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم النسخ بنجاح', 'success');
        }).catch(() => {
            showToast('فشل في النسخ', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('تم النسخ بنجاح', 'success');
        } catch (err) {
            showToast('فشل في النسخ', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format currency with proper Arabic number formatting
function formatCurrency(amount, currency = STORE_CONFIG.currency) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const formattedAmount = amount.toString().replace(/\d/g, (d) => arabicNumbers[d]);
    return `${formattedAmount} ${currency}`;
}

// Intersection Observer for lazy loading (if needed later)
function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

// Session storage helpers
function saveToSessionStorage(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to sessionStorage:', error);
    }
}

function loadFromSessionStorage(key) {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from sessionStorage:', error);
        return null;
    }
}

// Initialize app
console.log('دلع عربيتك - تم تحميل المتجر بنجاح');
console.log('Car Store initialized successfully');