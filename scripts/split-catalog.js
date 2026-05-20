/**
 * split-catalog.js
 * Lee data/productos.js y genera:
 *   data/cat/<categoria>.js   — productos de esa categoría
 *   data/catalog-index.js     — conteos por categoría y subcategoría (~15KB)
 *
 * Uso: node scripts/split-catalog.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const SRC     = path.join(ROOT, 'data', 'productos.js');
const OUT_DIR = path.join(ROOT, 'data', 'cat');
const INDEX   = path.join(ROOT, 'data', 'catalog-index.js');

// ── leer y evaluar el archivo fuente ───────────────────────────────────────
const code = fs.readFileSync(SRC, 'utf8').replace(/^const productos/, 'var productos');
const sandbox = {};
const fn = new Function('exports', code + '\nexports.p = productos;');
fn(sandbox);
const productos = sandbox.p;
console.log(`✓ Leídos ${productos.length} productos de data/productos.js`);

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── agrupar por categoría ──────────────────────────────────────────────────
const byCat = {};
productos.forEach(p => {
    const cat = (p.categoria_principal || 'varios').toLowerCase();
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(p);
});

// ── escribir archivos por categoría ───────────────────────────────────────
let totalKB = 0;
Object.entries(byCat).sort((a,b) => b[1].length - a[1].length).forEach(([cat, items]) => {
    const varName = `productos_${cat.replace(/[^a-z0-9]/g,'_')}`;
    // Usar window.X = [...] para que sea accesible via window[varName] tras carga dinámica
    // (const/let en script tags no se exponen en window)
    const content = `// Generado automáticamente — ${new Date().toISOString()}\n`
                  + `window.${varName} = ${JSON.stringify(items)};\n`;
    const filePath = path.join(OUT_DIR, `${cat}.js`);
    fs.writeFileSync(filePath, content, 'utf8');
    const kb = (fs.statSync(filePath).size / 1024).toFixed(1);
    totalKB += parseFloat(kb);
    console.log(`  data/cat/${cat}.js  →  ${items.length} prods  ${kb} KB`);
});

// ── construir índice de conteos ────────────────────────────────────────────
const counts = {};
Object.entries(byCat).forEach(([cat, items]) => {
    const subs = {};
    items.forEach(p => {
        const sub = (p.subcategoria || '').toLowerCase();
        if (sub) subs[sub] = (subs[sub] || 0) + 1;
    });
    counts[cat] = { total: items.length, subcategorias: subs };
});

const indexContent = `// Generado automáticamente — ${new Date().toISOString()}\n`
                   + `const catalogCounts = ${JSON.stringify(counts, null, 2)};\n`;
fs.writeFileSync(INDEX, indexContent, 'utf8');
const indexKB = (fs.statSync(INDEX).size / 1024).toFixed(1);

console.log(`\n✓ data/catalog-index.js  →  ${indexKB} KB`);
console.log(`✓ Total archivos partidos: ${totalKB.toFixed(0)} KB`);
console.log(`  (vs monolítico: ${(fs.statSync(SRC).size/1024).toFixed(0)} KB)`);
console.log('\n¡Listo! El catálogo está partido por categoría.');
