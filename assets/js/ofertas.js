// ============================================
// HELPERS DEL SISTEMA DE OFERTAS
// ============================================
// Funciones reutilizables que usan index.html, catalogo.html y producto.html

/**
 * Devuelve el objeto de oferta para un producto dado su ID,
 * o null si el producto no está en oferta.
 * Lee el campo `descuento` directamente del producto en window.productos.
 * @param {number|string} productoId
 * @returns {{ id: number|string, descuento: number } | null}
 */
window.getOferta = function(productoId) {
    if (!window.productos) return null;
    const product = window.productos.find(p => p.id == productoId);
    return (product && product.descuento) ? { id: product.id, descuento: product.descuento } : null;
};

/**
 * Calcula el precio con descuento aplicado.
 * @param {number} precio - Precio original
 * @param {number} descuento - Porcentaje de descuento (0-100)
 * @returns {number}
 */
window.getPrecioConOferta = function(precio, descuento) {
    return precio * (1 - descuento / 100);
};

/**
 * Genera el HTML del badge de oferta.
 * @param {number} descuento
 * @returns {string}
 */
window.getBadgeOfertaHtml = function(descuento) {
    return `<span class="product-card__badge product-card__badge--sale">-${descuento}%</span>`;
};

/**
 * Genera el HTML del bloque de precios (con o sin oferta).
 * @param {number} precio - Precio original
 * @param {{ descuento: number } | null} oferta
 * @returns {string}
 */
window.getPrecioHtml = function(precio, oferta) {
    if (oferta) {
        const precioFinal = window.getPrecioConOferta(precio, oferta.descuento);
        return `
            <span class="product-card__price--original">$${precio.toFixed(2)}</span>
            <span class="product-card__price product-card__price--sale">$${precioFinal.toFixed(2)}</span>
        `;
    }
    return `<span class="product-card__price">$${precio.toFixed(2)}</span>`;
};

// ============================================
// HELPER PARA IMÁGENES DE CLOUDINARY
// ============================================
window.getCloudinaryUrl = function(localPath) {
    if (!localPath || localPath.trim() === '' || localPath.includes('placehold.co') || localPath.includes('placeholder')) {
        return 'assets/images/placeholder-product.png';
    }
    
    if (localPath.startsWith('http')) {
        return localPath;
    }
    
    // Extraer solo el nombre del archivo de la ruta local (ej. "assets/img/productos/taladro.jpg" -> "taladro.jpg")
    const parts = localPath.split('/');
    const filename = parts[parts.length - 1];
    
    // Retornar la ruta base de Cloudinary concatenada con el archivo
    return `https://res.cloudinary.com/difupdvvq/image/upload/v1778899676/${filename}`;
};
