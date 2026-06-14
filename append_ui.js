const fs = require('fs');

const appendJS = `

// --- MODO OSCURO / CLARO ---
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn ? themeBtn.querySelector('i') : null;
    
    // Cargar preferencia guardada
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });
    }

    // --- NUEVA LÓGICA DE FILTROS (DROPDOWNS) ---
    const catFilter = document.getElementById('category-filter');
    const brandFilter = document.getElementById('brand-filter');

    const applyNewFilters = () => {
        const selectedCat = catFilter ? catFilter.value.toLowerCase() : 'all';
        const selectedBrand = brandFilter ? brandFilter.value.toLowerCase() : 'all';

        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const cardCat = (card.getAttribute('data-category') || "").toLowerCase().trim();
            const cardBrand = (card.getAttribute('data-brand') || "all").toLowerCase().trim();

            const matchCat = (selectedCat === 'all' || cardCat.includes(selectedCat));
            const esVS = (selectedBrand === 'victoria-secret' || selectedBrand.includes('victoria')) && (cardBrand.includes('victoria') || cardBrand === 'vs');
            const matchBrand = (selectedBrand === 'all' || cardBrand === selectedBrand || esVS);

            if (matchCat && matchBrand) {
                card.style.setProperty('display', 'block', 'important');
                card.style.opacity = "1";
            } else {
                card.style.setProperty('display', 'none', 'important');
            }
        });
    };

    if (catFilter) catFilter.addEventListener('change', applyNewFilters);
    if (brandFilter) brandFilter.addEventListener('change', applyNewFilters);

    // Reemplazar el filtro global para el inventario dinámico
    window.aplicarFiltrosGlobal = applyNewFilters;
});
`;

fs.appendFileSync('script.js', appendJS);
console.log('Appended UI Logic to script.js');
