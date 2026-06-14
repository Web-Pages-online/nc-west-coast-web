const API_URL = '/api/products';
let allProducts = [];

// Helper para mostrar alertas usando SweetAlert2
function showAlert(message) {
    Swal.fire({
        text: message,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}

// Lógica de Tabs
function switchTab(tabId) {
    document.querySelectorAll('.module').forEach(m => {
        m.classList.remove('active');
        m.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const activeModule = document.getElementById(`module-${tabId}`);
    activeModule.classList.add('active');
    activeModule.style.display = 'block';
    
    document.getElementById(`btn-${tabId}`).classList.add('active');
    
    // Recargar datos dinámicamente al cambiar de pestaña
    if (tabId === 'pedidos' || tabId === 'envios') {
        loadOrders();
    } else if (tabId === 'inventario') {
        loadInventory();
    }
}

// Cargar Inventario
async function loadInventory() {
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json();
        renderTable(allProducts);
        document.getElementById('totalProducts').innerText = allProducts.length;
        updateDataLists(allProducts);
    } catch (err) {
        console.error("Error al cargar inventario:", err);
        showAlert("Error de conexión con el servidor.");
    }
}

// Actualizar Datalists y Filtros dinámicamente
function updateDataLists(products) {
    const brands = [...new Set(products.map(p => p.brand).filter(b => b))].sort();
    const categories = [...new Set(products.map(p => p.category).filter(c => c))].sort();
    
    // Datalists de Alta de Producto
    const brandList = document.getElementById('brandList');
    const categoryList = document.getElementById('categoryList');
    if(brandList) brandList.innerHTML = brands.map(b => `<option value="${b}">`).join('');
    if(categoryList) categoryList.innerHTML = categories.map(c => `<option value="${c}">`).join('');

    // Filtros de la Tabla
    const filterBrand = document.getElementById('filterBrand');
    const filterCategory = document.getElementById('filterCategory');
    if(filterBrand) {
        filterBrand.innerHTML = '<option value="">Todas las Marcas</option>' + brands.map(b => `<option value="${b}">${b.toUpperCase()}</option>`).join('');
    }
    if(filterCategory) {
        filterCategory.innerHTML = '<option value="">Todas las Categorías</option>' + categories.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
    }
}

// Renderizar tabla
function renderTable(products) {
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';
    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" class="product-img-thumb" onerror="this.onerror=null; this.src='bolso.png';"></td>
            <td><strong>${p.name}</strong><br><small style="color:var(--text-muted);">ID: ${p.id}</small></td>
            <td><span style="background:#eef2f5; color:#475569; padding:4px 8px; border-radius:4px; font-size:0.85em; font-weight:600; text-transform:uppercase;">${p.brand}</span></td>
            <td style="color:var(--text-main); font-weight:600;">$${p.price}</td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <input type="number" value="${p.quantity}" style="width: 70px; padding: 8px; border:1px solid var(--border-color); border-radius:6px; font-family:'Outfit';" id="qty-${p.id}">
                    <button onclick="updateQty(${p.id})" style="padding: 8px 12px; width:auto; font-size: 0.9em; background:var(--gold-accent); border-radius:6px;" title="Guardar cantidad"><i class="fa-solid fa-save"></i></button>
                </div>
            </td>
            <td>
                <div style="display:flex; gap: 5px;">
                    <button style="background: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;" onclick="editProduct(${p.id})" title="Editar"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-danger" onclick="deleteProduct(${p.id})" title="Dar de baja"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Guardar Producto (Alta)
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('addName').value,
        brand: document.getElementById('addBrand').value.toLowerCase(),
        category: document.getElementById('addCategory').value.toLowerCase(),
        image: document.getElementById('addImage').value,
        price: parseFloat(document.getElementById('addPrice').value),
        quantity: parseInt(document.getElementById('addQty').value)
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showAlert("Producto dado de alta correctamente.");
            resetForm();
            loadInventory();
        }
    } catch (err) {
        console.error("Error guardando:", err);
    }
});

function resetForm() {
    document.getElementById('productForm').reset();
    
    const preview = document.getElementById('imagePreview');
    const dText = document.getElementById('dropZoneText');
    if(preview) preview.style.display = 'none';
    if(dText) dText.style.display = 'block';
    document.getElementById('addImage').value = '';
}

// Función para cargar los datos en el modal para editar
function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('editModalId').value = product.id;
    document.getElementById('editName').value = product.name || '';
    document.getElementById('editBrand').value = product.brand || '';
    document.getElementById('editCategory').value = product.category || '';
    document.getElementById('editPrice').value = product.price || 0;
    document.getElementById('editQty').value = product.quantity || 0;
    
    // Cargar imagen en el modal
    const editImageInput = document.getElementById('editImage');
    const editImagePreview = document.getElementById('editImagePreview');
    const editDropZoneText = document.getElementById('editDropZoneText');
    
    editImageInput.value = product.image || '';
    if (product.image) {
        editImagePreview.src = product.image;
        editImagePreview.style.display = 'block';
        if(editDropZoneText) editDropZoneText.style.display = 'none';
    } else {
        editImagePreview.style.display = 'none';
        if(editDropZoneText) editDropZoneText.style.display = 'block';
    }
    
    // Mostrar modal
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Guardar Cambios (Edición)
document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editModalId').value;
    
    const productData = {
        name: document.getElementById('editName').value,
        brand: document.getElementById('editBrand').value.toLowerCase(),
        category: document.getElementById('editCategory').value.toLowerCase(),
        image: document.getElementById('editImage').value,
        price: parseFloat(document.getElementById('editPrice').value),
        quantity: parseInt(document.getElementById('editQty').value)
    };

    try {
        const response = await fetch(`${API_URL}/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showAlert("Producto actualizado correctamente.");
            closeEditModal();
            loadInventory();
        }
    } catch (err) {
        console.error("Error actualizando:", err);
    }
});

// Baja de Producto
async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar (dar de baja) este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert("Producto eliminado correctamente.");
            loadInventory();
        }
    } catch (err) {
        console.error("Error eliminando:", err);
    }
}

// Actualizar Cantidad Individual
async function updateQty(id) {
    const qtyInput = document.getElementById(`qty-${id}`).value;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: parseInt(qtyInput) })
        });
        if (response.ok) {
            showAlert("Cantidad actualizada.");
            loadInventory();
        }
    } catch (err) {
        console.error("Error actualizando cantidad:", err);
    }
}



// Buscador y Filtros Combinados
function filterInventory() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('filterBrand') ? document.getElementById('filterBrand').value.toLowerCase() : '';
    const category = document.getElementById('filterCategory') ? document.getElementById('filterCategory').value.toLowerCase() : '';

    const filtered = allProducts.filter(p => {
        const matchesTerm = (p.name && p.name.toLowerCase().includes(term)) || (p.brand && p.brand.toLowerCase().includes(term));
        const matchesBrand = brand === '' || (p.brand && p.brand.toLowerCase() === brand);
        const matchesCategory = category === '' || (p.category && p.category.toLowerCase() === category);
        
        return matchesTerm && matchesBrand && matchesCategory;
    });
    
    renderTable(filtered);
}

document.getElementById('searchInput').addEventListener('input', filterInventory);
if(document.getElementById('filterBrand')) document.getElementById('filterBrand').addEventListener('change', filterInventory);
if(document.getElementById('filterCategory')) document.getElementById('filterCategory').addEventListener('change', filterInventory);

// --- Lógica Drag & Drop para Imágenes ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const dropZoneText = document.getElementById('dropZoneText');
const addImageInput = document.getElementById('addImage');

if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#1a1a1a';
        dropZone.style.background = '#eef2f5';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--gold-accent)';
        dropZone.style.background = '#fafbfc';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--gold-accent)';
        dropZone.style.background = '#fafbfc';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0], false);
        }
    });
}

const editDropZone = document.getElementById('editDropZone');
const editFileInput = document.getElementById('editFileInput');
const editImagePreview = document.getElementById('editImagePreview');
const editDropZoneText = document.getElementById('editDropZoneText');
const editImageInput = document.getElementById('editImage');

if (editDropZone) {
    editDropZone.addEventListener('click', () => editFileInput.click());

    editDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        editDropZone.style.borderColor = '#1a1a1a';
        editDropZone.style.background = '#eef2f5';
    });

    editDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        editDropZone.style.borderColor = 'var(--gold-accent)';
        editDropZone.style.background = '#fafbfc';
    });

    editDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        editDropZone.style.borderColor = 'var(--gold-accent)';
        editDropZone.style.background = '#fafbfc';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0], true);
        }
    });

    editFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0], true);
        }
    });
}

async function handleFileUpload(file, isEdit = false) {
    if (!file.type.startsWith('image/')) {
        showAlert('Por favor, sube solo imágenes.');
        return;
    }
    
    // Vista previa inmediata
    const reader = new FileReader();
    reader.onload = (e) => {
        if (isEdit) {
            editImagePreview.src = e.target.result;
            editImagePreview.style.display = 'block';
            editDropZoneText.style.display = 'none';
        } else {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            dropZoneText.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);

    // Subir al servidor
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            if (isEdit) {
                editImageInput.value = data.imagePath;
            } else {
                addImageInput.value = data.imagePath;
            }
            showAlert('Imagen cargada y procesada con éxito.');
        } else {
            if (data.imageUrl) {
                if (isEdit) {
                    editImageInput.value = data.imageUrl;
                } else {
                    addImageInput.value = data.imageUrl;
                }
            }
        }
    } catch (err) {
        console.error("Error subiendo imagen:", err);
        showAlert("Error al subir la imagen");
    }
}

// Init
loadInventory();
loadOrders();

// --- LÓGICA DE PEDIDOS (ORDERS) ---
window.allOrders = [];

async function loadOrders() {
    try {
        const res = await fetch('/api/orders');
        window.allOrders = await res.json();
        populateDateFilters(window.allOrders);
        renderPedidosCards(window.allOrders);
        renderEnviosTable(window.allOrders);
    } catch (err) {
        console.error("Error cargando pedidos:", err);
    }
}

function populateDateFilters(orders) {
    const monthSelect = document.getElementById('filterMonth');
    const daySelect = document.getElementById('filterDay');
    if (!monthSelect || !daySelect) return;

    const months = new Set();
    const days = new Set();

    orders.forEach(o => {
        if (!o.date) return;
        const d = new Date(o.date);
        if (!isNaN(d)) {
            // Guardamos el formato YYYY-MM para el mes
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthStr);
            // Guardamos el día del mes
            days.add(d.getDate());
        }
    });

    // Guardar selecciones actuales
    const currentMonth = monthSelect.value;
    const currentDay = daySelect.value;

    monthSelect.innerHTML = '<option value="">Todos los Meses</option>';
    Array.from(months).sort().forEach(m => {
        const [year, month] = m.split('-');
        const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleString('es-ES', { month: 'long' });
        monthSelect.innerHTML += `<option value="${m}">${monthName.toUpperCase()} ${year}</option>`;
    });

    daySelect.innerHTML = '<option value="">Todos los Días</option>';
    Array.from(days).sort((a,b) => a - b).forEach(d => {
        daySelect.innerHTML += `<option value="${d}">Día ${d}</option>`;
    });

    // Restaurar selecciones
    if (currentMonth) monthSelect.value = currentMonth;
    if (currentDay) daySelect.value = currentDay;
}

function filterOrders() {
    const monthVal = document.getElementById('filterMonth').value;
    const dayVal = document.getElementById('filterDay').value;
    
    let filtered = window.allOrders;

    if (monthVal || dayVal) {
        filtered = window.allOrders.filter(o => {
            if (!o.date) return false;
            const d = new Date(o.date);
            if (isNaN(d)) return false;

            const oMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const oDay = d.getDate().toString();

            const matchMonth = !monthVal || oMonth === monthVal;
            const matchDay = !dayVal || oDay === dayVal;

            return matchMonth && matchDay;
        });
    }

    renderEnviosTable(filtered);
    
    // Desmarcar "Seleccionar todo"
    const selectAllCheckbox = document.getElementById('selectAllOrders');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
}

function renderPedidosCards(orders) {
    console.log("Generando tarjetas de pedidos. Total:", orders.length);
    const container = document.getElementById('pedidosCardsContainer');
    if (!container) {
        console.error("CRITICAL: pedidosCardsContainer NO EXISTE EN EL HTML!");
        return;
    }
    container.innerHTML = '';
    
    // Sort by newest first
    orders.sort((a, b) => b.id - a.id).forEach(o => {
        const d = new Date(o.date).toLocaleString();
        const totalItems = o.items.reduce((acc, i) => acc + i.cantidad, 0);
        
        const customerName = o.customerName || 'Sin Nombre';
        const customerPhone = o.customerPhone || 'Sin Teléfono';

        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-card-header">
                <div>
                    <span class="folio-badge"><i class="fa-solid fa-receipt"></i> ${o.folio}</span>
                    ${o.type === 'Encargo Personalizado' ? '<span style="background: var(--gold-accent); color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.7em; margin-left: 10px;">ENCARGO</span>' : ''}
                    <p class="order-date">${d}</p>
                </div>
                <div class="order-total">
                    ${isNaN(parseFloat(o.total)) ? o.total : '$' + o.total.toLocaleString()}
                </div>
            </div>
            <div class="order-card-body">
                <div class="customer-info">
                    <strong><i class="fa-solid fa-user"></i> ${customerName}</strong>
                    <a href="https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-link"><i class="fa-brands fa-whatsapp"></i> ${customerPhone}</a>
                </div>
                <div class="items-count">
                    <i class="fa-solid fa-box"></i> ${totalItems} artículos
                </div>
            </div>
            <div class="order-card-footer">
                <button onclick="openOrderModal(${o.id})" class="view-order-btn"><i class="fa-solid fa-eye"></i> Ver Productos</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderEnviosTable(orders) {
    const tbody = document.getElementById('enviosTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    orders.sort((a, b) => b.id - a.id).forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="order-checkbox" value="${o.id}" style="transform: scale(1.2); cursor: pointer;"></td>
            <td><strong>${o.folio}</strong></td>
            <td>
                <select id="carrier-${o.id}" style="padding: 5px; border-radius: 4px; border: 1px solid var(--border-color);">
                    <option value="" ${!o.carrier ? 'selected' : ''}>Ninguna</option>
                    <option value="FedEx" ${o.carrier === 'FedEx' ? 'selected' : ''}>FedEx</option>
                    <option value="DHL" ${o.carrier === 'DHL' ? 'selected' : ''}>DHL</option>
                    <option value="Estafeta" ${o.carrier === 'Estafeta' ? 'selected' : ''}>Estafeta</option>
                    <option value="Skydropx" ${o.carrier === 'Skydropx' ? 'selected' : ''}>Skydropx</option>
                </select>
            </td>
            <td>
                <input type="text" id="track-${o.id}" value="${o.trackingNumber || ''}" placeholder="Ej. FEDEX123" style="padding: 5px; width: 120px; border-radius: 4px; border: 1px solid var(--border-color);">
            </td>
            <td>
                <select id="status-${o.id}" style="padding: 5px; border-radius: 4px; border: 1px solid var(--border-color);">
                    <option value="Procesando" ${o.status === 'Procesando' ? 'selected' : ''}>Procesando</option>
                    <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                    <option value="Entregado" ${o.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                </select>
            </td>
            <td>
                <button onclick="updateOrder(${o.id})" style="padding: 6px 12px; width:auto; font-size: 0.85em; background:var(--gold-accent); border-radius:6px;" title="Guardar Envío">Guardar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openOrderModal(id) {
    const order = window.allOrders.find(o => o.id === id);
    if (!order) return;
    
    document.getElementById('orderDetailTitle').innerText = `Pedido ${order.folio}`;
    const tbody = document.getElementById('orderDetailItems');
    tbody.innerHTML = '';
    
    order.items.forEach(item => {
        const isNotNumeric = isNaN(parseFloat(item.precio));
        const subtotal = isNotNumeric ? 'A cotizar' : (item.precio * item.cantidad);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap: 10px;">
                    <img src="${item.imagen}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                    <span>${item.nombre}</span>
                </div>
            </td>
            <td>${isNotNumeric ? item.precio : '$' + parseFloat(item.precio).toLocaleString()}</td>
            <td>${item.cantidad}</td>
            <td><strong>${isNotNumeric ? 'A cotizar' : '$' + subtotal.toLocaleString()}</strong></td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('orderDetailModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderDetailModal').classList.remove('active');
}

async function updateOrder(id) {
    const status = document.getElementById(`status-${id}`).value;
    const trackingNumber = document.getElementById(`track-${id}`).value;
    const carrier = document.getElementById(`carrier-${id}`).value;
    
    try {
        const res = await fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, trackingNumber, carrier })
        });
        if (res.ok) {
            showAlert("Rastreo actualizado exitosamente.");
            loadOrders();
        }
    } catch (err) {
        console.error("Error actualizando pedido:", err);
    }
}

function toggleSelectAllOrders() {
    const selectAll = document.getElementById('selectAllOrders');
    const checkboxes = document.querySelectorAll('.order-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

async function bulkMarkAsShipped() {
    const checkboxes = document.querySelectorAll('.order-checkbox:checked');
    if (checkboxes.length === 0) {
        Swal.fire('Atención', 'Selecciona al menos un pedido para marcar como enviado.', 'warning');
        return;
    }

    const confirm = await Swal.fire({
        title: '¿Confirmar Envío Masivo?',
        text: `Se marcarán ${checkboxes.length} pedidos como "Enviado".`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, marcar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    let successCount = 0;
    
    // Mostramos loading
    Swal.fire({
        title: 'Actualizando pedidos...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    for (let cb of checkboxes) {
        const id = parseInt(cb.value);
        // Obtenemos los datos actuales de la fila por si tenían tracking
        const trackingNumber = document.getElementById(`track-${id}`).value;
        const carrier = document.getElementById(`carrier-${id}`).value;
        
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Enviado', trackingNumber, carrier })
            });
            if (res.ok) successCount++;
        } catch (err) {
            console.error("Error actualizando pedido " + id, err);
        }
    }

    Swal.fire('¡Listo!', `Se actualizaron ${successCount} pedidos correctamente.`, 'success');
    loadOrders();
}

