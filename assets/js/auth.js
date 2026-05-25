/**
 * SISTEMA DE AUTENTICACIÓN CON FIREBASE (Nombre y Teléfono)
 */

// Configuración de Firebase (proporcionada por el usuario)
const firebaseConfig = {
  apiKey: "AIzaSyDsoWhzT3idi7kxyDB0sKm9oyF3zYMjEA4",
  authDomain: "mp-ferreteria.firebaseapp.com",
  projectId: "mp-ferreteria",
  storageBucket: "mp-ferreteria.firebasestorage.app",
  messagingSenderId: "1042327246837",
  appId: "1:1042327246837:web:42b5e543fe2577580932bc",
  measurementId: "G-RQP7JGRGHJ"
};

// Inicializar Firebase (usando la versión compat SDK)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
window.db = db;

class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderAuthModal();
            this.renderUserMenu();
            this.updateUI();
            this.setupEventListeners();
            if (this.currentUser) {
                document.dispatchEvent(new CustomEvent('authReady'));
            }
        });
    }

    // ============================================
    // LÓGICA DE FIREBASE
    // ============================================

    async register(name, phone) {
        try {
            this.showLoading(true);
            
            // 1. Verificar si el usuario ya existe en Firestore
            const userSnapshot = await db.collection('users')
                .where('phone', '==', phone)
                .get();

            if (!userSnapshot.empty) {
                this.showLoading(false);
                return { success: false, message: 'Este teléfono ya está registrado' };
            }

            // 2. Crear nuevo usuario en Firestore
            const newUser = {
                name: name,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await db.collection('users').add(newUser);
            
            // 3. Loguear automáticamente
            const userForLocal = { id: docRef.id, ...newUser, createdAt: new Date().toISOString() };
            this.setSession(userForLocal);
            
            this.showLoading(false);
            return { success: true, message: '¡Cuenta creada con éxito!' };

        } catch (error) {
            console.error("Error en registro:", error);
            this.showLoading(false);
            return { success: false, message: 'Error al conectar con el servidor' };
        }
    }

    async login(phone) {
        try {
            this.showLoading(true);
            
            // Buscar usuario por teléfono
            const userSnapshot = await db.collection('users')
                .where('phone', '==', phone)
                .get();

            if (userSnapshot.empty) {
                this.showLoading(false);
                return { success: false, message: 'Teléfono no encontrado' };
            }

            // Obtener datos del usuario
            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();
            
            const userForLocal = { 
                id: userDoc.id, 
                ...userData,
                createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : new Date().toISOString()
            };

            this.setSession(userForLocal);
            this.showLoading(false);
            this.closeModal();
            return { success: true, message: `Bienvenido, ${userData.name}` };

        } catch (error) {
            console.error("Error en login:", error);
            this.showLoading(false);
            return { success: false, message: 'Error de conexión' };
        }
    }

    setSession(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateUI();
        // Avisar a otros sistemas (ej: favoritos) que el usuario está listo
                document.dispatchEvent(new CustomEvent('authReady', { detail: { user: user } }));

    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        window.location.reload();
    }

    // ============================================
    // MANEJO DE UI
    // ============================================

    updateUI() {
        const accountBtns = document.querySelectorAll('.header__btn--account, .header__btn--account-mobile');
        
        accountBtns.forEach(btn => {
            const btnText = btn.querySelector('.header__btn-text, .header__menu-toggle__text');
            if (this.currentUser) {
                if (btnText) {
                    const firstName = this.currentUser.name.split(' ')[0];
                    btnText.textContent = btn.classList.contains('header__btn--account-mobile') ? firstName : `Hola, ${firstName}`;
                }
                btn.classList.add('header__btn--logged-in');
            } else {
                if (btnText) btnText.textContent = btn.classList.contains('header__btn--account-mobile') ? 'CUENTA' : 'Mi Cuenta';
                btn.classList.remove('header__btn--logged-in');
            }
        });
    }

    showLoading(isLoading) {
        const btns = document.querySelectorAll('.auth-modal__submit');
        btns.forEach(btn => {
            if (isLoading) {
                btn.disabled = true;
                btn.dataset.originalText = btn.textContent;
                btn.textContent = 'PROCESANDO...';
            } else {
                btn.disabled = false;
                btn.textContent = btn.dataset.originalText || 'INGRESAR';
            }
        });
    }

    renderAuthModal() {
        const modalHtml = `
            <div id="authModal" class="auth-modal">
                <div class="auth-modal__overlay"></div>
                <div class="auth-modal__container">
                    <button class="auth-modal__close" aria-label="Cerrar">&times;</button>
                    
                    <div id="authLogin" class="auth-modal__view">
                        <h2 class="auth-modal__title">Iniciar Sesión</h2>
                        <p class="auth-modal__subtitle">Ingresa tu teléfono para continuar</p>
                        <form id="loginForm" class="auth-modal__form">
                            <div class="auth-modal__group">
                                <label for="loginPhone">Número de Teléfono</label>
                                <input type="tel" id="loginPhone" placeholder="Ej: 099123456" required>
                            </div>
                            <button type="submit" class="auth-modal__submit">INGRESAR</button>
                        </form>
                        <p class="auth-modal__switch">¿No tienes cuenta? <a href="#" id="toRegister">Regístrate aquí</a></p>
                    </div>

                    <div id="authRegister" class="auth-modal__view" style="display: none;">
                        <h2 class="auth-modal__title">Crear Cuenta</h2>
                        <p class="auth-modal__subtitle">Solo necesitamos estos datos</p>
                        <form id="registerForm" class="auth-modal__form">
                            <div class="auth-modal__group">
                                <label for="regName">Nombre Completo</label>
                                <input type="text" id="regName" placeholder="Ej: Juan Pérez" required>
                            </div>
                            <div class="auth-modal__group">
                                <label for="regPhone">Teléfono / WhatsApp</label>
                                <input type="tel" id="regPhone" placeholder="Ej: 099123456" required>
                            </div>
                            <button type="submit" class="auth-modal__submit">CREAR MI CUENTA</button>
                        </form>
                        <p class="auth-modal__switch">¿Ya tienes cuenta? <a href="#" id="toLogin">Inicia sesión</a></p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    renderUserMenu() {
        if (document.getElementById('userMenu')) return;

        const menuHtml = `
            <div id="userMenu" class="user-menu">
                <div class="user-menu__header">
                    <span class="user-menu__name" id="userNameMenu">Usuario</span>
                    <span class="user-menu__phone" id="userPhoneMenu">Teléfono</span>
                </div>
                <button class="user-menu__item" id="btnMenuWishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Mis Favoritos
                </button>
                <button class="user-menu__item" id="btnMenuOrders">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Historial de Pedidos
                </button>
                <button class="user-menu__item user-menu__item--logout" id="btnMenuLogout">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        `;
        // Insertar en el body o dentro de un contenedor específico si es necesario
        // Pero lo posicionaremos de forma absoluta respecto al botón clicado
        document.body.insertAdjacentHTML('beforeend', menuHtml);
    }

    setupEventListeners() {
        // Abrir modal o menú
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.header__btn--account, .header__btn--account-mobile');
            if (btn) {
                if (this.currentUser) {
                    this.toggleUserMenu(btn);
                } else {
                    this.openModal();
                }
            } else if (!e.target.closest('#userMenu')) {
                // Cerrar menú si se hace clic fuera
                const menu = document.getElementById('userMenu');
                if (menu) menu.classList.remove('user-menu--active');
            }
        });

        // Eventos del Menú de Usuario
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btnMenuWishlist')) {
                if (window.wishlist) window.wishlist.openPanel();
                document.getElementById('userMenu').classList.remove('user-menu--active');
            }
            if (e.target.closest('#btnMenuOrders')) {
                if (typeof Orders !== 'undefined') Orders.togglePanel(true);
                document.getElementById('userMenu').classList.remove('user-menu--active');
            }
            if (e.target.closest('#btnMenuLogout')) {
                this.logout();
            }
        });

        // Cerrar modal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.auth-modal__close') || e.target.classList.contains('auth-modal__overlay')) {
                this.closeModal();
            }
        });

        // Switch vistas
        document.addEventListener('click', (e) => {
            if (e.target.id === 'toRegister') {
                e.preventDefault();
                document.getElementById('authLogin').style.display = 'none';
                document.getElementById('authRegister').style.display = 'block';
            }
            if (e.target.id === 'toLogin') {
                e.preventDefault();
                document.getElementById('authRegister').style.display = 'none';
                document.getElementById('authLogin').style.display = 'block';
            }
        });

        // Forms Submits (Async)
        document.addEventListener('submit', async (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                const phone = document.getElementById('loginPhone').value;
                const result = await this.login(phone);
                this.showMessage(result.message, result.success ? 'success' : 'error');
            }
            if (e.target.id === 'registerForm') {
                e.preventDefault();
                const name = document.getElementById('regName').value;
                const phone = document.getElementById('regPhone').value;
                const result = await this.register(name, phone);
                this.showMessage(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    setTimeout(() => this.closeModal(), 1800);
                }
            }
        });
    }

    showMessage(text, type) {
        // Eliminar mensaje previo si existe
        const existing = document.querySelector('.auth-modal__message');
        if (existing) existing.remove();

        const msg = document.createElement('div');
        msg.className = `auth-modal__message auth-modal__message--${type}`;
        msg.textContent = text;
        
        const activeView = document.querySelector('.auth-modal__view[style*="display: block"]') || document.getElementById('authLogin');
        activeView.appendChild(msg);

        // Auto-eliminar después de 4 segundos
        setTimeout(() => msg.remove(), 4000);
    }

    openModal() {
        document.getElementById('authModal').classList.add('auth-modal--active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('authModal').classList.remove('auth-modal--active');
        document.body.style.overflow = '';
    }

    toggleUserMenu(btn) {
        const menu = document.getElementById('userMenu');
        if (!menu) return;

        const isMobile = btn.classList.contains('header__btn--account-mobile');
        const parent = btn.parentElement;

        // Actualizar datos del usuario en el menú
        document.getElementById('userNameMenu').textContent = this.currentUser.name;
        document.getElementById('userPhoneMenu').textContent = this.currentUser.phone;

        // Mover el menú al contenedor del botón para posicionamiento relativo
        if (menu.parentElement !== parent) {
            parent.appendChild(menu);
        }

        // Reajustar estilos para posicionamiento relativo al padre
        menu.style.top = '100%';
        menu.style.marginTop = '10px';
        menu.style.position = 'absolute';
        
        if (isMobile) {
            // En móvil solemos centrarlo o pegarlo a la derecha del contenedor
            menu.style.right = '0';
            menu.style.left = 'auto';
        } else {
            // En PC, alinearlo con el inicio del botón que se clickeó
            // Usamos offsetLeft para que empiece donde empieza el botón
            const offset = btn.offsetLeft;
            menu.style.left = offset + 'px';
            menu.style.right = 'auto';
        }

        menu.classList.toggle('user-menu--active');
    }
}

window.auth = new Auth();
