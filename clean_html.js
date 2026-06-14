const fs = require('fs');
const cheerio = require('cheerio');

const files = ['shop.html', 'outlet.html'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const html = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(html);

    // Empty the products-grid
    $('.products-grid').empty();
    $('.products-grid').attr('id', 'dynamic-products-grid');

    fs.writeFileSync(file, $.html());
    console.log(`Cleaned ${file}`);
});
