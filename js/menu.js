let allMenuItems = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadMenuItems();
    
    // "All Items" filter
    const allBtn = document.querySelector('[data-filter="all"]');
    if(allBtn) {
        allBtn.addEventListener('click', () => {
            currentFilter = 'all';
            filterAndDisplay();
            updateActiveFilter(allBtn);
        });
    }

    // Search functionality
    const searchInput = document.getElementById('menu-search');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterAndDisplay(e.target.value.toLowerCase());
        });
    }
});

const MOCK_CATEGORIES = [
    { id: 1, name: 'Daily Special Meals' },
    { id: 2, name: 'Weekly Daily Specials' },
    { id: 3, name: 'Breakfast' },
    { id: 4, name: 'Gwinya Combos' },
    { id: 5, name: 'Zulu Burger Combos' },
    { id: 6, name: 'Kota Menu' },
    { id: 7, name: 'Wings' },
    { id: 8, name: 'Fried Chips' },
    { id: 9, name: 'Rolls' }
];

async function loadCategories() {
    try {
        let categories = await api.get('/menu/categories');
        
        if (!Array.isArray(categories) || categories.length === 0) {
             categories = MOCK_CATEGORIES;
        }

        const container = document.getElementById('category-filters');
        
        container.innerHTML = '';
        
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.textContent = cat.name;
            btn.style.cssText = `
                border-radius: 50px;
                padding: 12px 28px;
                font-size: 0.9rem;
                flex-shrink: 0;
            `;
            btn.onclick = (e) => {
                currentFilter = cat.id;
                filterAndDisplay();
                updateActiveFilter(e.currentTarget);
            };
            container.appendChild(btn);
        });
    } catch (error) {
        console.warn('Error loading categories, using mock:', error);
        // Fallback to mock
        const container = document.getElementById('category-filters');
        if (!container) return;
        container.innerHTML = '<button class="btn btn-secondary active" data-filter="all" style="border-radius: 50px; padding: 12px 28px; font-size: 0.9rem;">All Items</button>';
        MOCK_CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.textContent = cat.name;
            btn.style.cssText = `
                border-radius: 50px;
                padding: 12px 28px;
                font-size: 0.9rem;
                flex-shrink: 0;
            `;
            btn.onclick = (e) => {
                currentFilter = cat.id;
                filterAndDisplay();
                updateActiveFilter(e.currentTarget);
            };
            container.appendChild(btn);
        });
    }
}

const MOCK_MENU = [
    // Daily Special Meals (Category 1)
    { id: 1, category_id: 1, category_name: 'Daily Special Meals', name: 'Beef Curry', price: 81.00, description: 'Tender beef slow-cooked in aromatic spices', special_badge: 'Popular', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0001.jpg' },
    { id: 2, category_id: 1, category_name: 'Daily Special Meals', name: 'Chicken Curry', price: 81.00, description: 'Succulent chicken in a rich, spicy gravy', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0002.jpg' },
    
    // Weekly Daily Specials (Category 2)
    { id: 3, category_id: 2, category_name: 'Weekly Daily Specials', name: 'Monday Special: Mutton Curry', price: 88.00, description: 'Traditional mutton curry (Monday Only)', special_badge: 'Mon Special', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0003.jpg' },
    { id: 4, category_id: 2, category_name: 'Weekly Daily Specials', name: 'Tuesday Special: Chicken Biryani', price: 81.00, description: 'Fragrant basmati rice with spiced chicken (Tuesday Only)', special_badge: 'Tue Special', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0004.jpg' },
    { id: 5, category_id: 2, category_name: 'Weekly Daily Specials', name: 'Wednesday Special: Umgxabhiso', price: 81.00, description: 'Traditional tripe served with steam bread or pap (Wednesday Only)', special_badge: 'Wed Special', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0005.jpg' },
    { id: 6, category_id: 2, category_name: 'Weekly Daily Specials', name: 'Thursday Special: Isitambu', price: 81.00, description: 'Samp and beans with meat stew (Thursday Only)', special_badge: 'Thu Special', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0006.jpg' },

    // Breakfast (Category 3)
    { id: 7, category_id: 3, category_name: 'Breakfast', name: 'Classic Breakfast', price: 80.00, description: 'Eggs, bacon, toast, and grilled tomato', special_badge: 'Morning Only', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0007.jpg' },

    // Gwinya Combos (Category 4)
    { id: 8, category_id: 4, category_name: 'Gwinya Combos', name: 'Gwinya Vetkoek Combo', price: 7.00, description: 'Freshly fried traditional vetkoek', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0008.jpg' },
    { id: 9, category_id: 4, category_name: 'Gwinya Combos', name: 'Gwinya and Polony Combo', price: 10.00, description: 'Vetkoek filled with polony slices', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0009.jpg' },
    { id: 10, category_id: 4, category_name: 'Gwinya Combos', name: 'Gwinya and Cheese Combo', price: 12.00, description: 'Vetkoek filled with cheddar cheese', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0010.jpg' },
    { id: 11, category_id: 4, category_name: 'Gwinya Combos', name: 'Gwinya, Polony and Cheese Combo', price: 15.00, description: 'The ultimate breakfast mix', special_badge: 'Value', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0011.jpg' },
    { id: 12, category_id: 4, category_name: 'Gwinya Combos', name: 'Gwinya and Fried Chips Small Combo', price: 34.00, description: 'Vetkoek served with a side of small chips', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0012.jpg' },

    // Zulu Burger Combos (Category 5)
    { id: 13, category_id: 5, category_name: 'Zulu Burger Combos', name: 'Zulu Burger Combo', price: 22.00, description: 'Traditional seasoned patty on a fresh bun', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0013.jpg' },
    { id: 14, category_id: 5, category_name: 'Zulu Burger Combos', name: 'Zulu Burger with Polony Combo', price: 25.00, description: 'Zulu burger topped with polony', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0014.jpg' },
    { id: 15, category_id: 5, category_name: 'Zulu Burger Combos', name: 'Zulu Burger with Cheese and Polony Combo', price: 30.00, description: 'Fully loaded Zulu burger with cheese and polony', special_badge: 'Tasty', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0015.jpg' },

    // Kota Menu (Category 6)
    { id: 16, category_id: 6, category_name: 'Kota Menu', name: 'Kota 1', price: 37.00, description: 'Standard Kota with chips and polony', special_badge: null, is_available: true, image_url: 'Menu page images/IMG-20260314-WA0016.jpg' },
    { id: 17, category_id: 6, category_name: 'Kota Menu', name: 'Kota 2', price: 37.00, description: 'Kota with chips and vienna', special_badge: null, is_available: true },
    { id: 18, category_id: 6, category_name: 'Kota Menu', name: 'Kota 3', price: 44.00, description: 'Kota with chips, polony and cheese', special_badge: null, is_available: true },
    { id: 19, category_id: 6, category_name: 'Kota Menu', name: 'Kota 4', price: 59.00, description: 'Kota with chips, russian, cheese and egg', special_badge: 'Hungry?', is_available: true },
    { id: 20, category_id: 6, category_name: 'Kota Menu', name: 'Kota 5', price: 59.00, description: 'Kota with chips, beef patty, cheese and egg', special_badge: null, is_available: true },
    { id: 21, category_id: 6, category_name: 'Kota Menu', name: 'Last Number Kota', price: 81.00, description: 'The Legend: Fully loaded with everything', special_badge: 'Best Seller', is_available: true, image_url: 'Menu page images/IMG-20260314-WA0016.jpg' },

    // Wings (Category 7)
    { id: 22, category_id: 7, category_name: 'Wings', name: 'Fried Wings', price: 206.00, description: 'Platter of crispy fried wings', special_badge: 'Shareable', is_available: true },
    { id: 23, category_id: 7, category_name: 'Wings', name: 'Wings and Chips', price: 66.00, description: '6 Wings served with crispy chips', special_badge: null, is_available: true },

    // Fried Chips (Category 8)
    { id: 24, category_id: 8, category_name: 'Fried Chips', name: 'Fried Chips', price: 21.00, description: 'Golden crispy potato chips', special_badge: null, is_available: true },

    // Rolls (Category 9)
    { id: 25, category_id: 9, category_name: 'Rolls', name: 'Cheese Russian Roll', price: 44.00, description: 'Fresh roll with russian sausage and melted cheese', special_badge: null, is_available: true }
];

async function loadMenuItems() {
    try {
        // Try to fetch from API first
        allMenuItems = await api.get('/menu');
        
        // Use Mock Data if API returns empty or fails (for demo purposes)
        if (!Array.isArray(allMenuItems) || allMenuItems.length === 0) {
            console.warn('API returned empty or invalid data, using mock data for demo.');
            allMenuItems = MOCK_MENU;
        }
        
        filterAndDisplay();
    } catch (error) {
        console.warn('API fetch failed, using mock data for demo:', error);
        allMenuItems = MOCK_MENU;
        filterAndDisplay();
    }
}

function updateActiveFilter(activeBtn) {
    document.querySelectorAll('.menu-filters .btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function filterAndDisplay(searchTerm = '') {
    const content = document.getElementById('menu-content');
    content.innerHTML = ''; // Clear content
    
    let filtered = allMenuItems;

    // Filter logic
    if (currentFilter !== 'all') {
        filtered = filtered.filter(item => item.category_id === currentFilter);
    }
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Empty state
    if (filtered.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-muted);">No items found</h3>
                <p>Try adjusting your search or filter.</p>
            </div>`;
        return;
    }

    // Display Logic: Grouped vs Flat
    // If "All" is selected and no search term, show categorized sections
    if (currentFilter === 'all' && !searchTerm) {
        // Get unique categories present in filtered items
        const categoriesInItems = [...new Set(filtered.map(item => item.category_id))];
        // Sort categories by display order if we had that info, but here we just iterate
        // Ideally we should use the loaded categories list to ensure order
        
        // Fetch loaded categories again or rely on DOM/cache? 
        // Let's assume we can match IDs.
        // We'll just group by category ID.
        
        categoriesInItems.forEach(catId => {
            const catItems = filtered.filter(i => i.category_id === catId);
            const catName = catItems[0].category_name || 'Category'; // Backend sends category_name
            
            const section = document.createElement('div');
            section.className = 'menu-section';
            section.style.marginBottom = '60px';
            section.innerHTML = `
                <h2 style="margin-bottom: 20px; font-size: 1.4rem; border-left: 5px solid var(--accent-orange); padding-left: 15px;">${catName}</h2>
                <div class="cube-grid">
                    ${catItems.map(item => createCardHTML(item)).join('')}
                </div>
            `;
            content.appendChild(section);
        });
    } else {
        // Flat grid for specific category or search results
        const grid = document.createElement('div');
        grid.className = 'cube-grid';
        grid.innerHTML = filtered.map(item => createCardHTML(item)).join('');
        content.appendChild(grid);
    }
    
    // Re-run reveal animations
    if (window.reveal) reveal();
}

function createCardHTML(item) {
    const isSoldOut = !item.is_available;
    const imageSrc = item.image_url || `https://source.unsplash.com/400x300/?food,${item.name.replace(' ', ',')}`;
    
    return `
        <div class="cube-card ${isSoldOut ? 'sold-out' : ''}" data-reveal>
            ${isSoldOut ? `
                <div class="badge-sold-out">
                    <i class="fas fa-clock"></i>
                    <span>SOLD OUT</span>
                </div>` : ''}
            <div style="position: relative; height: 160px; overflow: hidden;">
                <img src="${imageSrc}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x300?text=${item.name}'">
                ${item.special_badge ? `<span style="position: absolute; bottom: 10px; left: 10px; background: var(--accent-orange); color: white; padding: 4px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${item.special_badge}</span>` : ''}
            </div>
            <div class="info">
                <div>
                    <h3 style="font-size: 0.95rem; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.name}">${item.name}</h3>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; height: 32px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${item.description || 'Authentic Durban flavor.'}</p>
                    <p class="price">R${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <button class="btn btn-primary btn-add" ${isSoldOut ? 'disabled' : ''} onclick="addToCart(${item.id}, '${item.name}', ${item.price})">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
        </div>
    `;
}

function adjustQty(btn, change) {
    const input = btn.parentElement.querySelector('input');
    let newVal = parseInt(input.value) + change;
    if (newVal < 1) newVal = 1;
    if (newVal > 10) newVal = 10;
    input.value = newVal;
}

function addToCartWithQty(btn, id, name, price) {
    const qty = parseInt(btn.parentElement.querySelector('input').value);
    // Call updated addToCart from cart.js which supports quantity
    if (typeof addToCart === 'function') {
        addToCart(id, name, price, qty);
    } else {
        console.error('addToCart function not found');
    }
}