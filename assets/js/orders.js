/**
 * MP Ferretería - Order History System
 * Manages saving and retrieving orders from Firestore.
 */

const Orders = {
    panel: null,
    overlay: null,
    content: null,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        
        console.log('📦 Inicializando sistema de pedidos...');
        
        // Crear elementos del panel si no existen
        this.createPanelHTML();
        
        this.panel = document.getElementById('ordersPanel');
        this.overlay = document.getElementById('ordersOverlay');
        this.content = document.getElementById('ordersContent');
        
        // Event Listeners para cerrar
        const closeBtn = this.panel.querySelector('.orders-panel__close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.togglePanel(false));
        if (this.overlay) this.overlay.addEventListener('click', () => this.togglePanel(false));
        
        // Escuchar cambios de autenticación
        document.addEventListener('authReady', (e) => {
            const user = e.detail.user;
            if (user) {
                this.loadUserOrders(user.id || user.uid);
            } else {
                this.clearOrders();
            }
        });

        this.isInitialized = true;
    },

    createPanelHTML() {
        if (document.getElementById('ordersPanel')) return;

        const panelHTML = `
            <div class="orders-panel__overlay" id="ordersOverlay"></div>
            <div class="orders-panel" id="ordersPanel">
                <div class="orders-panel__header">
                    <h2 class="orders-panel__title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Mi Historial
                    </h2>
                    <button class="orders-panel__close" aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="orders-panel__content" id="ordersContent">
                    <div class="orders-empty">
                        <p>Inicia sesión para ver tus pedidos.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', panelHTML);
    },

    togglePanel(show = true) {
        if (!this.panel) return;
        
        if (show) {
            this.panel.classList.add('orders-panel--active');
            this.overlay.classList.add('orders-panel__overlay--active');
            document.body.style.overflow = 'hidden';
            
            // Si el usuario está logueado, refrescar pedidos
            if (window.auth && window.auth.currentUser) {
                const userId = window.auth.currentUser.id || window.auth.currentUser.uid;
                this.loadUserOrders(userId);
            }
        } else {
            this.panel.classList.remove('orders-panel--active');
            this.overlay.classList.remove('orders-panel__overlay--active');
            document.body.style.overflow = '';
        }
    },

    async saveOrder(orderData) {
        if (!window.db) {
            console.error('Firestore no está inicializado.');
            return null;
        }

        try {
            // Identificar al usuario (Logueado o Invitado)
            const userId = (window.auth && window.auth.currentUser) 
                ? (window.auth.currentUser.id || window.auth.currentUser.uid) 
                : `guest_${orderData.cliente.phone}`;

        const pedido = {
            userId: userId,
            esInvitado: !(window.auth && window.auth.currentUser),
            cliente: orderData.cliente,
            fecha: firebase.firestore.Timestamp.now(),
            estado: orderData.estado || 'pendiente',
            total: orderData.total,
            items: orderData.items,
            metodoPago: orderData.metodoPago || 'Simulado',
            metodoEntrega: orderData.metodoEntrega || 'pickup',
            direccion: orderData.direccion || null,
            creadoEn: firebase.firestore.FieldValue.serverTimestamp()
        };

            const docRef = await window.db.collection('pedidos').add(pedido);
            console.log('✅ Pedido guardado con ID:', docRef.id);

            // Decrementar stock de cada producto (solo si tiene stock limitado)
            try {
                for (const item of orderData.items) {
                    const prodRef = window.db.collection('productos').doc(item.id);
                    const prodSnap = await prodRef.get();
                    if (prodSnap.exists) {
                        const currentStock = prodSnap.data().stock;
                        if (currentStock !== null && currentStock !== undefined) {
                            const nuevoStock = Math.max(0, currentStock - item.cantidad);
                            await prodRef.update({ stock: nuevoStock });
                        }
                    }
                }
            } catch (stockError) {
                console.warn('⚠️ No se pudo actualizar stock:', stockError.message);
            }
            
            // Recargar pedidos
            this.loadUserOrders(userId);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error al guardar pedido:', error);
            throw new Error('Error al guardar pedido: ' + (error.message || error));
        }
    },

    async loadUserOrders(userId) {
        if (!window.db) return;

        try {
            this.content.innerHTML = '<div class="orders-empty"><p>Cargando tus pedidos...</p></div>';
            
            const snapshot = await window.db.collection('pedidos')
                .where('userId', '==', userId)
                .orderBy('fecha', 'desc')
                .get();

            const orders = [];
            snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
            
            this.renderOrders(orders);
        } catch (error) {
            console.error('❌ Error al cargar pedidos:', error);
            this.content.innerHTML = '<div class="orders-empty"><p>Error al cargar pedidos. Intenta de nuevo.</p></div>';
        }
    },

    renderOrders(orders) {
        if (orders.length === 0) {
            this.content.innerHTML = `
                <div class="orders-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p>No tienes pedidos realizados aún.</p>
                    <a href="catalogo.html" class="orders-empty__btn">Explorar Catálogo</a>
                </div>
            `;
            return;
        }

        let html = '';
        orders.forEach(order => {
            const fecha = order.fecha.toDate().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            const itemsHtml = order.items.map(item => `
                <img src="${window.getCloudinaryUrl ? window.getCloudinaryUrl(item.imagen) : (item.imagen || 'assets/images/placeholder-product.png')}" alt="${item.nombre}" class="order-card__item-img" title="${item.nombre}">
            `).join('');

            const estado = order.estado || 'pendiente';
            const entrega = order.metodoEntrega || 'pickup';
            const paso1 = true;
            const paso2 = estado === 'en_proceso' || estado === 'en proceso' || estado === 'listo_para_retirar' || estado === 'enviado';
            const paso3 = estado === 'listo_para_retirar' || estado === 'enviado';
            const label3 = entrega === 'shipping' ? 'Enviado' : 'Listo para retirar';

            html += `
                <div class="order-card">
                    <div class="order-card__header">
                        <span class="order-card__date">${fecha}</span>
                    </div>
                    <div class="order-tracking">
                        <div class="order-tracking__step">
                            <div class="order-tracking__circle ${paso1 ? 'order-tracking__circle--active' : 'order-tracking__circle--inactive'}">${paso1 ? '✓' : '1'}</div>
                            <div class="order-tracking__label ${paso1 ? 'order-tracking__label--active' : ''}">Recibido</div>
                        </div>
                        <div class="order-tracking__line ${paso2 ? 'order-tracking__line--active' : ''}"></div>
                        <div class="order-tracking__step">
                            <div class="order-tracking__circle ${paso2 ? 'order-tracking__circle--active' : 'order-tracking__circle--inactive'}">${paso2 ? '✓' : '2'}</div>
                            <div class="order-tracking__label ${paso2 ? 'order-tracking__label--active' : ''}">Preparando</div>
                        </div>
                        <div class="order-tracking__line ${paso3 ? 'order-tracking__line--active' : ''}"></div>
                        <div class="order-tracking__step">
                            <div class="order-tracking__circle ${paso3 ? 'order-tracking__circle--active' : 'order-tracking__circle--inactive'}">${paso3 ? '✓' : '3'}</div>
                            <div class="order-tracking__label ${paso3 ? 'order-tracking__label--active' : ''}">${label3}</div>
                        </div>
                    </div>
                    <div class="order-card__items">
                        ${itemsHtml}
                    </div>
                    <div class="order-card__footer">
                        <div class="order-card__total">
                            <span>Total:</span> $${order.total.toLocaleString()}
                        </div>
                        <button class="order-card__btn" onclick="window.location.href='catalogo.html'">Ver más</button>
                    </div>
                </div>
            `;
        });

        this.content.innerHTML = html;
    },

    clearOrders() {
        if (this.content) {
            this.content.innerHTML = '<div class="orders-empty"><p>Inicia sesión para ver tus pedidos.</p></div>';
        }
    }
};
window.Orders = Orders;

// Auto-inicializar al cargar el script
document.addEventListener('DOMContentLoaded', () => Orders.init());
