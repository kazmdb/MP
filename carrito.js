// ============================================
// SISTEMA DE CARRITO DE COMPRAS
// ============================================

// Clase principal del carrito
let carrito;

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

        // Validar stock si el producto tiene límite definido
        if (producto.stock !== null && producto.stock !== undefined) {
            if (producto.stock <= 0) {
                alert('Este producto está agotado');
                return;
            }
            const yaEnCarrito = itemExistente ? itemExistente.cantidad : 0;
            if (yaEnCarrito + cantidad > producto.stock) {
                alert(`Solo hay ${producto.stock} unidades disponibles`);
                return;
            }
        }

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

    // ============================================
    // ENTRADA RÁPIDA POR SKU
    // ============================================

    agregarPorSKU(sku, cantidad) {
        const skuNorm = (sku || '').trim().toUpperCase();
        if (!skuNorm) return { ok: false, msg: 'Escribe un SKU' };
        const producto = (window.productos || []).find(p =>
            (p.sku || '').toUpperCase() === skuNorm
        );
        if (!producto) return { ok: false, msg: `SKU "${skuNorm}" no encontrado` };
        if (producto.stock !== null && producto.stock !== undefined && producto.stock <= 0) {
            return { ok: false, msg: `"${producto.nombre}" está agotado` };
        }
        this.agregarProducto(producto, cantidad);
        return { ok: true, msg: `${producto.nombre} ×${cantidad}` };
    }

    // ============================================
    // PEDIDOS FRECUENTES
    // ============================================

    guardarPedido() {
        if (this.carrito.items.length === 0) {
            this.mostrarToast('El carrito está vacío', '');
            return;
        }
        const nombre = prompt('Nombre para este pedido (ej: "Electricista semana"):',
            `Pedido ${new Date().toLocaleDateString('es')}`);
        if (nombre === null) return; // cancelled
        const pedidos = JSON.parse(localStorage.getItem('pedidos_guardados') || '[]');
        pedidos.unshift({
            nombre: nombre.trim() || `Pedido ${new Date().toLocaleDateString('es')}`,
            fecha: new Date().toLocaleDateString('es'),
            items: this.carrito.items.map(i => ({ id: i.id, sku: i.sku, nombre: i.nombre, cantidad: i.cantidad }))
        });
        if (pedidos.length > 10) pedidos.length = 10;
        localStorage.setItem('pedidos_guardados', JSON.stringify(pedidos));
        this.renderizarPedidosGuardados();
        this.mostrarToast('Pedido guardado', nombre);
    }

    cargarPedido(index) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos_guardados') || '[]');
        const pedido = pedidos[index];
        if (!pedido || !window.productos) return;
        if (!confirm(`¿Cargar "${pedido.nombre}"? Reemplazará el carrito actual.`)) return;
        // Limpiar carrito
        this.carrito.items = [];
        this.calcularTotales();
        this.guardarCarrito();
        this.actualizarContador();
        // Agregar items del pedido guardado
        let cargados = 0;
        pedido.items.forEach(item => {
            const producto = window.productos.find(p => String(p.id) === String(item.id));
            if (producto) {
                this.agregarProducto(producto, item.cantidad);
                cargados++;
            }
        });
        this.mostrarToast(`"${pedido.nombre}" cargado (${cargados} productos)`, '');
    }

    eliminarPedido(index) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos_guardados') || '[]');
        pedidos.splice(index, 1);
        localStorage.setItem('pedidos_guardados', JSON.stringify(pedidos));
        this.renderizarPedidosGuardados();
    }

    renderizarPedidosGuardados() {
        const container = document.getElementById('savedOrdersList');
        if (!container) return;
        const pedidos = JSON.parse(localStorage.getItem('pedidos_guardados') || '[]');
        if (pedidos.length === 0) {
            container.innerHTML = '<p class="cart-saved__empty">Sin pedidos guardados aún.</p>';
            return;
        }
        container.innerHTML = pedidos.map((p, i) => `
            <div class="cart-saved__item">
                <div class="cart-saved__info">
                    <span class="cart-saved__name">${p.nombre}</span>
                    <span class="cart-saved__meta">${p.items.length} ref${p.items.length !== 1 ? 's' : ''} · ${p.fecha}</span>
                </div>
                <div class="cart-saved__actions">
                    <button class="cart-saved__load" data-index="${i}">Cargar</button>
                    <button class="cart-saved__del" data-index="${i}" aria-label="Eliminar">×</button>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // MINI-BARRA DE SUBTOTAL
    // ============================================

    renderizarMiniBar() {
        const bar = document.getElementById('cartMiniBar');
        if (!bar) return;
        const count = this.obtenerCantidadTotal();
        const panelOpen = document.getElementById('cartPanel')?.classList.contains('cart-panel--active');
        if (count === 0 || panelOpen) {
            bar.classList.remove('cart-mini-bar--active');
            return;
        }
        bar.classList.add('cart-mini-bar--active');
        const itemsEl = document.getElementById('miniBarItems');
        const totalEl = document.getElementById('miniBarTotal');
        if (itemsEl) itemsEl.textContent = `${count} art${count !== 1 ? 's' : '.'}`;
        if (totalEl) totalEl.textContent = this.formatearPrecio(this.carrito.subtotal);
    }

    actualizarCantidad(id, nuevaCantidad) {
        const item = this.carrito.items.find(item => item.id === id);

        if (!item) return;

        // Validar que la cantidad sea válida
        if (nuevaCantidad < 1) {
            this.eliminarProducto(id);
            return;
        }

        // Validar stock si el producto tiene límite definido
        if (item.stock !== null && item.stock !== undefined && nuevaCantidad > item.stock) {
            alert(`Solo hay ${item.stock} unidades disponibles`);
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
                            <button class="cart-item__quantity-btn" onclick="carrito.actualizarCantidad('${item.id}', ${item.cantidad - 1})" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                            <span class="cart-item__quantity-value">${item.cantidad}</span>
                            <button class="cart-item__quantity-btn" onclick="carrito.actualizarCantidad('${item.id}', ${item.cantidad + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item__total">
                        <p>${this.formatearPrecio(item.precio * item.cantidad)}</p>
                        <button class="cart-item__remove" onclick="carrito.eliminarProducto('${item.id}')" aria-label="Eliminar producto">×</button>
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

        // Actualizar mini-barra de subtotal
        this.renderizarMiniBar();
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

        // Ocultar mini-bar cuando el panel está abierto
        this.renderizarMiniBar();

        // Auto-foco en el campo SKU
        setTimeout(() => {
            const skuInput = document.getElementById('skuInput');
            if (skuInput) skuInput.focus();
        }, 300);

        // Renderizar pedidos guardados
        this.renderizarPedidosGuardados();
    }

    cerrarPanel() {
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');

        if (cartPanel) cartPanel.classList.remove('cart-panel--active');
        if (cartOverlay) cartOverlay.classList.remove('cart-panel__overlay--active');

        // Restaurar scroll del body
        document.body.style.overflow = '';

        // Mostrar mini-bar al cerrar
        this.renderizarMiniBar();
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
            checkoutBtn.addEventListener('click', () => {
                if (typeof Checkout !== 'undefined') {
                    // Cerrar panel del carrito para mostrar el modal
                    this.cerrarPanel();
                    Checkout.toggleModal(true);
                } else {
                    console.error('Sistema de Checkout no cargado');
                    this.checkoutWhatsApp(); // Fallback
                }
            });
        }

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarPanel();
            }
        });

        // ---- ENTRADA POR SKU ----
        document.addEventListener('click', (e) => {
            if (e.target.closest('#skuAddBtn')) {
                const skuInput = document.getElementById('skuInput');
                const skuQty = document.getElementById('skuQty');
                const feedback = document.getElementById('skuFeedback');
                if (!skuInput) return;
                const result = this.agregarPorSKU(skuInput.value, parseInt(skuQty?.value) || 1);
                if (feedback) {
                    feedback.textContent = result.msg;
                    feedback.className = 'cart-sku-bar__feedback cart-sku-bar__feedback--' + (result.ok ? 'ok' : 'err');
                    setTimeout(() => { feedback.textContent = ''; feedback.className = 'cart-sku-bar__feedback'; }, 3000);
                }
                if (result.ok) {
                    skuInput.value = '';
                    if (skuQty) skuQty.value = 1;
                    skuInput.focus();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'skuInput') {
                document.getElementById('skuAddBtn')?.click();
            }
        });

        // ---- PEDIDOS GUARDADOS ----
        document.addEventListener('click', (e) => {
            // Toggle panel de pedidos
            if (e.target.closest('#savedOrdersToggle')) {
                const body = document.getElementById('savedOrdersBody');
                if (body) {
                    const open = body.style.display !== 'none';
                    body.style.display = open ? 'none' : 'block';
                    e.target.closest('#savedOrdersToggle')?.classList.toggle('cart-saved__toggle--open', !open);
                    if (!open) this.renderizarPedidosGuardados();
                }
            }
            // Guardar pedido actual
            if (e.target.closest('#guardarPedidoBtn')) {
                this.guardarPedido();
            }
            // Cargar pedido guardado
            if (e.target.matches('.cart-saved__load')) {
                this.cargarPedido(parseInt(e.target.dataset.index));
            }
            // Eliminar pedido guardado
            if (e.target.matches('.cart-saved__del')) {
                this.eliminarPedido(parseInt(e.target.dataset.index));
            }
        });

        // ---- MINI-BARRA ----
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cartMiniBarBtn')) {
                this.abrirPanel();
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    carrito = new CarritoCompras();
    window.carrito = carrito;

    // Renderizar carrito inicial
    carrito.renderizarCarrito();
    carrito.actualizarContador();
});

// Exportar funciones globales para usar en HTML
window.agregarAlCarrito = (productoId, cantidad = 1) => {
    // Buscar el producto en los datos de Firestore (window.productos)
    if (typeof window.productos !== 'undefined' && window.productos.length > 0) {
        const producto = window.productos.find(p => String(p.id) === String(productoId));
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