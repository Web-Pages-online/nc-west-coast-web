const fs = require('fs');
const cheerio = require('cheerio');

const files = ['index.html', 'shop.html', 'outlet.html', 'encargos.html'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const html = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(html);

    // 1. Reconstruir el Header
    const activeLink = file.replace('.html', '');
    
    const newHeader = `
    <header>
        <ul class="nav-menu">
            <li><a href="index.html" class="nav-link ${activeLink === 'index' ? 'active' : ''}" onclick="closeMenu()">Inicio</a></li>
            <li><a href="outlet.html" class="nav-link ${activeLink === 'outlet' ? 'active' : ''}" onclick="closeMenu()">Outlet</a></li>
            <li><a href="shop.html" class="nav-link ${activeLink === 'shop' ? 'active' : ''}" onclick="closeMenu()">Cosmeticos</a></li>
            <li><a href="encargos.html" class="nav-link ${activeLink === 'encargos' ? 'active' : ''}" onclick="closeMenu()">Encarga</a></li>
        </ul>

        <a href="index.html" class="logo-center">
            <img src="bolso.png" alt="NC Logo" class="logo-img">
        </a>

        <div class="header-actions">
            <button class="theme-toggle-btn" id="theme-toggle" title="Modo Oscuro/Claro">
                <i class="fa-solid fa-moon"></i>
            </button>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </header>
    `;
    
    $('header').replaceWith(newHeader);

    // 2. Reemplazar los filtros en Shop/Outlet por Dropdowns
    if (file === 'shop.html' || file === 'outlet.html') {
        const newFilters = `
        <div class="filters-wrapper">
            <div class="custom-select">
                <select id="category-filter">
                    <option value="all">Todas las Categorías</option>
                    <option value="cremas">Cremas</option>
                    <option value="mist">Mist</option>
                    <option value="geles">Geles</option>
                    <option value="duos">Duos</option>
                    <option value="gloss">Gloss</option>
                    <option value="jabon">Jabones</option>
                    <option value="bolso">Bolsos / Sobaqueras</option>
                </select>
            </div>
            <div class="custom-select">
                <select id="brand-filter">
                    <option value="all">Todas las Marcas</option>
                    <option value="victoria-secret">Victoria's Secret</option>
                    <option value="pink">PINK</option>
                    <option value="bbw">B&BW</option>
                    <option value="eos">EOS</option>
                    <option value="coach">Coach</option>
                </select>
            </div>
        </div>
        `;

        $('.filter-menu').replaceWith(newFilters);
        $('.brand-toggles').remove();
    }

    fs.writeFileSync(file, $.html());
    console.log(`Patched ${file}`);
});
