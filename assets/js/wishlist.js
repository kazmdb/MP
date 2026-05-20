/**
 * SISTEMA DE LISTA DE DESEOS (FAVORITOS) CON FIREBASE
 */

class Wishlist {
    constructor() {
        this.items = []; // IDs de productos favoritos
        this.init();
    }

    init() {
        document.addEventListener('authReady', () => {
            this.syncWithFirebase();
        });

        // Escuchar clics en corazones de las tarjetas
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.wishlist-btn');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                const productId = btn.dataset.productId;
                this.toggleFavorite(productId, btn);
            }
        });

        // Abrir/Cerrar Panel
        document.addEventListener('click', (e) => {
            if (e.target.closest('#wishlistBtnDesktop') || e.target.closest('#wishlistBtnMobile')) {
                this.openPanel();
            }
            if (e.target.closest('#closeWishlistBtn')) {
                this.closePanel();
            }
        });

        // Cerrar al hacer clic fuera del panel (en el overlay compartido)
        document.getElementById('cartOverlay')?.addEventListener('click', () => this.closePanel());
    }

    async syncWithFirebase() {
        if (!window.auth || !window.auth.currentUser) {
            this.items = JSON.parse(localStorage.getItem('wishlist_local') || '[]');
            this.updateUI();
            return;
        }

        try {
            const userDoc = await db.collection('users').doc(window.auth.currentUser.id).get();
            if (userDoc.exists) {
                this.items = userDoc.data().wishlist || [];
                this.updateUI();
            }
        } catch (error) {
            console.error("Error sincronizando favoritos:", error);
        }
    }

    async toggleFavorite(productId, btn) {
        if (!window.auth || !window.auth.currentUser) {
            alert("¡Inicia sesión para guardar tus favoritos en la nube!");
            return;
        }

        productId = String(productId);
        const index = this.items.indexOf(productId);

        if (index === -1) {
            this.items.push(productId);
            if (btn) btn.classList.add('wishlist-btn--active');
        } else {
            this.items.splice(index, 1);
            if (btn) btn.classList.remove('wishlist-btn--active');
        }

        this.updateUI();

        // Guardar en Firebase
        try {
            await db.collection('users').doc(window.auth.currentUser.id).update({
                wishlist: this.items
            });
        } catch (error) {
            console.error("Error al guardar favorito:", error);
        }
    }

    updateUI() {
        // 1. Actualizar corazones en la página
        const allHearts = document.querySelectorAll('.wishlist-btn');
        allHearts.forEach(btn => {
            const id = btn.dataset.productId;
            if (this.items.includes(id)) {
                btn.classList.add('wishlist-btn--active');
            } else {
                btn.classList.remove('wishlist-btn--active');
            }
        });

        // 2. Actualizar contadores del header
        const counts = document.querySelectorAll('#wishlistCountDesktop, #wishlistCountMobile');
        counts.forEach(el => {
            el.textContent = this.items.length;
            el.classList.toggle('header__cart-count--hidden', this.items.length === 0);
        });

        // 3. Renderizar items en el panel si está abierto
        this.renderPanelItems();
    }

    renderPanelItems() {
        const container = document.getElementById('wishlistItems');
        const emptyMsg = document.getElementById('wishlistEmpty');
        if (!container) return;

        container.innerHTML = '';
        
        if (this.items.length === 0) {
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';

        // Buscar productos en la data global
        this.items.forEach(id => {
            const product = window.productos.find(p => String(p.id) === id);
            if (product) {
                const itemHtml = `
                    <div class="cart-item">
                        <a href="producto.html?id=${product.id}" class="cart-item__link">
                            <img src="${window.getCloudinaryUrl(product.imagen)}" alt="${product.nombre}" class="cart-item__image">
                        </a>
                        <div class="cart-item__details">
                            <a href="producto.html?id=${product.id}" class="cart-item__link">
                                <h4 class="cart-item__name">${product.nombre}</h4>
                            </a>
                            <p class="cart-item__price">$${product.precio.toFixed(2)}</p>
                            <button class="wishlist-remove-btn" onclick="window.wishlist.toggleFavorite('${product.id}')">Eliminar</button>
                        </div>
                        <button class="cart-panel__item-add" onclick="window.agregarAlCarrito('${product.id}', 1)" title="Añadir al carrito">
                            🛒
                        </button>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', itemHtml);
            }
        });
    }

    openPanel() {
        const panel = document.getElementById('wishlistPanel');
        const overlay = document.getElementById('cartOverlay'); // Reusamos el overlay del carrito
        if (panel) panel.classList.add('cart-panel--active');
        if (overlay) overlay.classList.add('cart-panel__overlay--active');
        document.body.style.overflow = 'hidden';
        this.renderPanelItems();
    }

    closePanel() {
        const panel = document.getElementById('wishlistPanel');
        const overlay = document.getElementById('cartOverlay');
        if (panel) panel.classList.remove('cart-panel--active');
        if (overlay) overlay.classList.remove('cart-panel__overlay--active');
        document.body.style.overflow = '';
    }

    // Helper para inyectar el HTML del botón de favorito
    getHeartHtml(productId) {
        const isActive = this.items.includes(productId) ? 'wishlist-btn--active' : '';
        return `
            <button class="wishlist-btn ${isActive}" data-product-id="${productId}" aria-label="Agregar a favoritos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        `;
    }
}

// Inicializar globalmente
window.wishlist = new Wishlist();
