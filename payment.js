document.addEventListener('DOMContentLoaded', () => {
    initPaymentSummary();
    initPaymentMethodToggle();
    initPaymentForm();
});

/**
 * Loads order items from localStorage and calculates order totals
 */
function initPaymentSummary() {
    const summaryItemsContainer = document.getElementById('payment-summary-items');
    const subtotalLabel = document.getElementById('pay-subtotal');
    const shippingLabel = document.getElementById('pay-shipping');
    const totalLabel = document.getElementById('pay-total');

    if (!summaryItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem('iqiniso_cart')) || [];

    if (cart.length === 0) {
        summaryItemsContainer.innerHTML = '<p style="color: var(--text-muted);">No items in checkout.</p>';
        if (subtotalLabel) subtotalLabel.textContent = '₹0';
        if (shippingLabel) shippingLabel.textContent = '₹0';
        if (totalLabel) totalLabel.textContent = '₹0';
        return;
    }

    let subtotal = 0;
    summaryItemsContainer.innerHTML = '';

    cart.forEach(item => {
        subtotal += item.price * item.quantity;

        const itemMini = document.createElement('div');
        itemMini.className = 'summary-item-mini';
        itemMini.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h5>${item.name}</h5>
                <p>Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</p>
            </div>
            <strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
        `;
        summaryItemsContainer.appendChild(itemMini);
    });

    const shippingCost = subtotal >= 2999 ? 0 : 150;

    if (subtotalLabel) subtotalLabel.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (shippingLabel) shippingLabel.textContent = shippingCost === 0 ? 'FREE' : `₹${shippingCost}`;
    if (totalLabel) totalLabel.textContent = `₹${(subtotal + shippingCost).toLocaleString('en-IN')}`;
}

/**
 * Toggles payment input accordion based on radio selection
 */
function initPaymentMethodToggle() {
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const selectedMethod = e.target.value;
            
            document.querySelectorAll('.method-details').forEach(el => el.classList.remove('active'));
            
            const targetDetails = document.getElementById(`${selectedMethod}-details`);
            if (targetDetails) {
                targetDetails.classList.add('active');
            }
        });
    });
}

/**
 * Handles order submission and modal presentation
 */
function initPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm) return;

    paymentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Clear cart from local storage
        localStorage.removeItem('iqiniso_cart');

        // Show confirmation popup with random reference code
        const orderIdSpan = document.getElementById('order-id');
        const successModal = document.getElementById('success-modal');

        if (orderIdSpan) {
            orderIdSpan.textContent = Math.floor(100000 + Math.random() * 900000);
        }

        if (successModal) {
            successModal.classList.add('active');
        }
    });
}

