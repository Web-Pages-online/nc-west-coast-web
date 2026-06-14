/* =========================================
   SISTEMA DE CONTROL DE ERRORES (BLINDAJE)
   ========================================= */
const safeExecute = (fn) => {
    try { fn(); } catch (e) { console.warn("Módulo saltado: ", e.message); }
};

document.addEventListener('DOMContentLoaded', () => {

    // 1. PRELOADER (Carga Segura)
    safeExecute(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('loaded');
                setTimeout(() => { preloader.style.display = 'none'; }, 500);
            }, 1000);
        }
    });

    // 2. MENÚ MÓVIL
    safeExecute(() => {
        const hamburger = document.querySelector(".hamburger");
        const navMenu = document.querySelector(".nav-menu");
        if (hamburger && navMenu) {
            hamburger.onclick = () => {
                hamburger.classList.toggle("active");
                navMenu.classList.toggle("active");
            };
        }
    });

    // 3. MOTOR DE FILTRADO (SOLUCIÓN DEFINITIVA)
    safeExecute(() => {
        let filtroCat = 'all';
        let filtroMarca = 'all';

        const aplicarFiltros = () => {
            const cards = document.querySelectorAll('.product-card');
            cards.forEach(card => {
                const cardCat = (card.getAttribute('data-category') || "").toLowerCase().trim();
                const cardMarca = (card.getAttribute('data-brand') || "all").toLowerCase().trim();
                
                const esBag = filtroCat === 'bag' && (cardCat.includes('bolso') || cardCat.includes('sobaquera') || cardCat.includes('bag'));
                const esReloj = filtroCat === 'relojes' && cardCat.includes('reloj');
                const matchCat = (filtroCat === 'all' || cardCat === filtroCat || esBag || esReloj);
                
                const esVS = (filtroMarca === 'victoria-secret' || filtroMarca.includes('victoria')) && (cardMarca.includes('victoria') || cardMarca === 'vs');
                const matchMarca = (filtroMarca === 'all' || cardMarca === filtroMarca || esVS);

                if (matchCat && matchMarca) {
                    card.style.setProperty('display', 'block', 'important');
                    card.style.opacity = "1";
                    card.style.visibility = "visible";
                } else {
                    card.style.setProperty('display', 'none', 'important');
                }
            });
        };
        window.aplicarFiltrosGlobal = aplicarFiltros;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filtroCat = btn.getAttribute('data-filter').toLowerCase();
                aplicarFiltros();
            };
        });

        document.querySelectorAll('input[name="brand"]').forEach(radio => {
            radio.onchange = () => {
                filtroMarca = radio.value.toLowerCase();
                aplicarFiltros();
            };
        });
    });

    // 4. VISTA RÁPIDA UNIVERSAL (REPARADA PARA PRODUCTOS Y COLLAGES)
    safeExecute(() => {
        const imgModal = document.getElementById("imageModal");
        const modalImg = document.getElementById("img01");

        // Carrusel
        const slides = document.querySelectorAll('.slide');
        if (slides.length > 0) {
            let current = 0;
            setInterval(() => {
                slides[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
            }, 5000);
        }

        // Delegación de eventos para Abrir y Cerrar Imagen
        document.addEventListener('click', (e) => {
            const isQuickView = e.target.classList.contains('quick-view');
            const isClickable = e.target.classList.contains('clickable-image');
            const isCollageImg = e.target.closest('.collage-grid') && e.target.tagName === 'IMG';

            if (isQuickView || isClickable || isCollageImg) {
                if (imgModal && modalImg) {
                    const src = (isQuickView) 
                        ? e.target.closest('.product-card').querySelector('img').src 
                        : e.target.src;

                    modalImg.src = src;
                    imgModal.style.display = "flex"; 
                    setTimeout(() => imgModal.classList.add('show'), 20);
                }
            }

            if (e.target.classList.contains('close-modal') || e.target === imgModal) {
                if (imgModal) {
                    imgModal.classList.remove('show');
                    setTimeout(() => { imgModal.style.display = "none"; }, 300);
                }
            }
        });
    });

    // 5. ANIMACIONES REVEAL SCROLL
    window.onscroll = () => {
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 50) {
                el.classList.add('active');
            }
        });
    };

    // 6. LÓGICA ACORDEÓN DE MARCAS (OPTIMIZADA PARA MÓVILES)
    safeExecute(() => {
        const brandToggles = document.querySelectorAll('.brand-toggle');
        
        brandToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const item = toggle.parentElement;
                
                document.querySelectorAll('.brand-item').forEach(i => {
                    if (i !== item) {
                        i.classList.remove('active');
                    }
                });
                
                item.classList.toggle('active');
                
                if(item.classList.contains('active')) {
                    setTimeout(() => {
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 300);
                }
            });
        });
    });

    // 7. CONTROL DEL CARRUSEL (AUTOMÁTICO + MANUAL)
    safeExecute(() => {
        const slides = document.querySelectorAll('.slide');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        
        if (slides.length === 0) return;

        let current = 0;
        let timer;

        const showSlide = (index) => {
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
            current = index;
            resetTimer();
        };

        const nextSlide = () => {
            let next = (current + 1) % slides.length;
            showSlide(next);
        };

        const prevSlide = () => {
            let prev = (current - 1 + slides.length) % slides.length;
            showSlide(prev);
        };

        const resetTimer = () => {
            clearInterval(timer);
            timer = setInterval(nextSlide, 5000);
        };

        if (nextBtn) nextBtn.onclick = () => nextSlide();
        if (prevBtn) prevBtn.onclick = () => prevSlide();

        resetTimer();
    });

    // Inicializar visualización del carrito al cargar
    actualizarInterfazCarrito();
});

// --- LÓGICA DE LA CANASTA NC WEST COAST ---

// 1. Inicialización
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : '';
let carrito = JSON.parse(localStorage.getItem('nc_cart')) || [];

// 2. Función para agregar productos con animación
function agregarAlCarrito(nombre, precio, imagen, maxQty = 99) {
    const precioNumerico = precio.replace(/[^0-9.]/g, "");
    
    // Buscamos si el producto ya existe en la canasta
    const productoExistente = carrito.find(item => item.nombre === nombre);

    if (productoExistente) {
        // Si ya existe, verificamos el stock
        if (productoExistente.cantidad >= maxQty) {
            alert(`Lo sentimos, el límite de stock para este producto es de ${maxQty} unidades.`);
            return;
        }
        productoExistente.cantidad += 1;
    } else {
        // Si es nuevo, lo agregamos con cantidad 1
        if (maxQty <= 0) {
            alert("Este producto se encuentra agotado.");
            return;
        }
        const nuevoProducto = { 
            nombre: nombre, 
            precio: precioNumerico, 
            imagen: imagen, 
            id: Date.now(),
            cantidad: 1,
            maxQty: parseInt(maxQty)
        };
        carrito.push(nuevoProducto);
    }
    
    localStorage.setItem('nc_cart', JSON.stringify(carrito));
    actualizarInterfazCarrito();
    animarIconoCarrito();
}

// 3. Actualizar la vista del carrito y el contador (CON CANTIDADES)
function actualizarInterfazCarrito() {
    const container = document.getElementById('cart-items-container');
    const countLabel = document.getElementById('cart-count');
    const totalLabel = document.getElementById('cart-total');
    
    if(!container) return;

    if (carrito.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #999; padding: 20px;">Tu canasta está vacía</p>`;
        if(countLabel) {
            countLabel.innerText = "0";
            countLabel.style.display = 'none';
        }
        if(totalLabel) totalLabel.innerText = "$0.00";
        return;
    }

    container.innerHTML = "";
    let totalItems = 0;
    let precioTotal = 0;

    carrito.forEach((item, index) => {
        const subtotal = parseFloat(item.precio) * item.cantidad;
        precioTotal += subtotal;
        totalItems += item.cantidad;
        
        container.innerHTML += `
            <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                <img src="${item.imagen}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 15px;">
                <div style="flex: 1;">
                    <div style="font-size: 0.9rem; font-weight: 600; color: #333;">${item.nombre}</div>
                    <div style="color: #bfa37e; font-size: 0.85rem;">
                        ${item.cantidad} x $${parseFloat(item.precio).toLocaleString()}
                    </div>
                </div>
                <button onclick="eliminarDelCarrito(${index})" style="background: none; border: none; color: #ff5e5e; cursor: pointer; font-size: 1.1rem; padding: 5px;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    if(countLabel) {
        countLabel.innerText = totalItems;
        countLabel.style.display = 'flex';
    }
    if(totalLabel) totalLabel.innerText = `$${precioTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

// 4. Eliminar producto
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('nc_cart', JSON.stringify(carrito));
    actualizarInterfazCarrito();
}

// 5. Mostrar/Ocultar Modal del Carrito
function toggleCartModal() {
    const modal = document.getElementById('modalCarrito');
    if (modal.style.display === "flex") {
        modal.style.display = "none";
    } else {
        modal.style.display = "flex";
        actualizarInterfazCarrito();
    }
}

// 6. Animación de sacudida (Shake)
function animarIconoCarrito() {
    const icon = document.getElementById('cart-icon');
    if(icon) {
        icon.animate([
            { transform: 'translate(0, 0) rotate(0deg)' },
            { transform: 'translate(-5px, 0) rotate(-10deg)' },
            { transform: 'translate(5px, 0) rotate(10deg)' },
            { transform: 'translate(-5px, 0) rotate(-10deg)' },
            { transform: 'translate(5px, 0) rotate(10deg)' },
            { transform: 'translate(0, 0) rotate(0deg)' }
        ], {
            duration: 500,
            easing: 'ease-in-out'
        });
    }
}

// Removed duplicated function

// --- CARGA DINÁMICA DE PRODUCTOS (INVENTARIO) ---
async function cargarInventarioTienda() {
    const grid = document.getElementById('dynamic-products-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const products = await response.json();
        
        grid.innerHTML = '';
        if (products.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; color:#666;">No hay productos disponibles por el momento.</p>';
            return;
        }

        products.forEach(p => {
            if (p.quantity <= 0) return; // No mostrar sin stock
            
            grid.innerHTML += `
            <div class="product-card" data-category="${p.category}" data-brand="${p.brand}">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}" class="clickable-image" onerror="this.src='bolso.png'">
                </div>
                <div class="product-info">
                    <span class="category">${p.category}</span>
                    <h3>${p.name}</h3>
                    <div class="price-row">
                        <span class="price">$${p.price} MXN</span>
                    </div>
                    ${p.priceSub ? `<span class="price-sub">${p.priceSub}</span>` : ''}
                    <button class="add-cart-btn" onclick="agregarAlCarrito('${p.name.replace(/'/g, "\\'")}', '${p.price}', '${p.image}')">AGREGAR AL CARRITO</button>
                </div>
            </div>
            `;
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


// --- MODO OSCURO / CLARO ---
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn ? themeBtn.querySelector('i') : null;

    // Se eliminó el manejador redundante del menú hamburguesa porque ya existe arriba.

    // Definir globalmente para los onclick de HTML
    window.closeMenu = function() {
        if (navMenu) navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    };
    
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
                if (icon) {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (icon) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            }
        });
    }
});

// 7. GENERADOR DE TICKET VISUAL PREMIUM CON REINICIO
async function generarTicketPDF() {
    if (carrito.length === 0) {
        alert("Agrega productos antes de generar el ticket.");
        return;
    }
    
    // Validar datos del cliente
    const cNameInput = document.getElementById('customerName');
    const cPhoneInput = document.getElementById('customerPhone');
    
    const customerName = cNameInput ? cNameInput.value.trim() : "";
    const customerPhone = cPhoneInput ? cPhoneInput.value.trim() : "";

    if (!customerName || !customerPhone) {
        alert("Por favor, completa tus datos (Nombre y Teléfono) para poder generar tu ticket y envío.");
        return;
    }

    // 1. Llamar al backend para hacer el checkout y obtener el folio oficial
    let checkoutData = null;
    try {
        const totalNum = parseFloat(document.getElementById('cart-total').innerText.replace(/[^0-9.]/g, ""));
        const reqBody = { 
            cart: carrito, 
            total: totalNum,
            customerName: cNameInput ? cNameInput.value.trim() : "Sin Nombre",
            customerPhone: cPhoneInput ? cPhoneInput.value.trim() : "Sin Teléfono"
        };
        const response = await fetch(`${API_BASE}/api/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });
        checkoutData = await response.json();
    } catch (err) {
        console.error("Error al procesar la orden:", err);
        alert("Hubo un error al conectar con el servidor. Tu orden no pudo procesarse.");
        return;
    }

    if (!checkoutData || !checkoutData.success) {
        alert("Error al procesar la orden.");
        return;
    }

    const folioOficial = checkoutData.folio;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const totalTxt = document.getElementById('cart-total').innerText;

    const logoImg = new Image();
    logoImg.src = 'NC.jpg';

    logoImg.onload = async function() {
        // --- DISEÑO DE CABECERA NC ---
        doc.setFillColor(249, 247, 242); 
        doc.rect(0, 0, 210, 50, 'F');
        doc.setDrawColor(191, 163, 126);
        doc.setLineWidth(1);
        doc.line(0, 50, 210, 50);

        doc.addImage(logoImg, 'JPEG', 15, 10, 30, 30);

        doc.setTextColor(191, 163, 126);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("NC WEST COAST", 50, 25);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text("SOLICITUD DE PEDIDO PERSONALIZADO", 50, 32);
        doc.text("ESTILO AMERICANO • DIRECTO A MÉXICO", 50, 37);

        doc.setFontSize(9);
        doc.text(new Date().toLocaleDateString(), 195, 20, { align: "right" });
        doc.text("FOLIO: " + folioOficial, 195, 26, { align: "right" });

        // --- LISTADO DE PRODUCTOS CON IMÁGENES ---
        let y = 65;
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("RESUMEN DE TU SELECCIÓN:", 20, y);
        y += 10;

        for (const item of carrito) {
            if (y > 240) { doc.addPage(); y = 20; }

            doc.setDrawColor(240, 240, 240);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(15, y, 180, 25, 3, 3, 'FD');

            // Imagen del producto
            try {
                const pImg = new Image();
                pImg.src = item.imagen;
                await new Promise((resolve) => {
                    pImg.onload = () => {
                        doc.addImage(pImg, 'JPEG', 20, y + 2, 20, 20); 
                        resolve();
                    };
                    pImg.onerror = () => resolve();
                });
            } catch (e) { console.error(e); }

            // Nombre del producto
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(item.nombre.toUpperCase(), 45, y + 8);
            
            // Cantidad y Precio Unitario
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`CANTIDAD: ${item.cantidad}`, 45, y + 14);
            doc.text(`PRECIO UNIT: $${parseFloat(item.precio).toLocaleString()} MXN`, 45, y + 20);

            // Subtotal por renglón (Derecha)
            const subtotalRenglon = parseFloat(item.precio) * item.cantidad;
            doc.setTextColor(191, 163, 126);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(`$${subtotalRenglon.toLocaleString()} MXN`, 190, y + 14, { align: "right" });

            y += 30;
        }

        if (y > 260) { doc.addPage(); y = 20; }
        
        doc.setFillColor(191, 163, 126);
        doc.rect(120, y, 75, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL: ${totalTxt}`, 125, y + 10);

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.text(`Toma nota de tu folio de seguimiento: ${folioOficial}`, 105, 280, { align: "center" });
        doc.text("Envíalo por Messenger para confirmar tu pedido.", 105, 285, { align: "center" });

        // Guardar PDF
        doc.save(`Ticket_${folioOficial}.pdf`);
        
        // --- PROCESO DE REINICIO ---
        alert(`¡Orden procesada y stock actualizado!\nFolio: ${folioOficial}\nTu carrito se vaciará y te llevaremos al chat.`);
        localStorage.removeItem('nc_cart'); 
        window.open("https://m.me/859771300559984", "_blank");
        location.reload(); 
    };
}

// --- CARGA DINÁMICA DE PRODUCTOS (INVENTARIO) ---
async function cargarInventarioTienda() {
    const grid = document.getElementById('dynamic-products-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const products = await response.json();
        
        grid.innerHTML = '';
        if (products.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; color:#666;">No hay productos disponibles por el momento.</p>';
            return;
        }

        products.forEach(p => {
            const isOutOfStock = p.quantity <= 0;
            const badgeHtml = isOutOfStock 
                ? `<span style="position: absolute; top: 10px; left: 10px; background: rgba(231, 76, 60, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; z-index: 2;"><i class="fa-solid fa-ban"></i> AGOTADO</span>`
                : `<span style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; z-index: 2;"><i class="fa-solid fa-box-open"></i> Disponibles: ${p.quantity}</span>`;
            
            const btnHtml = isOutOfStock
                ? `<button class="add-cart-btn" style="background: #ccc; cursor: not-allowed;" disabled>SIN STOCK</button>`
                : `<button class="add-cart-btn" onclick="agregarAlCarrito('${p.name.replace(/'/g, "\\'")}', '${p.price}', '${p.image}', ${p.quantity})">AGREGAR AL CARRITO</button>`;
            
            const opacityStyle = isOutOfStock ? `opacity: 0.6;` : ``;

            grid.innerHTML += `
            <div class="product-card" data-category="${p.category}" data-brand="${p.brand}" style="${opacityStyle}">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}" class="clickable-image" onerror="this.src='bolso.png'">
                    ${badgeHtml}
                </div>
                <div class="product-info">
                    <span class="category">${p.category}</span>
                    <h3>${p.name}</h3>
                    <div class="price-row">
                        <span class="price">$${p.price} MXN</span>
                    </div>
                    ${p.priceSub ? `<span class="price-sub">${p.priceSub}</span>` : ''}
                    ${btnHtml}
                </div>
            </div>
            `;
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

    // --- NUEVA LÓGICA DE FILTROS (ACORDEÓN UNIFICADO) ---
    const applyNewFilters = () => {
        // Encontrar el ÚNICO filtro activo
        const activeFilter = document.querySelector('.filter-option.active');
        if (!activeFilter) return;

        const selectedCat = (activeFilter.getAttribute('data-cat') || 'all').toLowerCase();
        const selectedBrand = (activeFilter.getAttribute('data-brand') || 'all').toLowerCase();

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

    // Reemplazar el filtro global para el inventario dinámico
    window.aplicarFiltrosGlobal = applyNewFilters;

    // Colapsar menú de filtros automáticamente en móviles al cargar
    if (window.innerWidth <= 900) {
        document.querySelectorAll('.filter-content').forEach(fc => fc.classList.remove('show'));
        document.querySelectorAll('.filter-toggle').forEach(ft => ft.classList.remove('active'));
    }

    // --- LÓGICA DE INTERACCIÓN DEL MENÚ ACORDEÓN JERÁRQUICO ---
    // 1. Manejar el toggle principal superior (Filtros)
    const toggles = document.querySelectorAll('.filter-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content) {
                content.classList.toggle('show');
            }
        });
    });

    // 2. Manejar clics en las opciones de filtro (Categorías y Marcas anidadas)
    const options = document.querySelectorAll('.filter-option');
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar burbujeo

            // Desmarcar todos los activos
            document.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
            // Activar el seleccionado
            this.classList.add('active');

            if (this.classList.contains('has-children')) {
                // Es una categoría padre. Alternamos la flechita y mostramos sus hijos
                this.classList.toggle('expanded');
                const subContent = this.nextElementSibling;
                
                // Opcional: Cerrar los demás acordeones anidados al abrir uno nuevo
                document.querySelectorAll('.nested-content').forEach(nc => {
                    if (nc !== subContent) nc.classList.remove('show');
                });
                document.querySelectorAll('.has-children').forEach(hc => {
                    if (hc !== this) hc.classList.remove('expanded');
                });

                if (subContent && subContent.classList.contains('nested-content')) {
                    subContent.classList.toggle('show');
                }
            } else {
                // Si hacemos clic en una submarca o en "Todo el catálogo", no tiene hijos.
                // Si es una submarca, podemos querer que su contenedor siga abierto, no cerramos nada.
                if (this.classList.contains('sub')) {
                    // Mantener abierto su contenedor padre si se hace clic en una sub-marca
                    const parentContent = this.closest('.nested-content');
                    if (parentContent) parentContent.classList.add('show');
                    
                    const parentToggle = parentContent.previousElementSibling;
                    if (parentToggle && parentToggle.classList.contains('has-children')) {
                        parentToggle.classList.add('expanded');
                    }
                } else {
                    // Clic en "Todo el catálogo": podemos cerrar todos los sub-menús anidados para limpiar la vista
                    document.querySelectorAll('.nested-content').forEach(nc => nc.classList.remove('show'));
                    document.querySelectorAll('.has-children').forEach(hc => hc.classList.remove('expanded'));
                }
            }

            // Ejecutar el filtrado
            if (typeof window.aplicarFiltrosGlobal === 'function') {
                window.aplicarFiltrosGlobal();
            }
        });
    });
});
