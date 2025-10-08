// === Автоматична генерація sitemap.xml для InstruForge ===
const fs = require("fs");
const path = require("path");

// Масив усіх JSON-файлів з товарами
const productFiles = [
  "public/products1.json",
  "public/products2.json",
  "public/products3.json",
  "public/products4.json",
  "public/products5.json"
];

let allProducts = [];

// Зчитуємо товари з кожного файлу
for (const file of productFiles) {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    allProducts = allProducts.concat(data);
  }
}

// Формуємо URL для кожного товару
const urls = allProducts.map(p => `
  <url>
    <loc>https://instruforge.web.app/product/${p.id}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>`);

// Генеруємо XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://instruforge.web.app/</loc>
    <priority>1.0</priority>
  </url>
  ${urls.join("\n")}
</urlset>`;

// Зберігаємо у public/sitemap.xml
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemap, "utf-8");
console.log(`✅ Sitemap generated successfully: ${allProducts.length} products`);