// ============================================
// SISTEMA DE CARRITO DE COMPRAS
// ============================================

// Clase principal del carrito
class CarritoCompras {
    constructor() {
        this.carrito = this.cargarCarrito();
        this.inicializarEventListeners();
    }

    // ============================================
    // MÉTODOS PRINCIPALES
    // ============================================

    agregarProducto(producto, cantidad = 1) {
        // Aplicar precio con oferta si corresponde
        const oferta = window.getOferta ? window.getOferta(producto.id) : null;
        const precioFinal = oferta
            ? window.getPrecioConOferta(producto.precio, oferta.descuento)
            : producto.precio;

        // Buscar si el producto ya existe en el carrito
        const itemExistente = this.carrito.items.find(item => item.id === producto.id);

        if (itemExistente) {
            // Actualizar cantidad si ya existe
            itemExistente.cantidad += cantidad;
        } else {
            // Agregar nuevo item con precio final (con oferta si aplica)
            const nuevoItem = {
                id: producto.id,
                sku: producto.sku,
                nombre: producto.nombre,
                precio: precioFinal,
                precioOriginal: oferta ? producto.precio : null,
                descuento: oferta ? oferta.descuento : null,
                cantidad: cantidad,
                imagen: producto.imagen,
                stock: producto.stock
            };
            this.carrito.items.push(nuevoItem);
        }

        // Calcular totales y guardar
        this.calcularTotales();
        this.guardarCarrito();

        // Actualizar UI
        this.actualizarContador();
        this.renderizarCarrito();
        this.mostrarToast('Producto agregado al carrito', producto.nombre);
    }


    eliminarProducto(id) {
        this.carrito.items = this.carrito.items.filter(item => item.id !== id);
        this.calcularTotales();
        this.guardarCarrito();
        this.actualizarContador();
        this.renderizarCarrito();
    }

    actualizarCantidad(id, nuevaCantidad) {
        const item = this.carrito.items.find(item => item.id === id);

        if (!item) return;

        // Validar que la cantidad sea válida
        if (nuevaCantidad < 1) {
            this.eliminarProducto(id);
            return;
        }

        item.cantidad = nuevaCantidad;
        this.calcularTotales();
        this.guardarCarrito();
        this.actualizarContador();
        this.renderizarCarrito();
    }

    vaciarCarrito() {
        this.carrito = this.crearCarritoVacio();
        this.guardarCarrito();
        this.actualizarContador();
        this.renderizarCarrito();
    }

    // ============================================
    // MÉTODOS DE PERSISTENCIA
    // ============================================

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : this.crearCarritoVacio();
    }

    crearCarritoVacio() {
        return {
            items: [],
            subtotal: 0,
            iva: 0,
            total: 0
        };
    }

    // ============================================
    // MÉTODOS DE CÁLCULO
    // ============================================

    calcularTotales() {
        // Calcular subtotal
        this.carrito.subtotal = this.carrito.items.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);

        // Calcular IVA (16%)
        this.carrito.iva = this.carrito.subtotal * 0.16;

        // Calcular total
        this.carrito.total = this.carrito.subtotal + this.carrito.iva;
    }

    obtenerCantidadTotal() {
        return this.carrito.items.reduce((total, item) => total + item.cantidad, 0);
    }

    obtenerPrecioTotal() {
        return this.carrito.total;
    }

    // ============================================
    // MÉTODOS DE UI
    // ============================================

    renderizarCarrito() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartIva = document.getElementById('cartIva');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems || !cartEmpty) return;

        // Mostrar/ocultar mensaje de carrito vacío
        if (this.carrito.items.length === 0) {
            cartItems.style.display = 'none';
            cartEmpty.style.display = 'block';
        } else {
            cartItems.style.display = 'flex';
            cartEmpty.style.display = 'none';

            // Renderizar items
            cartItems.innerHTML = this.carrito.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${window.getCloudinaryUrl ? window.getCloudinaryUrl(item.imagen) : item.imagen}" alt="${item.nombre}" class="cart-item__image">
                    <div class="cart-item__details">
                        <h3 class="cart-item__name">${item.nombre}</h3>
                        <p class="cart-item__sku">SKU: ${item.sku}</p>
                        <p class="cart-item__price">${this.formatearPrecio(item.precio)}</p>
                        <div class="cart-item__quantity">
                            <button class="cart-item__quantity-btn" onclick="carrito.actualizarCantidad(${item.id}, ${item.cantidad - 1})" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                            <span class="cart-item__quantity-value">${item.cantidad}</span>
                            <button class="cart-item__quantity-btn" onclick="carrito.actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item__total">
                        <p>${this.formatearPrecio(item.precio * item.cantidad)}</p>
                        <button class="cart-item__remove" onclick="carrito.eliminarProducto(${item.id})" aria-label="Eliminar producto">×</button>
                    </div>
                </div>
            `).join('');
        }

        // Actualizar totales
        if (cartSubtotal) cartSubtotal.textContent = this.formatearPrecio(this.carrito.subtotal);
        if (cartIva) cartIva.textContent = this.formatearPrecio(this.carrito.iva);
        if (cartTotal) cartTotal.textContent = this.formatearPrecio(this.carrito.total);
    }

    actualizarContador() {
        // Actualizar contador móvil
        const cartCountMobile = document.getElementById('cartCountMobile');
        if (cartCountMobile) {
            const cantidad = this.obtenerCantidadTotal();
            cartCountMobile.textContent = cantidad;

            // Mostrar/ocultar contador
            if (cantidad > 0) {
                cartCountMobile.classList.remove('header__cart-count--hidden');
            } else {
                cartCountMobile.classList.add('header__cart-count--hidden');
            }
        }

        // Actualizar contador desktop
        const cartCountDesktop = document.getElementById('cartCountDesktop');
        if (cartCountDesktop) {
            const cantidad = this.obtenerCantidadTotal();
            cartCountDesktop.textContent = cantidad;

            // Mostrar/ocultar contador
            if (cantidad > 0) {
                cartCountDesktop.classList.remove('header__cart-count--hidden');
            } else {
                cartCountDesktop.classList.add('header__cart-count--hidden');
            }
        }
    }

    mostrarToast(mensaje, producto) {
        const toast = document.getElementById('toast');
        const toastProduct = document.getElementById('toastProduct');
        const toastAction = document.getElementById('toastAction');

        if (!toast) return;

        // Actualizar contenido
        if (toastProduct) {
            toastProduct.textContent = producto;
        }

        // Mostrar toast
        toast.classList.add('toast--active');

        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('toast--active');
        }, 3000);

        // Configurar botón de acción
        if (toastAction) {
            toastAction.onclick = () => {
                this.abrirPanel();
                toast.classList.remove('toast--active');
            };
        }
    }

    abrirPanel() {
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');

        if (cartPanel) cartPanel.classList.add('cart-panel--active');
        if (cartOverlay) cartOverlay.classList.add('cart-panel__overlay--active');

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    cerrarPanel() {
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');

        if (cartPanel) cartPanel.classList.remove('cart-panel--active');
        if (cartOverlay) cartOverlay.classList.remove('cart-panel__overlay--active');

        // Restaurar scroll del body
        document.body.style.overflow = '';
    }

    togglePanel() {
        const cartPanel = document.getElementById('cartPanel');
        if (cartPanel && cartPanel.classList.contains('cart-panel--active')) {
            this.cerrarPanel();
        } else {
            this.abrirPanel();
        }
    }

    // ============================================
    // MÉTODOS DE UTILIDAD
    // ============================================

    formatearPrecio(precio) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(precio);
    }

    generarIdUnico() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    inicializarEventListeners() {
        // Botón de carrito en header (móvil)
        const cartBtnMobile = document.getElementById('cartBtnMobile');
        if (cartBtnMobile) {
            cartBtnMobile.addEventListener('click', () => this.togglePanel());
        }

        // Botón de carrito en header (desktop)
        const cartBtnDesktop = document.getElementById('cartBtnDesktop');
        if (cartBtnDesktop) {
            cartBtnDesktop.addEventListener('click', () => this.togglePanel());
        }

        // Botón cerrar panel
        const closeCartBtn = document.getElementById('closeCartBtn');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => this.cerrarPanel());
        }

        // Overlay para cerrar panel
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.cerrarPanel());
        }

        // Botón continuar comprando
        const continueBtn = document.querySelector('.cart-panel__continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.cerrarPanel());
        }

        // Botón checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkoutWhatsApp());
        }

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarPanel();
            }
        });
    }

    checkoutWhatsApp() {
        // Número de teléfono de la ferretería (debe configurarse)
        const phoneNumber = '59800000000'; // Reemplazar con el número real

        // Construir mensaje del pedido
        let message = '🔧 *Nuevo Pedido - Ferretería*\n\n';
        message += '📋 *Detalle del Pedido:*\n\n';

        this.carrito.items.forEach((item, index) => {
            const itemTotal = item.precio * item.cantidad;
            message += `${index + 1}. *${item.nombre}*\n`;
            message += `   SKU: ${item.sku}\n`;
            message += `   Cantidad: ${item.cantidad}\n`;
            message += `   Precio unitario: $${item.precio.toFixed(2)}\n`;
            message += `   Subtotal: $${itemTotal.toFixed(2)}\n\n`;
        });

        message += '💰 *Resumen:*\n';
        message += `   Total de productos: ${this.obtenerCantidadTotal()}\n`;
        message += `   Subtotal: $${this.carrito.subtotal.toFixed(2)}\n`;
        message += `   IVA (16%): $${this.carrito.iva.toFixed(2)}\n`;
        message += `   Total a pagar: *$${this.carrito.total.toFixed(2)}*\n\n`;
        message += '📍 Por favor, indícanos:\n';
        message += '   - Tu nombre completo\n';
        message += '   - Dirección de entrega\n';
        message += '   - Método de pago preferido\n';
        message += '   - Horario de entrega deseado\n\n';
        message += '¡Gracias por tu compra! 🛒';

        // Codificar mensaje para URL
        const encodedMessage = encodeURIComponent(message);

        // Construir URL de WhatsApp
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        // Abrir WhatsApp en nueva pestaña
        window.open(whatsappURL, '_blank');

        // Mostrar notificación
        this.mostrarToast('Redirigiendo a WhatsApp...', '');
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Crear instancia global del carrito
let carrito;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    carrito = new CarritoCompras();

    // Renderizar carrito inicial
    carrito.renderizarCarrito();
    carrito.actualizarContador();
});

// Exportar funciones globales para usar en HTML
window.agregarAlCarrito = (productoId, cantidad = 1) => {
    // Buscar el producto en la base de datos
    if (typeof productos !== 'undefined' && productos.length > 0) {
        const producto = productos.find(p => p.id === productoId);
        if (producto) {
            carrito.agregarProducto(producto, cantidad);
        } else {
            console.error('Producto no encontrado:', productoId);
        }
    } else {
        console.error('Base de datos de productos no disponible');
    }
};

window.eliminarDelCarrito = (id) => {
    carrito.eliminarProducto(id);
};

window.actualizarCantidadCarrito = (id, cantidad) => {
    carrito.actualizarCantidad(id, cantidad);
};

window.vaciarCarrito = () => {
    carrito.vaciarCarrito();
};

window.abrirCarrito = () => {
    carrito.abrirPanel();
};

window.cerrarCarrito = () => {
    carrito.cerrarPanel();
};