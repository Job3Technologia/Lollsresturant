let cart = JSON.parse(localStorage.getItem('lollys_cart')) || [];

function addToCart(id, name, price, qty = 1) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ id, name, price, quantity: qty });
    }
    updateCart();
    showToast(`${name} added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    // Dispatch event for UI updates
    window.dispatchEvent(new Event('cart-updated'));
}

function updateItemQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCart();
            window.dispatchEvent(new Event('cart-updated'));
        }
    }
}

function getCartTotal() {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

function updateCart() {
    localStorage.setItem('lollys_cart', JSON.stringify(cart));
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    const countEl = document.getElementById('cart-count');
    const floatCountEl = document.getElementById('cart-count-float');
    
    if (countEl) countEl.textContent = count;
    if (floatCountEl) floatCountEl.textContent = count;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'glass-panel';
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 30px;
        padding: 15px 25px; color: var(--text-dark); background: white; z-index: 3000;
        border-left: 4px solid var(--accent-orange);
        box-shadow: var(--shadow-lg);
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
        display: flex; align-items: center;
    `;
    toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success); margin-right: 10px;"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        document.getElementById('cart-content').style.display = 'none';
        document.getElementById('empty-cart').style.display = 'block';
        return;
    }

    document.getElementById('cart-content').style.display = 'grid';
    document.getElementById('empty-cart').style.display = 'none';

    container.innerHTML = cart.map(item => `
        <div class="cart-item" style="display: flex; gap: 20px; padding: 24px; background: white; border-radius: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm); align-items: center;">
            <div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--accent-orange);">
                <i class="fas fa-utensils"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="font-size: 1.1rem; margin-bottom: 4px;">${item.name}</h4>
                <p style="color: var(--accent-orange); font-weight: 700;">R${item.price.toFixed(2)}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 6px 12px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <button onclick="updateItemQuantity(${item.id}, -1)" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px;"><i class="fas fa-minus"></i></button>
                <span style="font-weight: 700; min-width: 24px; text-align: center;">${item.quantity}</span>
                <button onclick="updateItemQuantity(${item.id}, 1)" style="background: none; border: none; cursor: pointer; color: var(--accent-orange); padding: 4px;"><i class="fas fa-plus"></i></button>
            </div>
            <div style="text-align: right; min-width: 100px;">
                <p style="font-weight: 800; font-size: 1.1rem;">R${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ef4444; font-size: 0.85rem; cursor: pointer; margin-top: 4px; font-weight: 600;">Remove</button>
            </div>
        </div>
    `).join('');

    updateSummary();
}

function updateSummary() {
    const subtotal = getCartTotal();
    const serviceFee = 5.00;
    const total = subtotal + serviceFee;

    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `R${total.toFixed(2)}`;
}

// Update initial DOMContentLoaded to also render items if on cart page
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
});

window.addEventListener('cart-updated', renderCartItems);
