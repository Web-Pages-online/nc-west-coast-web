const fs = require('fs');

const appendCode = `

// --- CARGA DINÁMICA DE PRODUCTOS (INVENTARIO) ---
async function cargarInventarioTienda() {
    const grid = document.getElementById('dynamic-products-grid');
    if (!grid) return;

    try {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();
        
        grid.innerHTML = '';
        if (products.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; color:#666;">No hay productos disponibles por el momento.</p>';
            return;
        }

        products.forEach(p => {
            if (p.quantity <= 0) return; // No mostrar sin stock
            
            grid.innerHTML += \`
            <div class="product-card" data-category="\${p.category}" data-brand="\${p.brand}">
                <div class="product-image">
                    <img src="\${p.image}" alt="\${p.name}" class="clickable-image" onerror="this.src='bolso.png'">
                    <button class="quick-view">Vista Rápida</button>
                </div>
                <div class="product-info">
                    <span class="category">\${p.category}</span>
                    <h3>\${p.name}</h3>
                    <div class="price-row">
                        <span class="price">$\${p.price} MXN</span>
                    </div>
                    \${p.priceSub ? \`<span class="price-sub">\${p.priceSub}</span>\` : ''}
                    <button class="add-cart-btn" onclick="agregarAlCarrito('\${p.name.replace(/'/g, "\\\\'")}', '\${p.price}', '\${p.image}')">AGREGAR AL CARRITO</button>
                </div>
            </div>
            \`;
        });
        
        // Re-aplicar filtros
        if(window.aplicarFiltrosGlobal) {
            window.aplicarFiltrosGlobal();
        }

    } catch (err) {
        console.error("Error cargando inventario:", err);
        grid.innerHTML = '<p style="text-align:center; width:100%;">No se pudo cargar el inventario. Asegúrate de que el servidor esté corriendo.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarInventarioTienda();
});
`;

fs.appendFileSync('script.js', appendCode);
console.log('Appended to script.js');
