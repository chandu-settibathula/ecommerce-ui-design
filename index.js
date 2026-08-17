document.addEventListener('DOMContentLoaded', () => {
    // Simple search forward routing engine
    const searchForm = document.getElementById('home-search-form');
    if(searchForm) {
        searchForm.addEventListener('submit', (e) => {
            const val = searchForm.querySelector('input').value.trim();
            if(!val) e.preventDefault();
        });
    }
});