// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.promoCode = null;
        this.shippingCost = 0;
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.setupEventListeners();
        this.updateCartCount();
    }

    setupEventListeners() {
        // Apply promo code
        const applyPromoBtn = document.querySelector('.apply-promo-btn');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
        }

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.proceedToCheckout());
        }
    }

    addItem(productId, name, price, image) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: productId,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
        this.showNotification('Item added to cart!');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
        this.showNotification('Item removed from cart');
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
        } else {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartCount();
            }
        }
    }

    applyPromoCode() {
        const promoInput = document.querySelector('.promo-input input');
        const code = promoInput.value.trim().toUpperCase();
        
        if (code === 'ABOTYRA') {
            this.promoCode = code;
            this.updateCartDisplay();
            this.showNotification('Promo code applied successfully!');
            promoInput.value = '';
        } else {
            this.showNotification('Invalid promo code', 'error');
        }
    }

    calculateSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    calculateShipping() {
        const subtotal = this.calculateSubtotal();
        if (this.promoCode === 'ABOTYRA') {
            return 0; // Free shipping with promo code
        }
        return subtotal > 1000 ? 0 : 29.99;
    }

    calculateDiscount() {
        if (this.promoCode === 'ABOTYRA') {
            return this.calculateSubtotal() * 0.1; // 10% discount
        }
        return 0;
    }

    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping();
        const discount = this.calculateDiscount();
        return subtotal + shipping - discount;
    }

    updateCartDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const emptyCartMessage = document.querySelector('.empty-cart');
        const cartSummary = document.querySelector('.cart-summary');
        
        if (!cartItemsContainer || !emptyCartMessage || !cartSummary) return;

        if (this.items.length === 0) {
            cartItemsContainer.style.display = 'none';
            emptyCartMessage.style.display = 'block';
            cartSummary.style.display = 'none';
            return;
        }

        cartItemsContainer.style.display = 'block';
        emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';

        // Update cart items
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3 class="item-title">${item.name}</h3>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           onchange="cart.updateQuantity('${item.id}', this.value)">
                    <button class="quantity-btn plus" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item" onclick="cart.removeItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Update summary
        const subtotal = this.calculateSubtotal();
        const shipping = this.calculateShipping();
        const discount = this.calculateDiscount();
        const total = this.calculateTotal();

        document.querySelector('.subtotal-amount').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.shipping-amount').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
        document.querySelector('.discount-amount').textContent = `$${discount.toFixed(2)}`;
        document.querySelector('.total-amount').textContent = `$${total.toFixed(2)}`;
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.style.display = 'flex';
            } else {
                cartCount.style.display = 'none';
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    proceedToCheckout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        // Here you would typically redirect to a checkout page
        // For now, we'll just show a success message and clear the cart
        this.showNotification('Order placed successfully! Thank you for shopping with us.');
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
    }
}

// Initialize cart
const cart = new Cart();

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--gradient);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }

    .notification.error {
        background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    }
`;
document.head.appendChild(style);