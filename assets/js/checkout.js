/**
 * MP Ferretería - Checkout System
 * Handles multi-step checkout, guest validation, shipping logic, and UltraMsg integration.
 */

// URL del backend serverless. En Vercel la ruta relativa funciona;
// desde GitHub Pages u otro host estático se usa la URL absoluta de Vercel.
const MP_API_URL = (function() {
    const host = window.location.hostname;
    if (host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1') {
        return '/api/crear-preferencia';   // mismo dominio
    }
    return 'https://mp-ferreteria.vercel.app/api/crear-preferencia'; // GitHub Pages u otros
})();

const Checkout = {
    currentStep: 1,
    totalSteps: 3,
    data: {
        customer: { name: '', phone: '' },
        delivery: { method: 'pickup', departamento: '', localidad: '', direccion: '', notas: '' },
        payment: { method: 'efectivo' },
        costs: { subtotal: 0, shipping: 0, total: 0 }
    },
    
    // Configuración UltraMsg (Placeholder)
    ULTRAMSG_INSTANCE: '',
    ULTRAMSG_TOKEN: '',

    // MercadoPago
    MP_PUBLIC_KEY: 'APP_USR-18b1797d-4e6f-45ba-b4ff-678eaaeeb3b5',

    init() {
        console.log('🛒 Inicializando sistema de Checkout...');
        this.renderModalHTML();
        this.setupEventListeners();
    },

    renderModalHTML() {
        if (document.getElementById('checkoutModal')) return;

        const modalHTML = `
            <div class="checkout-modal" id="checkoutModal">
                <div class="checkout-modal__container">
                    <div class="checkout-modal__header">
                        <h2 class="checkout-modal__title">Finalizar Compra</h2>
                        <button class="checkout-modal__close" id="closeCheckout">&times;</button>
                    </div>
                    
                    <div class="checkout-modal__content">
                        <!-- Stepper -->
                        <div class="checkout-stepper" id="checkoutStepper">
                            <div class="checkout-step checkout-step--active" data-step="1">
                                <div class="checkout-step__number">1</div>
                                <span class="checkout-step__label">Datos</span>
                            </div>
                            <div class="checkout-step" data-step="2">
                                <div class="checkout-step__number">2</div>
                                <span class="checkout-step__label">Entrega</span>
                            </div>
                            <div class="checkout-step" data-step="3">
                                <div class="checkout-step__number">3</div>
                                <span class="checkout-step__label">Pago</span>
                            </div>
                        </div>

                        <!-- Step 1: Contacto (Solo si no está logueado) -->
                        <div class="checkout-form-step checkout-form-step--active" id="step1">
                            <div id="guestFields">
                                <div class="checkout-group">
                                    <label>Nombre Completo*</label>
                                    <input type="text" id="chkName" placeholder="Ej: Juan Pérez">
                                </div>
                                <div class="checkout-group">
                                    <label>Teléfono / WhatsApp*</label>
                                    <input type="tel" id="chkPhone" placeholder="Ej: 099123456">
                                </div>
                            </div>
                            <div id="loggedInFields" style="display: none;">
                                <p class="checkout-welcome">Hola <strong id="chkUserName"></strong>, usaremos los datos de tu cuenta para el pedido.</p>
                            </div>
                        </div>

                        <!-- Step 2: Entrega -->
                        <div class="checkout-form-step" id="step2">
                            <div class="option-grid">
                                <div class="option-card option-card--active" data-method="pickup">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span class="option-card__title">Retiro en Local</span>
                                </div>
                                <div class="option-card" data-method="shipping">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <span class="option-card__title">Envío a Domicilio</span>
                                </div>
                            </div>

                            <div id="shippingFields" style="display: none;">
                                <div class="checkout-row">
                                    <div class="checkout-group">
                                        <label>Departamento*</label>
                                        <select id="chkDepto">
                                            <option value="">Seleccionar...</option>
                                            <option value="San José">San José</option>
                                            <option value="Montevideo">Montevideo</option>
                                            <option value="Canelones">Canelones</option>
                                        </select>
                                    </div>
                                    <div class="checkout-group">
                                        <label>Localidad*</label>
                                        <select id="chkLocalidad">
                                            <option value="">Seleccionar departamento primero...</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="checkout-group">
                                    <label>Dirección Completa*</label>
                                    <input type="text" id="chkDireccion" placeholder="Calle, Número, Apto, Esquina">
                                </div>
                                <div class="checkout-group">
                                    <label>Notas adicionales (Opcional)</label>
                                    <textarea id="chkNotas" rows="2" placeholder="Indicaciones para el repartidor..."></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Pago -->
                        <div class="checkout-form-step" id="step3">
                            <div class="option-grid">
                                <div class="option-card option-card--active" data-pay="efectivo">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span class="option-card__title">Efectivo / Al Recibir</span>
                                </div>
                                <div class="option-card" data-pay="online">
                                    <img src="assets/icons/mplogo.png" alt="MercadoPago" style="height:28px;object-fit:contain;max-width:100%;">
                                    <span class="option-card__title">Pago Online</span>
                                    <span class="option-card__subtitle">Visa · Mastercard · OCA · Débito</span>
                                </div>
                            </div>
                            <div id="mpInfo" class="mp-info-box" style="display:none;">
                                🔒 Serás redirigido a MercadoPago para completar el pago de forma segura.
                            </div>

                            <div class="checkout-summary">
                                <div class="checkout-summary__row">
                                    <span>Productos:</span>
                                    <span id="chkSubtotal">$0</span>
                                </div>
                                <div class="checkout-summary__row">
                                    <span>Envío:</span>
                                    <span id="chkShipping">$0</span>
                                </div>
                                <div class="checkout-summary__row checkout-summary__row--total">
                                    <span>Total a Pagar:</span>
                                    <span id="chkTotal">$0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="checkout-modal__footer">
                        <button class="checkout-btn checkout-btn--prev" id="prevBtn" style="visibility: hidden;">Volver</button>
                        <button class="checkout-btn checkout-btn--next" id="nextBtn">Siguiente</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    setupEventListeners() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const closeBtn = document.getElementById('closeCheckout');

        if (closeBtn) closeBtn.onclick = () => this.toggleModal(false);
        if (prevBtn) prevBtn.onclick = () => this.moveStep(-1);
        if (nextBtn) nextBtn.onclick = async () => {
            if (this.currentStep === this.totalSteps) {
                this.finishOrder();
            } else {
                if (await this.validateStep()) this.moveStep(1);
            }
        };

        // Opción de Envío/Retiro
        document.querySelectorAll('#step2 .option-card').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('#step2 .option-card').forEach(c => c.classList.remove('option-card--active'));
                card.classList.add('option-card--active');
                const method = card.dataset.method;
                this.data.delivery.method = method;
                const shippingFields = document.getElementById('shippingFields');
                if (shippingFields) shippingFields.style.display = method === 'shipping' ? 'block' : 'none';
                this.calculateCosts();
            };
        });

        // Opción de Pago
        document.querySelectorAll('#step3 .option-card').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('#step3 .option-card').forEach(c => c.classList.remove('option-card--active'));
                card.classList.add('option-card--active');
                this.data.payment.method = card.dataset.pay;
                const mpInfo = document.getElementById('mpInfo');
                if (mpInfo) mpInfo.style.display = card.dataset.pay === 'online' ? 'block' : 'none';
            };
        });

        // Lógica de Localidades
        const deptoSelect = document.getElementById('chkDepto');
        const locSelect = document.getElementById('chkLocalidad');
        
        if (deptoSelect && locSelect) {
            deptoSelect.onchange = () => {
                const depto = deptoSelect.value;
                locSelect.innerHTML = '<option value="">Seleccionar...</option>';
                
                if (depto === 'San José') {
                    ['Ciudad del Plata', 'Libertad', 'San José de Mayo', 'Otros'].forEach(l => {
                        locSelect.innerHTML += `<option value="${l}">${l}</option>`;
                    });
                } else if (depto === 'Montevideo') {
                    ['Montevideo Centro', 'Pocitos', 'Carrasco', 'Otros'].forEach(l => {
                        locSelect.innerHTML += `<option value="${l}">${l}</option>`;
                    });
                } else {
                    locSelect.innerHTML += '<option value="Otros">Otros</option>';
                }
                this.calculateCosts();
            };

            locSelect.onchange = () => {
                this.data.delivery.localidad = locSelect.value;
                this.calculateCosts();
            };
        }
    },

    getCartData() {
        // Intentar obtener de window.carrito o directamente de localStorage
        if (window.carrito && window.carrito.carrito) {
            return window.carrito.carrito;
        }
        const saved = localStorage.getItem('carrito');
        return saved ? JSON.parse(saved) : { items: [], total: 0 };
    },

    toggleModal(show = true) {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;
        
        const cartData = this.getCartData();

        if (show) {
            if (!cartData.items || cartData.items.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
                return;
            }

            this.prepareFirstStep();
            modal.classList.add('checkout-modal--active');
            this.calculateCosts();
            document.body.style.overflow = 'hidden';
        } else {
            modal.classList.remove('checkout-modal--active');
            document.body.style.overflow = '';
            this.currentStep = 1;
            this.updateStepper();
        }
    },

    prepareFirstStep() {
        const isLogged = window.auth && window.auth.currentUser;
        const guestFields = document.getElementById('guestFields');
        const loggedInFields = document.getElementById('loggedInFields');
        
        if (guestFields) guestFields.style.display = isLogged ? 'none' : 'block';
        if (loggedInFields) loggedInFields.style.display = isLogged ? 'block' : 'none';
        
        if (isLogged) {
            const chkUserName = document.getElementById('chkUserName');
            if (chkUserName) chkUserName.textContent = window.auth.currentUser.name;
            this.data.customer.name = window.auth.currentUser.name;
            this.data.customer.phone = window.auth.currentUser.phone;
        }
    },

    async validateStep() {
        if (this.currentStep === 1) {
            if (!(window.auth && window.auth.currentUser)) {
                const name = document.getElementById('chkName').value.trim();
                const phone = document.getElementById('chkPhone').value.trim();
                if (!name || !phone) {
                    alert('Por favor completa tu nombre y teléfono.');
                    return false;
                }
                this.data.customer.name = name;
                this.data.customer.phone = phone;

                // Registrar o loguear automáticamente con estos datos
                if (window.auth) {
                    const nextBtn = document.getElementById('nextBtn');
                    if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = 'Procesando...'; }

                    try {
                        const result = await window.auth.register(name, phone);
                        if (result.success) {
                            this.showCheckoutMessage('¡Cuenta creada! La próxima vez podrás ingresar solo con tu teléfono.', 'success');
                        } else if (result.message === 'Este teléfono ya está registrado') {
                            const loginResult = await window.auth.login(phone);
                            if (loginResult.success) {
                                this.showCheckoutMessage(`¡Bienvenido de nuevo, ${window.auth.currentUser.name}!`, 'success');
                            }
                        }
                        // login() llama closeModal() que resetea overflow; lo restauramos
                        document.body.style.overflow = 'hidden';

                        if (window.auth.currentUser) {
                            this.data.customer.name = window.auth.currentUser.name;
                            this.data.customer.phone = window.auth.currentUser.phone;
                            // Actualizar UI del paso 1 para mostrar nombre registrado
                            const chkUserName = document.getElementById('chkUserName');
                            if (chkUserName) chkUserName.textContent = window.auth.currentUser.name;
                        }
                    } finally {
                        if (nextBtn) { nextBtn.disabled = false; nextBtn.textContent = 'Siguiente'; }
                    }
                }
            }
        } else if (this.currentStep === 2) {
            if (this.data.delivery.method === 'shipping') {
                const depto = document.getElementById('chkDepto').value;
                const loc = document.getElementById('chkLocalidad').value;
                const dir = document.getElementById('chkDireccion').value.trim();
                if (!depto || !loc || !dir) {
                    alert('Por favor completa todos los campos de dirección.');
                    return false;
                }
                this.data.delivery.departamento = depto;
                this.data.delivery.localidad = loc;
                this.data.delivery.direccion = dir;
                this.data.delivery.notas = document.getElementById('chkNotas').value;
            }
        }
        return true;
    },

    showCheckoutMessage(text, type) {
        const existing = document.querySelector('.checkout-inline-msg');
        if (existing) existing.remove();
        const msg = document.createElement('div');
        msg.className = 'checkout-inline-msg';
        msg.style.cssText = `padding:10px 14px;border-radius:8px;font-size:0.875rem;margin-top:12px;` +
            (type === 'success'
                ? 'background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;'
                : 'background:#fef2f2;color:#991b1b;border:1px solid #fecaca;');
        msg.textContent = text;
        const guestFields = document.getElementById('guestFields');
        if (guestFields) guestFields.appendChild(msg);
        setTimeout(() => msg.remove(), 5000);
    },

    moveStep(dir) {
        this.currentStep += dir;
        this.updateStepper();
    },

    updateStepper() {
        document.querySelectorAll('.checkout-form-step').forEach(s => s.classList.remove('checkout-form-step--active'));
        document.querySelectorAll('.checkout-step').forEach(s => {
            s.classList.remove('checkout-step--active', 'checkout-step--completed');
            const stepNum = parseInt(s.dataset.step);
            if (stepNum < this.currentStep) s.classList.add('checkout-step--completed');
            if (stepNum === this.currentStep) s.classList.add('checkout-step--active');
        });

        const currentForm = document.getElementById(`step${this.currentStep}`);
        if (currentForm) currentForm.classList.add('checkout-form-step--active');
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
        if (nextBtn) nextBtn.textContent = this.currentStep === this.totalSteps ? 'Finalizar Pedido' : 'Siguiente';
    },

    calculateCosts() {
        const cartData = this.getCartData();
        const subtotal = cartData.total || 0;
        
        console.log('💰 Calculando costos para checkout:', { subtotal, items: cartData.items ? cartData.items.length : 0 });
        
        this.data.costs.subtotal = subtotal;
        
        let shipping = 0;
        if (this.data.delivery.method === 'shipping' && subtotal < 3000) {
            const deptoSelect = document.getElementById('chkDepto');
            const depto = deptoSelect ? deptoSelect.value : '';
            const loc = this.data.delivery.localidad;
            
            if (loc === 'Ciudad del Plata' || loc === 'Libertad') {
                shipping = 150;
            } else if (depto === 'Montevideo') {
                shipping = 300;
            } else if (depto !== '') {
                shipping = 300;
            }
        }

        this.data.costs.shipping = shipping;
        this.data.costs.total = subtotal + shipping;

        const chkSubtotal = document.getElementById('chkSubtotal');
        const chkShipping = document.getElementById('chkShipping');
        const chkTotal = document.getElementById('chkTotal');

        if (chkSubtotal) chkSubtotal.textContent = `$${subtotal.toLocaleString()}`;
        if (chkShipping) chkShipping.textContent = shipping === 0 ? (this.data.delivery.method === 'pickup' ? '$0' : '¡GRATIS!') : `$${shipping}`;
        if (chkTotal) chkTotal.textContent = `$${this.data.costs.total.toLocaleString()}`;
    },

    async finishOrder() {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = 'Procesando...'; }

        try {
            const cartData = this.getCartData();

            if (this.data.payment.method === 'online') {
                // --- PAGO ONLINE CON MERCADOPAGO ---

                // 1. Guardar pedido como "pendiente_pago" para no perderlo antes de redirigir
                let pedidoId = null;
                if (window.Orders) {
                    pedidoId = await Orders.saveOrder({
                        total: this.data.costs.total,
                        items: cartData.items,
                        metodoPago: 'online',
                        metodoEntrega: this.data.delivery.method,
                        direccion: this.data.delivery,
                        cliente: this.data.customer,
                        estado: 'pendiente_pago'
                    });
                }

                // 2. Llamar la función serverless de Vercel para crear la preferencia de pago
                if (nextBtn) nextBtn.textContent = 'Conectando con MercadoPago...';

                const response = await fetch(MP_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cartData.items,
                        cliente: this.data.customer,
                        total: this.data.costs.total,
                        pedidoId: pedidoId || 'sin_ref',
                        siteUrl: window.location.origin + window.location.pathname
                    })
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.error || 'No se pudo crear la preferencia de pago.');
                }

                const result = await response.json();

                // 3. Redirigir a MercadoPago
                if (nextBtn) nextBtn.textContent = 'Redirigiendo...';
                window.location.href = result.initPoint;

            } else {
                // --- PAGO EN EFECTIVO / AL RECIBIR ---
                if (window.Orders) {
                    await Orders.saveOrder({
                        total: this.data.costs.total,
                        items: cartData.items,
                        metodoPago: this.data.payment.method,
                        metodoEntrega: this.data.delivery.method,
                        direccion: this.data.delivery,
                        cliente: this.data.customer
                    });
                }

                await this.sendConfirmationMessage();
                alert('¡Gracias! Tu pedido ha sido recibido. Te enviamos una confirmación por WhatsApp.');
                if (window.carrito) window.carrito.vaciarCarrito();
                this.toggleModal(false);
            }

        } catch (error) {
            console.error('Error al finalizar pedido:', error);
            alert('Hubo un problema al procesar tu pedido:\n\n' + (error.message || error));
            if (nextBtn) { nextBtn.disabled = false; nextBtn.textContent = 'Finalizar Pedido'; }
        }
    },

    async sendConfirmationMessage() {
        if (!this.ULTRAMSG_INSTANCE || !this.ULTRAMSG_TOKEN) {
            console.warn('⚠️ UltraMsg no configurado.');
            return;
        }

        const msg = `*¡Hola ${this.data.customer.name}!* 🔧\nGracias por tu compra en *MP Ferretería*.\n\n` +
                    `🛍️ *Resumen del pedido:*\n` +
                    `- Total: $${this.data.costs.total.toLocaleString()}\n` +
                    `- Entrega: ${this.data.delivery.method === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}\n` +
                    `- Pago: ${this.data.payment.method === 'efectivo' ? 'Efectivo / Al recibir' : 'Online'}\n\n` +
                    `Nos pondremos en contacto contigo a la brevedad.`;

        const url = `https://api.ultramsg.com/${this.ULTRAMSG_INSTANCE}/messages/chat`;
        const params = new URLSearchParams({
            token: this.ULTRAMSG_TOKEN,
            to: this.data.customer.phone,
            body: msg
        });

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
        } catch (error) {
            console.error('❌ Error enviando UltraMsg:', error);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Checkout.init());
