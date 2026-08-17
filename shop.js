document.addEventListener('DOMContentLoaded', () => {
    // --- Elements & Data Initialization ---
    const catalogGrid = document.getElementById('catalog-grid');
    const products = catalogGrid ? Array.from(catalogGrid.querySelectorAll('.product-card-container')) : [];
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const priceRangeInput = document.getElementById('price-range');
    const priceLimitLabel = document.getElementById('price-limit');
    const sortSelect = document.getElementById('sort-select');
    const searchBars = document.querySelectorAll('.search-wrapper input');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const fallbackMessage = document.getElementById('no-products-fallback');
    const countDesktop = document.getElementById('count-desktop');
    const countMobile = document.getElementById('count-mobile');

    const mobileFilterTrigger = document.getElementById('mobile-filter-trigger');
    const closeFiltersBtn = document.getElementById('close-filters');
    const filterSidebar = document.getElementById('filter-sidebar');

    const productDatabase = products.length > 0 ? products.map(el => ({
        id: el.getAttribute('data-id'),
        name: el.querySelector('.product-name').textContent.trim(),
        category: el.getAttribute('data-category') || '',
        price: parseFloat(el.getAttribute('data-price')),
        img: el.querySelector('.product-card img')?.src || ''
    })) : [
        { id: 'prod-1', name: 'ASIAN Mens Everest-02 Sports Trekking Shoes', category: 'trekking', price: 1099, img: 'images/men/ASIAN Men\'s Everest-02 Sports Trekking & Hiking,Walking Shoes.jpg' },
        { id: 'prod-2', name: 'BACCA BUCCI Mens Lace Up Hiking Shoe', category: 'trekking', price: 1699, img: 'images/men/Bacca Bucci Men Lace Up Hiking Shoe.jpg' },
        { id: 'prod-3', name: 'BACCA BUCCI Mens Lace Up Running Shoes', category: 'trekking', price: 1499, img: 'images/men/Bacca Bucci Men Lace Up Running Shoes.jpg' },
        { id: 'prod-10', name: 'HUSH PUPPIES Mens Lace-up Formal Shoes', category: 'formals', price: 1799, img: 'images/men/Hush Puppies Men\'s Lace-up Formal Shoes.jpg' },
        { id: 'prod-16', name: 'PUMA Mens Dazzler Sneaker', category: 'sneakers', price: 1599, img: 'images/men/Puma Mens Dazzler Sneaker.jpg' },
        { id: 'prod-15', name: 'PUMA Mens Popcat 20 RES Slide', category: 'slides', price: 799, img: 'images/men/Puma Men Popcat 20 RES Slide.jpg' }
    ];

    const popularTags = ['Puma', 'Boots', 'Loafers', 'Running', 'Formals', 'Slides'];

    // --- Fuzzy Search / Typo Tolerance Engine ---
    
    // Calculate difference between two strings
    function getLevenshteinDistance(a, b) {
        const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // Check if a single token fuzzy matches any target word
    function tokenFuzzyMatch(token, targetWords) {
        token = token.toLowerCase();
        const maxErrors = token.length > 4 ? 2 : 1; // Allow up to 2 typos for longer words

        return targetWords.some(word => {
            word = word.toLowerCase();
            // Direct match or partial string match
            if (word.includes(token) || token.includes(word)) return true;
            // Fuzzy distance match
            const distance = getLevenshteinDistance(token, word);
            return distance <= maxErrors;
        });
    }

    // Main multi-token fuzzy matching logic
    function matchesSearchQuery(name, category, query) {
        if (!query) return true;

        const queryTokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        // Combine product name and category into words to check against
        const targetWords = `${name} ${category}`.split(/\s+/).filter(Boolean);

        // Every search word typed by user must fuzzy-match at least one word in the product
        return queryTokens.every(token => tokenFuzzyMatch(token, targetWords));
    }

    // --- Smart Filter Function ---
    function filterProducts() {
        if (!catalogGrid) return;

        const activeSearchBar = document.getElementById('shop-search') || document.querySelector('.search-wrapper input');
        const checkedCategories = Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const maxPrice = priceRangeInput ? parseFloat(priceRangeInput.value) : Infinity;
        const searchQuery = activeSearchBar ? activeSearchBar.value.trim() : '';
        let activeItemCount = 0;

        products.forEach(product => {
            const category = product.getAttribute('data-category');
            const price = parseFloat(product.getAttribute('data-price'));
            const name = product.querySelector('.product-name').textContent;

            const matchesCategory = checkedCategories.length === 0 || checkedCategories.includes(category);
            const matchesPrice = price <= maxPrice;
            const matchesSearch = matchesSearchQuery(name, category, searchQuery);

            if (matchesCategory && matchesPrice && matchesSearch) {
                product.style.display = 'flex';
                activeItemCount++;
            } else {
                product.style.display = 'none';
            }
        });

        if (countDesktop) countDesktop.textContent = activeItemCount;
        if (countMobile) countMobile.textContent = activeItemCount;
        if (fallbackMessage) fallbackMessage.style.display = activeItemCount === 0 ? 'block' : 'none';
    }

    // --- Autocomplete Dropdown ---
    searchBars.forEach(input => {
        const wrapper = input.closest('.search-wrapper');
        if (!wrapper) return;

        let dropdown = wrapper.querySelector('.search-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-dropdown';
            wrapper.appendChild(dropdown);
        }

        let clearBtn = wrapper.querySelector('.search-clear-icon');
        if (!clearBtn) {
            clearBtn = document.createElement('span');
            clearBtn.className = 'search-clear-icon';
            clearBtn.innerHTML = '<ion-icon name="close-circle"></ion-icon>';
            wrapper.appendChild(clearBtn);
        }

        function renderDropdown() {
            const query = input.value.trim();
            clearBtn.style.display = query ? 'flex' : 'none';

            if (!query) {
                dropdown.innerHTML = `
                    <div class="search-tags-header">Popular Searches</div>
                    <div class="search-tags-list">
                        ${popularTags.map(tag => `<span class="search-tag">${tag}</span>`).join('')}
                    </div>
                `;
                dropdown.classList.add('active');
                return;
            }

            const results = productDatabase.filter(p => matchesSearchQuery(p.name, p.category, query)).slice(0, 5);

            if (results.length === 0) {
                dropdown.innerHTML = `<div class="search-no-match">No products found for "${query}"</div>`;
            } else {
                dropdown.innerHTML = results.map(item => `
                    <a href="shop.html?search=${encodeURIComponent(item.name)}" class="search-dropdown-item">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="item-details">
                            <span class="item-title">${item.name}</span>
                            <span class="item-price">₹${item.price.toLocaleString('en-IN')}</span>
                        </div>
                    </a>
                `).join('') + `
                    <a href="shop.html?search=${encodeURIComponent(query)}" class="search-view-all">
                        View all results for "${query}" →
                    </a>
                `;
            }
            dropdown.classList.add('active');
        }

        input.addEventListener('focus', renderDropdown);
        input.addEventListener('input', () => {
            renderDropdown();
            filterProducts();
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            filterProducts();
            renderDropdown();
            input.focus();
        });

        dropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-tag')) {
                input.value = e.target.textContent;
                if (window.location.pathname.includes('shop.html')) {
                    filterProducts();
                    dropdown.classList.remove('active');
                } else {
                    window.location.href = `shop.html?search=${encodeURIComponent(e.target.textContent)}`;
                }
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            document.querySelectorAll('.search-dropdown').forEach(d => d.classList.remove('active'));
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const shopSearchInput = document.getElementById('shop-search');
    if (searchParam && shopSearchInput) {
        shopSearchInput.value = searchParam;
    }

    // --- Sorting & Reset Functions ---
    function sortProducts() {
        if (!catalogGrid) return;
        const sortValue = sortSelect.value;
        const sortedProducts = [...products].sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price'));
            const priceB = parseFloat(b.getAttribute('data-price'));
            return sortValue === 'price-low' ? priceA - priceB : sortValue === 'price-high' ? priceB - priceA : 0;
        });
        sortedProducts.forEach(product => catalogGrid.appendChild(product));
    }

    function clearAllFilters() {
        categoryCheckboxes.forEach(cb => cb.checked = false);
        if (priceRangeInput) {
            priceRangeInput.value = priceRangeInput.max;
            priceLimitLabel.textContent = `₹${Number(priceRangeInput.max).toLocaleString('en-IN')}`;
        }
        searchBars.forEach(sb => sb.value = '');
        if (sortSelect) sortSelect.value = 'featured';
        filterProducts();
        sortProducts();
    }

    if (categoryCheckboxes.length > 0) categoryCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));
    if (priceRangeInput) {
        priceRangeInput.addEventListener('input', (e) => {
            priceLimitLabel.textContent = `₹${parseFloat(e.target.value).toLocaleString('en-IN')}`;
            filterProducts();
        });
    }
    if (sortSelect) sortSelect.addEventListener('change', sortProducts);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);

    filterProducts();

    if (mobileFilterTrigger && closeFiltersBtn && filterSidebar) {
        mobileFilterTrigger.addEventListener('click', () => filterSidebar.classList.add('active'));
        closeFiltersBtn.addEventListener('click', () => filterSidebar.classList.remove('active'));
    }

    // Cart and Saved Items
    document.querySelectorAll('.add-to-cart-btn, .add-to-cart-icon').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = button.closest('.product-card-container');
            const id = container.getAttribute('data-id');
            const name = container.querySelector('.product-name').textContent;
            const price = parseFloat(container.getAttribute('data-price'));
            const imageSrc = container.querySelector('.product-card img').src;

            let cart = JSON.parse(localStorage.getItem('iqiniso_cart')) || [];
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, image: imageSrc, quantity: 1 });
            }
            localStorage.setItem('iqiniso_cart', JSON.stringify(cart));
            
            button.style.backgroundColor = '#22c55e';
            if (button.classList.contains('add-to-cart-btn')) button.textContent = 'Added to Cart';
            setTimeout(() => { 
                button.style.backgroundColor = ''; 
                if (button.classList.contains('add-to-cart-btn')) button.textContent = 'Add to Cart';
            }, 1000);
        });
    });

    document.querySelectorAll('.add-to-saved-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = button.closest('.product-card-container');
            const id = container.getAttribute('data-id');
            const name = container.querySelector('.product-name').textContent;
            const price = parseFloat(container.getAttribute('data-price'));
            const imageSrc = container.querySelector('.product-card img').src;

            let saved = JSON.parse(localStorage.getItem('iqiniso_saved')) || [];
            if (!saved.some(item => item.id === id)) {
                saved.push({ id, name, price, image: imageSrc });
                localStorage.setItem('iqiniso_saved', JSON.stringify(saved));
            }
            
            button.style.backgroundColor = '#3b82f6';
            setTimeout(() => { button.style.backgroundColor = ''; }, 1000);
        });
    });
});