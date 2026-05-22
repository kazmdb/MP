/**
 * Motor de búsqueda inteligente — Ferretería
 * Características: scoring por relevancia, sinónimos, tolerancia a errores
 * tipográficos, historial de búsquedas y resaltado de coincidencias.
 */
(function (root) {
    'use strict';

    // ── Sinónimos del sector ferretería ────────────────────────────────────────
    const SINONIMOS = {
        'taladro': ['taladradora', 'perforadora', 'drill'],
        'amoladora': ['esmeriladora', 'esmeril', 'amoladora angular', 'pulidora'],
        'broca': ['mecha', 'brocas', 'punta de taladro'],
        'tornillo': ['perno', 'tornillos', 'tirafondo'],
        'tuerca': ['tuercas', 'nut'],
        'arandela': ['arandelas', 'washer'],
        'llave inglesa': ['llave ajustable', 'llave perico', 'llave de tubo'],
        'destornillador': ['desarmador', 'atornillador'],
        'cutter': ['navaja', 'cuter', 'trincheta'],
        'martillo': ['mazo', 'maza', 'malleto'],
        'alicate': ['pinza', 'alicates', 'pinzas'],
        'cable': ['cables', 'alambre', 'conductor', 'hilo electrico'],
        'interruptor': ['switch', 'apagador', 'conmutador'],
        'enchufe': ['contacto', 'tomacorriente', 'clavija', 'plug'],
        'cinta adhesiva': ['tape', 'cinta', 'cinta americana', 'duct tape'],
        'pintura': ['esmalte', 'barniz', 'latex', 'pintura latex'],
        'brocha': ['pincel', 'brochas'],
        'rodillo': ['rolo', 'rodillo de pintura'],
        'lija': ['papel lija', 'papel abrasivo', 'lijas'],
        'nivel': ['nivel burbuja', 'nivel de burbuja'],
        'flexometro': ['metro', 'cinta metrica', 'medidor', 'flexometro'],
        'guante': ['guantes', 'guantes de trabajo', 'guantes proteccion'],
        'casco': ['casco de seguridad', 'helmet', 'casco protector'],
        'gafas': ['lentes de seguridad', 'gogles', 'gafas de seguridad', 'lentes proteccion'],
        'sierra': ['serrucho', 'serrote'],
        'sierra circular': ['sierra de disco', 'circular electrica', 'tronzadora'],
        'soldadora': ['soldador', 'maquina de soldar', 'equipo de soldar'],
        'electrodo': ['varilla de soldar', 'varilla electrodo'],
        'compresor': ['compresor de aire', 'compresora'],
        'candado': ['cerrojo', 'lock', 'candados'],
        'cerradura': ['chapa', 'lock', 'cerrojo'],
        'bisagra': ['gozne', 'bisagras', 'pernio'],
        'impermeabilizante': ['impermeabilizador', 'sellador impermeable'],
        'manguera': ['manga de riego', 'hose', 'manga'],
        'pala': ['paleta', 'pala redonda', 'pala cuadrada'],
        'rastrillo': ['rastrillo de jardin', 'azada'],
        'cemento': ['concreto', 'mortero'],
        'silicona': ['silicon', 'sellador', 'sellador silicona'],
        'clavos': ['clavo', 'puntilla', 'puntillas', 'tachuela'],
    };

    // ── Normalizar texto: minúsculas, sin acentos, sin caracteres especiales ──
    function normalizar(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ── Distancia de Levenshtein (para tolerancia a errores tipográficos) ──────
    function levenshtein(a, b) {
        if (a === b) return 0;
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        if (Math.abs(a.length - b.length) > 2) return 99;
        const row = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            let prev = i;
            for (let j = 1; j <= b.length; j++) {
                const val = a[i - 1] === b[j - 1]
                    ? row[j - 1]
                    : Math.min(row[j - 1], prev, row[j]) + 1;
                row[j - 1] = prev;
                prev = val;
            }
            row[b.length] = prev;
        }
        return row[b.length];
    }

    // ── Expandir query con sinónimos ──────────────────────────────────────────
    function expandirTerminos(queryNorm) {
        const terminos = new Set([queryNorm]);
        for (const [clave, sinonimos] of Object.entries(SINONIMOS)) {
            const claveNorm = normalizar(clave);
            if (queryNorm.includes(claveNorm)) {
                sinonimos.forEach(s => terminos.add(normalizar(s)));
            }
            for (const sin of sinonimos) {
                if (normalizar(sin) === queryNorm) terminos.add(claveNorm);
            }
        }
        return Array.from(terminos);
    }

    // ── Calcular relevancia de un producto para una query ─────────────────────
    function scoreProducto(producto, queryNorm, tokens) {
        const nombre = normalizar(producto.nombre);
        const sku = normalizar(producto.sku);
        const cat = normalizar(producto.categoria_principal);
        const subcat = normalizar(producto.subcategoria);
        const marca = normalizar(producto.marca);
        let score = 0;

        // SKU (máxima prioridad — búsqueda por código exacto)
        if (sku === queryNorm)             score += 1000;
        else if (sku.startsWith(queryNorm)) score += 500;
        else if (sku.includes(queryNorm))   score += 300;

        // Nombre completo
        if (nombre === queryNorm)              score += 800;
        else if (nombre.startsWith(queryNorm)) score += 350;
        else if (nombre.includes(queryNorm))   score += 180;

        // Tokens individuales
        for (const token of tokens) {
            if (token.length < 2) continue;
            if (nombre.includes(token))  score += 70;
            if (sku.includes(token))     score += 50;
            if (subcat.includes(token))  score += 35;
            if (cat.includes(token))     score += 20;
            if (marca.includes(token))   score += 25;
        }

        // Fuzzy (solo cuando no hay match exacto)
        if (score === 0 && tokens.length > 0) {
            const palabras = nombre.split(' ');
            for (const token of tokens) {
                if (token.length < 4) continue;
                for (const palabra of palabras) {
                    if (palabra.length < 3) continue;
                    const d = levenshtein(token, palabra);
                    if (d === 1)                       score += 25;
                    else if (d === 2 && token.length > 5) score += 8;
                }
            }
        }

        if (score > 0 && producto.stock !== 0) score += 3;
        return score;
    }

    // ── Motor de búsqueda principal ───────────────────────────────────────────
    function buscar(query, categoriaFiltro) {
        categoriaFiltro = categoriaFiltro || 'all';
        const productos = window.productos || [];
        if (!productos.length || !query || query.trim().length < 2) return [];

        const queryNorm = normalizar(query);
        const tokens = queryNorm.split(' ').filter(t => t.length >= 2);
        const terminos = expandirTerminos(queryNorm);
        const catFiltroNorm = categoriaFiltro !== 'all' ? normalizar(categoriaFiltro) : null;

        const resultados = [];
        for (const producto of productos) {
            if (catFiltroNorm) {
                if (!normalizar(producto.categoria_principal || '').includes(catFiltroNorm)) continue;
            }
            let maxScore = scoreProducto(producto, queryNorm, tokens);
            for (const termino of terminos) {
                if (termino === queryNorm) continue;
                const tTokens = termino.split(' ').filter(t => t.length >= 2);
                const s = scoreProducto(producto, termino, tTokens);
                if (s > maxScore) maxScore = s;
            }
            if (maxScore > 0) resultados.push({ producto, score: maxScore });
        }

        resultados.sort((a, b) => b.score - a.score);
        return resultados.map(r => r.producto);
    }

    // ── Historial de búsquedas ────────────────────────────────────────────────
    var HISTORIAL_KEY = 'bs_historial';
    var MAX_HISTORIAL = 6;

    function getHistorial() {
        try { return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]'); }
        catch (e) { return []; }
    }

    function guardarHistorial(query) {
        if (!query || query.trim().length < 2) return;
        var q = query.trim();
        var h = getHistorial().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
        h.unshift(q);
        if (h.length > MAX_HISTORIAL) h.length = MAX_HISTORIAL;
        localStorage.setItem(HISTORIAL_KEY, JSON.stringify(h));
    }

    function eliminarDeHistorial(query) {
        var h = getHistorial().filter(function (x) { return x.toLowerCase() !== query.toLowerCase(); });
        localStorage.setItem(HISTORIAL_KEY, JSON.stringify(h));
    }

    // ── Utilidades HTML ────────────────────────────────────────────────────────
    function esc(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function resaltar(texto, query) {
        if (!query || !texto) return esc(texto);
        var result = esc(texto);
        var tokens = normalizar(query).split(' ').filter(function (t) { return t.length >= 2; });
        for (var i = 0; i < tokens.length; i++) {
            var escaped = tokens[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            try {
                result = result.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark class="sh">$1</mark>');
            } catch (e) { /* ignorar regex inválido */ }
        }
        return result;
    }

    function formatPrecio(precio) {
        return '$' + Number(precio).toFixed(2);
    }

    // ── Dropdown desktop ──────────────────────────────────────────────────────
    var _dropdown = null;
    var _closeHandler = null;

    function limpiar() {
        if (_dropdown) { _dropdown.remove(); _dropdown = null; }
        if (_closeHandler) { document.removeEventListener('click', _closeHandler); _closeHandler = null; }
    }

    function posicionar(el, anchor) {
        var rect = anchor.getBoundingClientRect();
        el.style.top  = (rect.bottom + 4) + 'px';
        el.style.left = rect.left + 'px';
        el.style.width = rect.width + 'px';
    }

    // Historial: panel que aparece al enfocar el input vacío
    function mostrarHistorial(anchor, onSelect) {
        limpiar();
        var historial = getHistorial();
        if (!historial.length) return;

        var div = document.createElement('div');
        div.className = 'bs-dropdown';
        div.innerHTML =
            '<div class="bs-dropdown__section-title">Búsquedas recientes</div>' +
            '<div class="bs-dropdown__history-list">' +
            historial.map(function (q) {
                return '<div class="bs-dropdown__history-item" data-query="' + esc(q) + '">' +
                    '<svg class="bs-dropdown__history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
                    '<span>' + esc(q) + '</span>' +
                    '<button class="bs-dropdown__history-remove" data-query="' + esc(q) + '" aria-label="Eliminar búsqueda">&times;</button>' +
                    '</div>';
            }).join('') +
            '</div>';

        posicionar(div, anchor);
        document.body.appendChild(div);
        _dropdown = div;

        div.querySelectorAll('.bs-dropdown__history-item').forEach(function (item) {
            item.addEventListener('click', function (e) {
                if (e.target.classList.contains('bs-dropdown__history-remove')) return;
                onSelect(item.dataset.query);
            });
        });
        div.querySelectorAll('.bs-dropdown__history-remove').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                eliminarDeHistorial(btn.dataset.query);
                btn.closest('.bs-dropdown__history-item').remove();
                if (!div.querySelector('.bs-dropdown__history-item')) limpiar();
            });
        });

        _closeHandler = function (e) {
            if (!div.contains(e.target) && e.target !== anchor) limpiar();
        };
        setTimeout(function () { document.addEventListener('click', _closeHandler); }, 0);
        window.addEventListener('scroll', limpiar, { once: true, passive: true });
    }

    // Resultados: dropdown con productos encontrados
    function mostrarResultados(resultados, query, anchor) {
        limpiar();
        var div = document.createElement('div');
        div.className = 'bs-dropdown';

        if (!resultados.length) {
            div.innerHTML =
                '<div class="bs-dropdown__empty">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>' +
                '<p>Sin resultados para <strong>' + esc(query) + '</strong></p>' +
                '<p class="bs-dropdown__empty-tip">Revisa la ortografía o prueba con menos palabras</p>' +
                '</div>';
        } else {
            var limitados = resultados.slice(0, 8);
            var cats = [];
            limitados.forEach(function (p) {
                if (p.categoria_principal && cats.indexOf(p.categoria_principal) === -1) cats.push(p.categoria_principal);
            });

            var html =
                '<div class="bs-dropdown__header">' +
                '<span class="bs-dropdown__count">' + resultados.length + ' resultado' + (resultados.length !== 1 ? 's' : '') + '</span>' +
                (cats.length > 1 ? '<span class="bs-dropdown__cats">' + cats.slice(0, 3).join(' · ') + '</span>' : '') +
                '</div>' +
                '<div class="bs-dropdown__list">';

            limitados.forEach(function (producto) {
                var imagenSrc = window.getCloudinaryUrl
                    ? window.getCloudinaryUrl(producto.imagen)
                    : (producto.imagen || 'assets/images/placeholder-product.png');

                var oferta = window.getOferta ? window.getOferta(producto.id) : null;
                var precioFinal = oferta ? window.getPrecioConOferta(producto.precio, oferta.descuento) : producto.precio;
                var enStock = producto.stock !== 0;
                var catLabel = producto.subcategoria || producto.categoria_principal || '';

                html +=
                    '<div class="bs-dropdown__item" data-href="producto.html?id=' + producto.id + '">' +
                    '<a href="producto.html?id=' + producto.id + '" class="bs-dropdown__item-img" tabindex="-1">' +
                    '<img src="' + esc(imagenSrc) + '" alt="' + esc(producto.nombre) + '" loading="lazy">' +
                    '</a>' +
                    '<div class="bs-dropdown__item-info">' +
                    '<p class="bs-dropdown__item-name">' + resaltar(producto.nombre, query) + '</p>' +
                    '<div class="bs-dropdown__item-meta">' +
                    '<span class="bs-dropdown__item-sku">SKU: ' + esc(producto.sku) + '</span>' +
                    (catLabel ? '<span class="bs-dropdown__item-cat">' + esc(catLabel) + '</span>' : '') +
                    '<span class="bs-dropdown__item-stock ' + (enStock ? 'bs-dropdown__item-stock--ok' : 'bs-dropdown__item-stock--out') + '">' +
                    (enStock ? 'En stock' : 'Agotado') + '</span>' +
                    '</div>' +
                    (oferta
                        ? '<div class="bs-dropdown__item-prices">' +
                          '<span class="bs-dropdown__item-price">' + formatPrecio(precioFinal) + '</span>' +
                          '<span class="bs-dropdown__item-price-orig">' + formatPrecio(producto.precio) + '</span>' +
                          '<span class="bs-dropdown__item-badge">-' + oferta.descuento + '%</span>' +
                          '</div>'
                        : '<p class="bs-dropdown__item-price">' + formatPrecio(producto.precio) + '</p>'
                    ) +
                    '</div>' +
                    '<button class="bs-dropdown__item-add" data-id="' + producto.id + '" aria-label="Agregar al carrito">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>' +
                    '</button>' +
                    '</div>';
            });

            html += '</div>';

            if (resultados.length > 8) {
                html += '<button class="bs-dropdown__ver-todos" data-query="' + esc(query) + '">Ver todos los ' + resultados.length + ' resultados &rarr;</button>';
            }

            div.innerHTML = html;

            div.querySelectorAll('.bs-dropdown__item').forEach(function (item) {
                item.addEventListener('click', function (e) {
                    if (e.target.closest('.bs-dropdown__item-add')) return;
                    guardarHistorial(query);
                    window.location.href = item.dataset.href;
                });
            });

            div.querySelectorAll('.bs-dropdown__item-add').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var id = Number(btn.dataset.id);
                    if (typeof window.agregarAlCarrito === 'function') {
                        window.agregarAlCarrito(id, 1);
                    }
                });
            });

            var verTodos = div.querySelector('.bs-dropdown__ver-todos');
            if (verTodos) {
                verTodos.addEventListener('click', function () {
                    guardarHistorial(query);
                    window.location.href = 'catalogo.html?busqueda=' + encodeURIComponent(query);
                });
            }
        }

        posicionar(div, anchor);
        document.body.appendChild(div);
        _dropdown = div;

        _closeHandler = function (e) {
            if (!div.contains(e.target) && e.target !== anchor) limpiar();
        };
        setTimeout(function () { document.addEventListener('click', _closeHandler); }, 0);
        window.addEventListener('scroll', limpiar, { once: true, passive: true });
    }

    // ── Dropdown mobile ────────────────────────────────────────────────────────
    function limpiarMobile(container) {
        var prev = container.querySelector('.bs-dropdown-mobile');
        if (prev) prev.remove();
    }

    function mostrarResultadosMobile(resultados, query, container) {
        limpiarMobile(container);
        var div = document.createElement('div');
        div.className = 'bs-dropdown-mobile';

        if (!resultados.length) {
            div.innerHTML = '<p class="bs-dropdown-mobile__empty">Sin resultados para &ldquo;' + esc(query) + '&rdquo;</p>';
        } else {
            var limitados = resultados.slice(0, 5);
            var html = '';
            limitados.forEach(function (producto) {
                var imagenSrc = window.getCloudinaryUrl
                    ? window.getCloudinaryUrl(producto.imagen)
                    : (producto.imagen || 'assets/images/placeholder-product.png');
                var oferta = window.getOferta ? window.getOferta(producto.id) : null;
                var precioFinal = oferta ? window.getPrecioConOferta(producto.precio, oferta.descuento) : producto.precio;
                html +=
                    '<a class="bs-dropdown-mobile__item" href="producto.html?id=' + producto.id + '">' +
                    '<img class="bs-dropdown-mobile__img" src="' + esc(imagenSrc) + '" alt="' + esc(producto.nombre) + '" loading="lazy">' +
                    '<div class="bs-dropdown-mobile__info">' +
                    '<p class="bs-dropdown-mobile__name">' + resaltar(producto.nombre, query) + '</p>' +
                    '<p class="bs-dropdown-mobile__price">' + formatPrecio(precioFinal) + '</p>' +
                    '</div>' +
                    '</a>';
            });
            if (resultados.length > 5) {
                html += '<button class="bs-dropdown-mobile__ver-todos" ' +
                    'onclick="location.href=\'catalogo.html?busqueda=' + encodeURIComponent(query) + '\'">' +
                    'Ver todos los ' + resultados.length + ' resultados &rarr;</button>';
            }
            div.innerHTML = html;
        }

        container.appendChild(div);
    }

    // ── Overlay mobile full-screen ────────────────────────────────────────────
    function renderOverlayResultados(resultados, query, body, catalogUrl) {
        body.innerHTML = '';

        if (!resultados.length) {
            body.innerHTML =
                '<div class="msol-empty">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" width="40" height="40"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>' +
                '<p>Sin resultados para <strong>' + esc(query) + '</strong></p>' +
                '</div>';
            return;
        }

        var frag = document.createDocumentFragment();

        // Cabecera
        var count = document.createElement('div');
        count.className = 'msol-count';
        count.textContent = resultados.length + ' resultado' + (resultados.length !== 1 ? 's' : '');
        frag.appendChild(count);

        // Items (máx 12 en overlay para aprovechar el espacio)
        var limitados = resultados.slice(0, 12);
        limitados.forEach(function (producto) {
            var imagenSrc = window.getCloudinaryUrl
                ? window.getCloudinaryUrl(producto.imagen)
                : (producto.imagen || 'assets/images/placeholder-product.png');
            var oferta = window.getOferta ? window.getOferta(producto.id) : null;
            var precioFinal = oferta ? window.getPrecioConOferta(producto.precio, oferta.descuento) : producto.precio;

            var item = document.createElement('div');
            item.className = 'msol-item';
            item.dataset.href = 'producto.html?id=' + producto.id;
            item.innerHTML =
                '<img class="msol-item__img" src="' + esc(imagenSrc) + '" alt="' + esc(producto.nombre) + '" loading="lazy">' +
                '<div class="msol-item__info">' +
                '<p class="msol-item__name">' + resaltar(producto.nombre, query) + '</p>' +
                '<p class="msol-item__sku">SKU: ' + esc(producto.sku || '') + '</p>' +
                '<p class="msol-item__price">' + formatPrecio(precioFinal) + '</p>' +
                '</div>' +
                '<button class="msol-item__add" data-id="' + producto.id + '" aria-label="Agregar al carrito">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path stroke-linecap="round" d="M12 4v16m8-8H4"/></svg>' +
                '</button>';

            item.addEventListener('click', function (e) {
                if (e.target.closest('.msol-item__add')) return;
                guardarHistorial(query);
                window.location.href = item.dataset.href;
            });
            item.querySelector('.msol-item__add').addEventListener('click', function (e) {
                e.stopPropagation();
                var id = Number(this.dataset.id);
                if (typeof window.agregarAlCarrito === 'function') window.agregarAlCarrito(id, 1);
            });

            frag.appendChild(item);
        });

        // Ver todos
        if (resultados.length > 12) {
            var btn = document.createElement('button');
            btn.className = 'msol-ver-todos';
            btn.textContent = 'Ver todos los ' + resultados.length + ' resultados →';
            btn.addEventListener('click', function () {
                guardarHistorial(query);
                window.location.href = (catalogUrl || 'catalogo.html') + '?busqueda=' + encodeURIComponent(query);
            });
            frag.appendChild(btn);
        }

        body.appendChild(frag);
    }

    function renderOverlayHistorial(body, onSelect) {
        var historial = getHistorial();
        body.innerHTML = '';
        if (!historial.length) return;

        var titulo = document.createElement('div');
        titulo.className = 'msol-history-title';
        titulo.textContent = 'Búsquedas recientes';
        body.appendChild(titulo);

        historial.forEach(function (q) {
            var item = document.createElement('div');
            item.className = 'msol-history-item';
            item.innerHTML =
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
                '<span>' + esc(q) + '</span>' +
                '<button class="msol-history-remove" aria-label="Eliminar">×</button>';

            item.querySelector('span').addEventListener('click', function () { onSelect(q); });
            item.querySelector('.msol-history-remove').addEventListener('click', function (e) {
                e.stopPropagation();
                eliminarDeHistorial(q);
                item.remove();
            });
            body.appendChild(item);
        });
    }

    // Función global: inicializa el overlay en la página actual
    root.initMobileSearchOverlay = function (buscarFn, catalogUrl) {
        var overlay  = document.getElementById('mobileSearchOverlay');
        var input    = document.getElementById('mobileOverlayInput');
        var clearBtn = document.getElementById('mobileOverlayClear');
        var cancelBtn= document.getElementById('mobileOverlayCancel');
        var body     = document.getElementById('mobileOverlayBody');
        var toggle   = document.querySelector('.header__btn--search-mobile');

        if (!overlay || !toggle) return;

        var timeout;

        function abrir() {
            overlay.classList.add('mobile-search-overlay--active');
            document.body.style.overflow = 'hidden';
            setTimeout(function () { input.focus(); }, 80);
            renderOverlayHistorial(body, function (q) {
                input.value = q;
                buscarYMostrar(q);
            });
        }

        function cerrar() {
            overlay.classList.remove('mobile-search-overlay--active');
            document.body.style.overflow = '';
            input.value = '';
            body.innerHTML = '';
            clearBtn.classList.remove('mobile-search-overlay__clear-btn--visible');
        }

        function buscarYMostrar(query) {
            clearBtn.classList.toggle('mobile-search-overlay__clear-btn--visible', query.length > 0);
            if (query.length < 2) {
                renderOverlayHistorial(body, function (q) {
                    input.value = q;
                    buscarYMostrar(q);
                });
                return;
            }
            var resultados = buscarFn ? buscarFn(query) : (window.BuscadorInteligente ? window.BuscadorInteligente.buscar(query) : []);
            renderOverlayResultados(resultados, query, body, catalogUrl);
        }

        toggle.addEventListener('click', abrir);
        cancelBtn.addEventListener('click', cerrar);

        clearBtn.addEventListener('click', function () {
            input.value = '';
            clearBtn.classList.remove('mobile-search-overlay__clear-btn--visible');
            input.focus();
            renderOverlayHistorial(body, function (q) {
                input.value = q;
                buscarYMostrar(q);
            });
        });

        input.addEventListener('input', function () {
            clearTimeout(timeout);
            timeout = setTimeout(function () { buscarYMostrar(input.value.trim()); }, 220);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                clearTimeout(timeout);
                var q = input.value.trim();
                if (q.length >= 2) {
                    guardarHistorial(q);
                    window.location.href = (catalogUrl || 'catalogo.html') + '?busqueda=' + encodeURIComponent(q);
                }
            }
            if (e.key === 'Escape') cerrar();
        });

        // Botón atrás del navegador cierra el overlay
        window.addEventListener('popstate', cerrar);
    };

    // ── API pública ────────────────────────────────────────────────────────────
    root.BuscadorInteligente = {
        buscar:                  buscar,
        mostrarResultados:       mostrarResultados,
        mostrarHistorial:        mostrarHistorial,
        mostrarResultadosMobile: mostrarResultadosMobile,
        limpiarMobile:           limpiarMobile,
        limpiar:                 limpiar,
        guardarHistorial:        guardarHistorial,
        getHistorial:            getHistorial,
    };

})(window);
