const fs = require('fs');
const cheerio = require('cheerio');

const files = ['shop.html', 'outlet.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        const html = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(html);
        
        // Remover todos los marquee-container
        $('.marquee-container').remove();
        
        fs.writeFileSync(file, $.html());
        console.log(`Removed marquee from ${file}`);
    }
});
