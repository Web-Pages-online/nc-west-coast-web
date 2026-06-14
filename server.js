const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
// Crear carpeta uploads si no existe
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Configuración de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (Frontend) para que toda la app corra en un solo puerto
app.use(express.static(__dirname));

// Helper to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return { products: [] };
    }
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Helpers for orders
const readOrders = () => {
    try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return { orders: [] };
    }
};

const writeOrders = (data) => {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
};

// GET all products
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// POST new product
app.post('/api/products', (req, res) => {
    const data = readData();
    const newProduct = {
        id: Date.now(), // Generate simple ID
        name: req.body.name || '',
        brand: req.body.brand || '',
        category: req.body.category || '',
        image: req.body.image || '',
        price: parseFloat(req.body.price) || 0,
        priceSub: req.body.priceSub || '',
        quantity: parseInt(req.body.quantity) || 0
    };
    data.products.push(newProduct);
    writeData(data);
    res.status(201).json(newProduct);
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const index = data.products.findIndex(p => p.id === id);
    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...req.body, id };
        writeData(data);
        res.json(data.products[index]);
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const newData = data.products.filter(p => p.id !== id);
    if (newData.length !== data.products.length) {
        data.products = newData;
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

// POST bulk update by prefix
app.post('/api/products/bulk', (req, res) => {
    const { prefix, price, quantity } = req.body;
    if (!prefix) return res.status(400).json({ error: "Prefix is required" });
    
    const data = readData();
    const lowerPrefix = prefix.toLowerCase();
    let updatedCount = 0;

    data.products = data.products.map(p => {
        const match = (p.name && p.name.toLowerCase().includes(lowerPrefix)) || 
                      (p.brand && p.brand.toLowerCase() === lowerPrefix) ||
                      (p.category && p.category.toLowerCase() === lowerPrefix);
        
        if (match) {
            updatedCount++;
            return {
                ...p,
                price: price !== undefined ? parseFloat(price) : p.price,
                quantity: quantity !== undefined ? parseInt(quantity) : p.quantity
            };
        }
        return p;
    });

    writeData(data);
    res.json({ success: true, updatedCount });
});

// --- ORDERS & TRACKING ENDPOINTS ---

// POST checkout (Create order and discount inventory)
app.post('/api/checkout', (req, res) => {
    const { cart, total, customerName, customerPhone } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    const data = readData();
    const ordersData = readOrders();
    
    // 1. Discount inventory
    cart.forEach(item => {
        // We find product by name since cart uses name currently
        const product = data.products.find(p => p.name === item.nombre);
        if (product && product.quantity > 0) {
            // Subtract but don't go below 0
            product.quantity = Math.max(0, product.quantity - item.cantidad);
        }
    });

    // Save updated inventory
    writeData(data);

    // 2. Create Order
    const folio = "NC" + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
        id: Date.now(),
        folio: folio,
        customerName: customerName || 'Sin Nombre',
        customerPhone: customerPhone || 'Sin Teléfono',
        date: new Date().toISOString(),
        items: cart,
        total: total,
        status: 'Procesando', // Procesando, Enviado, Entregado
        trackingNumber: ''
    };

    ordersData.orders.push(newOrder);
    writeOrders(ordersData);

    res.json({ success: true, folio: folio, order: newOrder });
});

// GET all orders (Admin)
app.get('/api/orders', (req, res) => {
    const ordersData = readOrders();
    res.json(ordersData.orders);
});

// PUT update order status/tracking (Admin)
app.put('/api/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status, trackingNumber, carrier } = req.body;
    
    const ordersData = readOrders();
    const index = ordersData.orders.findIndex(o => o.id === id);
    
    if (index !== -1) {
        if (status) ordersData.orders[index].status = status;
        if (trackingNumber !== undefined) ordersData.orders[index].trackingNumber = trackingNumber;
        if (carrier !== undefined) ordersData.orders[index].carrier = carrier;
        writeOrders(ordersData);
        res.json(ordersData.orders[index]);
    } else {
        res.status(404).json({ error: "Order not found" });
    }
});

// GET track order by folio (Public)
app.get('/api/track/:folio', (req, res) => {
    const folio = req.params.folio.toUpperCase();
    const ordersData = readOrders();
    const order = ordersData.orders.find(o => o.folio === folio);
    
    if (order) {
        res.json({
            folio: order.folio,
            date: order.date,
            status: order.status,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            totalItems: order.items.reduce((acc, item) => acc + item.cantidad, 0)
        });
    } else {
        res.status(404).json({ error: "Folio no encontrado" });
    }
});

// GET real-time tracking events (MOCK for now)
app.get('/api/track/realtime/:folio', (req, res) => {
    const folio = req.params.folio.toUpperCase();
    const ordersData = readOrders();
    const order = ordersData.orders.find(o => o.folio === folio);
    
    if (!order) return res.status(404).json({ error: "Folio no encontrado" });
    
    // MOCK DATA: En el futuro aquí hacemos un `fetch` a la API de Skydropx o Envia.com
    // usando la order.carrier y order.trackingNumber
    
    // Generar timeline ficticio basado en el status
    let events = [];
    const dateCreated = new Date(order.date);
    
    events.push({
        status: "Recibido",
        description: "Tu pedido ha sido recibido y está siendo preparado.",
        date: dateCreated.toLocaleString(),
        completed: true
    });
    
    if (order.status === "Procesando") {
        events.push({
            status: "Preparando",
            description: "Estamos empacando tus artículos con cariño.",
            date: "Procesando actualmente...",
            completed: false
        });
    } else if (order.status === "Enviado" || order.status === "Entregado") {
        const dateShipped = new Date(dateCreated.getTime() + 86400000); // +1 dia
        events.push({
            status: "En Camino",
            description: `Tu paquete viaja con ${order.carrier || 'paquetería'}. Guía: ${order.trackingNumber || 'Pendiente'}`,
            date: dateShipped.toLocaleString(),
            completed: true
        });
        
        if (order.status === "Entregado") {
            const dateDelivered = new Date(dateShipped.getTime() + 172800000); // +2 dias
            events.push({
                status: "Entregado",
                description: "¡El paquete ha sido entregado exitosamente!",
                date: dateDelivered.toLocaleString(),
                completed: true
            });
        }
    }

    res.json({
        folio: order.folio,
        status: order.status,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
        events: events
    });
});

// POST upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se subió ninguna imagen" });
    }
    // Retornar la ruta relativa
    res.json({ imagePath: 'uploads/' + req.file.filename });
});

// Serve static files
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
