const fs = require('fs');
const cheerio = require('cheerio');

const files = ['shop.html', 'outlet.html'];
let products = [];
let idCounter = 1;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const html = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(html);

    $('.product-card').each((i, el) => {
        const category = $(el).attr('data-category') || '';
        const brand = $(el).attr('data-brand') || '';
        const image = $(el).find('img').attr('src') || '';
        const title = $(el).find('h3').text().trim() || '';
        let priceStr = $(el).find('.price').text().trim() || '';
        const priceSub = $(el).find('.price-sub').text().trim() || '';
        
        let price = 0;
        if (priceStr) {
            price = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
        }

        // Avoid exact duplicates
        const exists = products.find(p => p.name === title && p.image === image);
        if (!exists) {
            products.push({
                id: idCounter++,
                name: title,
                brand: brand,
                category: category,
                image: image,
                price: price,
                priceSub: priceSub,
                quantity: 10 // Default initial quantity
            });
        }
    });
});

fs.writeFileSync('data.json', JSON.stringify({ products }, null, 2));
console.log(`Migrated ${products.length} products to data.json`);
