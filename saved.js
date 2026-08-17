document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('saved-items-list');

    function renderSaved() {
        const saved = JSON.parse(localStorage.getItem('iqiniso_saved')) || [];
        listContainer.innerHTML = '';

        if (saved.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: #666;">
                    <ion-icon name="bookmark-outline" style="font-size: 4rem; color: #ccc;"></ion-icon>
                    <h2>Your wishlist is empty</h2>
                    <p>Tap the save icon while exploring our collections.</p>
                </div>`;
            return;
        }

        saved.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'cart-item-row'; 
            row.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h4>${item.name}</h4>
                        <p class="item-unit-price">₹${item.price.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item-btn" onclick="removeSaved(${index})" aria-label="Remove"><ion-icon name="trash-outline"></ion-icon></button>
                </div>
            `;
            listContainer.appendChild(row);
        });
    }

    window.removeSaved = (index) => {
        let saved = JSON.parse(localStorage.getItem('iqiniso_saved')) || [];
        saved.splice(index, 1);
        localStorage.setItem('iqiniso_saved', JSON.stringify(saved));
        renderSaved();
    };

    renderSaved();
});