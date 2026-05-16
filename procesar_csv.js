// Script de procesamiento de CSV para Ferretería
// Convierte el CSV en productos categorizados automáticamente

// ============================================
// REGLAS DE CATEGORIZACIÓN POR PALABRAS CLAVE
// ============================================

const reglasCategorizacion = {
    electricidad: {
        palabras: ['interruptor', 'toma', 'cable', 'ficha', 'conector', 'caja', 'modulo', 'lampara', 'led', 'foco', 'tortuga', 'tubo', 'transformador', 'tester', 'termica', 'diferencial', 'disyuntor', 'fusible', 'zocalo', 'portalampara', 'velador', 'timbre', ' RJ45', ' RJ11', 'coaxil', 'antena', 'telefono', 'wifi', 'inteligente'],
        subcategorias: {
            'interruptor': 'interruptores',
            'toma': 'tomas',
            'cable': 'cables',
            'ficha': 'fichas',
            'conector': 'conectores',
            'caja': 'cajas',
            'modulo': 'modulos',
            'lampara': 'lamparas',
            'led': 'iluminacion_led',
            'foco': 'focos',
            'tortuga': 'tortugas',
            'tubo': 'tubos_led',
            'transformador': 'transformadores',
            'tester': 'testers',
            'termica': 'termicas',
            'diferencial': 'diferenciales',
            'disyuntor': 'disyuntores',
            'fusible': 'fusibles',
            'zocalo': 'zocalos',
            'portalampara': 'portalamparas',
            'velador': 'veladores',
            'timbre': 'timbres',
            'RJ45': 'conectores_red',
            'RJ11': 'conectores_telefono',
            'coaxil': 'cables_coaxil',
            'antena': 'antenas',
            'telefono': 'telefonia',
            'wifi': 'wifi',
            'inteligente': 'domotica'
        }
    },
    herramientas: {
        palabras: ['taladro', 'amoladora', 'sierra', 'destornillador', 'llave', 'alicate', 'martillo', 'mecha', 'disco', 'torno', 'trincheta', 'tijera', 'corta', 'terraja', 'broca', 'soplete', 'torcha', 'compresor', 'pistola', 'remachadora', 'esmeril', 'pulidora', 'lijadora', 'router', 'caladora', 'atornillador', 'impacto', 'hidraulica', 'neumatica'],
        subcategorias: {
            'taladro': 'taladros',
            'amoladora': 'amoladoras',
            'sierra': 'sierras',
            'destornillador': 'destornilladores',
            'llave': 'llaves',
            'alicate': 'alicates',
            'martillo': 'martillos',
            'mecha': 'mechas',
            'disco': 'discos',
            'torno': 'tornos',
            'trincheta': 'trinchetas',
            'tijera': 'tijeras',
            'corta': 'cortadores',
            'terraja': 'terrajas',
            'broca': 'brocas',
            'soplete': 'sopletes',
            'torcha': 'torchas',
            'compresor': 'compresores',
            'pistola': 'pistolas',
            'remachadora': 'remachadoras',
            'esmeril': 'esmeriles',
            'pulidora': 'pulidoras',
            'lijadora': 'lijadoras',
            'router': 'routers',
            'caladora': 'caladoras',
            'atornillador': 'atornilladores',
            'impacto': 'impactos',
            'hidraulica': 'herramientas_hidraulicas',
            'neumatica': 'herramientas_neumaticas'
        }
    },
    construccion: {
        palabras: ['cemento', 'cal', 'arena', 'ladrillo', 'teja', 'pala', 'pico', 'azada', 'marron', 'yeso', 'viruta', 'termocontraible', 'varilla', 'hierro', 'acero', 'malla', 'ladrillo', 'bloque', 'adoquin', 'baldosa', 'ceramica', 'porcelanato'],
        subcategorias: {
            'cemento': 'cemento',
            'cal': 'cal',
            'arena': 'arena',
            'ladrillo': 'ladrillos',
            'teja': 'tejas',
            'pala': 'palas',
            'pico': 'picos',
            'azada': 'azadas',
            'marron': 'marrones',
            'yeso': 'yeso',
            'viruta': 'viruta_acero',
            'termocontraible': 'termocontraible',
            'varilla': 'varillas',
            'hierro': 'hierro',
            'acero': 'acero',
            'malla': 'mallas',
            'bloque': 'bloques',
            'adoquin': 'adoquines',
            'baldosa': 'baldosas',
            'ceramica': 'ceramicas',
            'porcelanato': 'porcelanatos'
        }
    },
    tornilleria: {
        palabras: ['tornillo', 'tuerca', 'arandela', 'bulon', 'clavo', 'grampa', 'remache', 'tirafondo', 'perno', 'esparrago', 'roscado', 'fixer', 'allen', 'binding', 'flangeado', 'frezado'],
        subcategorias: {
            'tornillo': 'tornillos',
            'tuerca': 'tuercas',
            'arandela': 'arandelas',
            'bulon': 'bulones',
            'clavo': 'clavos',
            'grampa': 'grampas',
            'remache': 'remaches',
            'tirafondo': 'tirafondos',
            'perno': 'pernos',
            'esparrago': 'esparragos',
            'roscado': 'roscados',
            'fixer': 'tornillos_fixer',
            'allen': 'tornillos_allen',
            'binding': 'tornillos_binding',
            'flangeado': 'tornillos_flangeados',
            'frezado': 'tornillos_frezados'
        }
    },
    pintura: {
        palabras: ['pintura', 'esmalte', 'latex', 'enduido', 'barniz', 'thinner', 'rodillo', 'brocha', 'removedor', 'tierra de colores', 'spray', 'impermeabilizante', 'sellador', 'primario'],
        subcategorias: {
            'pintura': 'pinturas',
            'esmalte': 'esmaltes',
            'latex': 'latex',
            'enduido': 'enduidos',
            'barniz': 'barnices',
            'thinner': 'thinner',
            'rodillo': 'rodillos',
            'brocha': 'brochas',
            'removedor': 'removedores',
            'tierra de colores': 'tierra_colores',
            'spray': 'sprays',
            'impermeabilizante': 'impermeabilizantes',
            'sellador': 'selladores',
            'primario': 'primarios'
        }
    },
    proteccion: {
        palabras: ['guante', 'lente', 'casco', 'zapato', 'bota', 'arnes', 'cinturon', 'mascara', 'protector', 'audifono', 'rodillera', 'coderas', 'calzado', 'seguridad', 'EPP', 'chaleco'],
        subcategorias: {
            'guante': 'guantes',
            'lente': 'lentes',
            'casco': 'cascos',
            'zapato': 'zapatos',
            'bota': 'botas',
            'arnes': 'arneses',
            'cinturon': 'cinturones',
            'mascara': 'mascaras',
            'protector': 'protectores',
            'audifono': 'audifonos',
            'rodillera': 'rodilleras',
            'coderas': 'coderas',
            'calzado': 'calzado',
            'seguridad': 'seguridad',
            'EPP': 'epp',
            'chaleco': 'chalecos'
        }
    },
    cerrajeria: {
        palabras: ['cerradura', 'llave', 'candado', 'pestillo', 'bisagra', 'cerrojo', 'tranca', 'picaporte', 'cilindro', 'combinacion', 'seguridad'],
        subcategorias: {
            'cerradura': 'cerraduras',
            'llave': 'llaves',
            'candado': 'candados',
            'pestillo': 'pestillos',
            'bisagra': 'bisagras',
            'cerrojo': 'cerrojos',
            'tranca': 'trancas',
            'picaporte': 'picaportes',
            'cilindro': 'cilindros',
            'combinacion': 'combinaciones',
            'seguridad': 'seguridad'
        }
    },
    jardin: {
        palabras: ['manguera', 'aspersor', 'regador', 'pala', 'rastrillo', 'tijera', 'podadora', 'corta', 'cesped', 'jardin', 'riego', 'aspersor', 'bomba', 'filtro'],
        subcategorias: {
            'manguera': 'mangueras',
            'aspersor': 'aspersores',
            'regador': 'regadores',
            'pala': 'palas',
            'rastrillo': 'rastrillos',
            'tijera': 'tijeras',
            'podadora': 'podadoras',
            'corta': 'cortadores',
            'cesped': 'cesped',
            'jardin': 'jardin',
            'riego': 'riego',
            'bomba': 'bombas',
            'filtro': 'filtros'
        }
    },
    hogar: {
        palabras: ['canilla', 'grifo', 'ducha', 'lavatorio', 'inodoro', 'cisterna', 'bidet', 'valvula', 'toallero', 'tirador', 'manija', 'espejo', 'tope', 'burlete', 'zocalo', 'alfombra', 'cortina'],
        subcategorias: {
            'canilla': 'canillas',
            'grifo': 'grifos',
            'ducha': 'duchas',
            'lavatorio': 'lavatorios',
            'inodoro': 'inodoros',
            'cisterna': 'cisternas',
            'bidet': 'bidets',
            'valvula': 'valvulas',
            'toallero': 'toalleros',
            'tirador': 'tiradores',
            'manija': 'manijas',
            'espejo': 'espejos',
            'tope': 'topes',
            'burlete': 'burletes',
            'zocalo': 'zocalos',
            'alfombra': 'alfombras',
            'cortina': 'cortinas'
        }
    },
    agricola: {
        palabras: ['piscina', 'cloro', 'bomba', 'filtro', 'insecticida', 'hormiguicida', 'raticida', 'fungicida', 'trampa', 'roedor', 'cucaracha', 'mosca', 'plaga', 'veneno', 'termometro', 'piscina'],
        subcategorias: {
            'piscina': 'piscinas',
            'cloro': 'cloro',
            'bomba': 'bombas',
            'filtro': 'filtros',
            'insecticida': 'insecticidas',
            'hormiguicida': 'hormiguicidas',
            'raticida': 'raticidas',
            'fungicida': 'fungicidas',
            'trampa': 'trampas',
            'roedor': 'roedores',
            'cucaracha': 'cucarachas',
            'mosca': 'moscas',
            'plaga': 'plagas',
            'veneno': 'venenos',
            'termometro': 'termometros'
        }
    },
    varios: {
        palabras: ['aceite', 'adhesivo', 'cinta', 'burlete', 'limpia', 'lubricante', 'vaselina', 'silicona', 'masilla', 'sellador', 'goma', 'espuma', 'pegamento', 'cola', 'disolvente', 'limpiador', 'desengrasante'],
        subcategorias: {
            'aceite': 'aceites',
            'adhesivo': 'adhesivos',
            'cinta': 'cintas',
            'burlete': 'burletes',
            'limpia': 'limpiadores',
            'lubricante': 'lubricantes',
            'vaselina': 'vaselina',
            'silicona': 'siliconas',
            'masilla': 'masillas',
            'sellador': 'selladores',
            'goma': 'gomas',
            'espuma': 'espumas',
            'pegamento': 'pegamentos',
            'cola': 'colas',
            'disolvente': 'disolventes',
            'limpiador': 'limpiadores',
            'desengrasante': 'desengrasantes'
        }
    },
    soldadura: {
        palabras: ['electrodo', 'varilla', 'soldar', 'soldadura', 'gas', 'ARGON', 'oxigeno', 'acetileno', 'torcha', 'soplete'],
        subcategorias: {
            'electrodo': 'electrodos',
            'varilla': 'varillas',
            'soldar': 'soldadura',
            'soldadura': 'soldadura',
            'gas': 'gases',
            'ARGON': 'argon',
            'oxigeno': 'oxigeno',
            'acetileno': 'acetileno',
            'torcha': 'torchas',
            'soplete': 'sopletes'
        }
    },
    automotriz: {
        palabras: ['corrugado', 'automovil', 'auto', 'coche', 'carro', 'bateria', 'aceite', 'freno', 'bujia'],
        subcategorias: {
            'corrugado': 'corrugados',
            'automovil': 'automotriz',
            'auto': 'automotriz',
            'coche': 'automotriz',
            'carro': 'automotriz',
            'bateria': 'baterias',
            'aceite': 'aceites',
            'freno': 'frenos',
            'bujia': 'bujias'
        }
    },
    cocina: {
        palabras: ['wok', 'olla', 'sarten', 'cocina', 'olla', 'cacerola', 'cafetera', 'tetera', 'cuchillo', 'tabla', 'utensilio'],
        subcategorias: {
            'wok': 'woks',
            'olla': 'ollas',
            'sarten': 'sartenes',
            'cocina': 'cocina',
            'cacerola': 'cacerolas',
            'cafetera': 'cafeteras',
            'tetera': 'teteras',
            'cuchillo': 'cuchillos',
            'tabla': 'tablas',
            'utensilio': 'utensilios'
        }
    },
    almacenamiento: {
        palabras: ['valija', 'caja', 'organizador', 'estante', 'balde', 'contenedor', 'baul', 'armario', 'gabinete'],
        subcategorias: {
            'valija': 'valijas',
            'caja': 'cajas',
            'organizador': 'organizadores',
            'estante': 'estantes',
            'balde': 'baldes',
            'contenedor': 'contenedores',
            'baul': 'baules',
            'armario': 'armarios',
            'gabinete': 'gabinetes'
        }
    },
    servicios: {
        palabras: ['trabajo', 'tramite', 'servicio', 'instalacion', 'reparacion', 'mantenimiento'],
        subcategorias: {
            'trabajo': 'trabajos',
            'tramite': 'tramites',
            'servicio': 'servicios',
            'instalacion': 'instalaciones',
            'reparacion': 'reparaciones',
            'mantenimiento': 'mantenimientos'
        }
    }
};

// ============================================
// COLORES POR CATEGORÍA PARA PLACEHOLDERS
// ============================================

const coloresCategoria = {
    electricidad: '#2C3E50',
    herramientas: '#ff0000',
    construccion: '#7F8C8D',
    tornilleria: '#95A5A6',
    pintura: '#3498DB',
    proteccion: '#27AE60',
    cerrajeria: '#34495E',
    jardin: '#16A085',
    hogar: '#9B59B6',
    agricola: '#1ABC9C',
    varios: '#E67E22',
    soldadura: '#34495E',
    automotriz: '#C0392B',
    cocina: '#D35400',
    almacenamiento: '#7F8C8D',
    servicios: '#95A5A6'
};

// ============================================
// FUNCIÓN PARA CATEGORIZAR UN PRODUCTO
// ============================================

function categorizarProducto(nombre, descripcion) {
    const textoCompleto = `${nombre} ${descripcion}`.toLowerCase();

    // Buscar coincidencia en cada categoría
    for (const [categoria, reglas] of Object.entries(reglasCategorizacion)) {
        for (const palabra of reglas.palabras) {
            if (textoCompleto.includes(palabra.toLowerCase())) {
                // Determinar subcategoría
                let subcategoria = 'general';
                for (const [subcategoriaPalabra, subcategoriaNombre] of Object.entries(reglas.subcategorias)) {
                    if (textoCompleto.includes(subcategoriaPalabra.toLowerCase())) {
                        subcategoria = subcategoriaNombre;
                        break;
                    }
                }
                return {
                    categoria_principal: categoria,
                    subcategoria: subcategoria
                };
            }
        }
    }

    // Si no se encuentra categoría, asignar a "varios"
    return {
        categoria_principal: 'varios',
        subcategoria: 'general'
    };
}

// ============================================
// FUNCIÓN PARA GENERAR BADGE AUTOMÁTICO
// ============================================

function generarBadge(stock, precio, precioOriginal) {
    if (precioOriginal && precioOriginal > precio) {
        const descuento = Math.round(((precioOriginal - precio) / precioOriginal) * 100);
        return {
            badge: `-${descuento}%`,
            badge_type: 'sale'
        };
    }

    if (stock >= 20) {
        return {
            badge: 'NUEVO',
            badge_type: 'new'
        };
    }

    if (stock >= 10) {
        return {
            badge: 'POPULAR',
            badge_type: 'popular'
        };
    }

    if (stock <= 3 && stock > 0) {
        return {
            badge: 'ÚLTIMOS',
            badge_type: 'last'
        };
    }

    return {
        badge: null,
        badge_type: null
    };
}

// ============================================
// FUNCIÓN PARA GENERAR IMAGEN PLACEHOLDER
// ============================================

function generarImagenPlaceholder(nombre, categoria, subcategoria) {
    const color = coloresCategoria[categoria] || '#95A5A6';
    const texto = nombre
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .substring(0, 30)
        .trim()
        .replace(/\s+/g, '+');

    return `https://placehold.co/280x200/${color.replace('#', '')}/FFFFFF?text=${texto}`;
}

// ============================================
// FUNCIÓN PARA PROCESAR LÍNEA DE CSV
// ============================================

function procesarLineaCSV(linea, id) {
    const columnas = linea.split(',');

    if (columnas.length < 5) {
        return null; // Saltar líneas inválidas
    }

    const categoria = columnas[0] || 'INT1';
    const sku = columnas[1] || `SKU-${id}`;
    const nombre = columnas[2] || 'Producto sin nombre';
    const descripcion = columnas[3] || '';
    const precio = parseFloat(columnas[4]) || 0;
    const stock = parseInt(columnas[5]) || 3;
    const unidad = columnas[6] || '';
    const categoriaOriginal = columnas[7] || '';
    const codigoAdicional = columnas[8] || '';

    // Saltar productos sin precio o con precio 0
    if (precio <= 0) {
        return null;
    }

    // Categorizar automáticamente
    const categorizacion = categorizarProducto(nombre, descripcion);

    // Generar badge
    const badgeInfo = generarBadge(stock, precio, null);

    // Generar imagen placeholder
    const imagen = generarImagenPlaceholder(nombre, categorizacion.categoria_principal, categorizacion.subcategoria);

    return {
        id: id,
        sku: `${categoria}-${sku}`,
        nombre: nombre.trim(),
        precio: Math.round(precio),
        precio_original: null,
        imagen: imagen,
        categoria_principal: categorizacion.categoria_principal,
        subcategoria: categorizacion.subcategoria,
        stock: stock,
        badge: badgeInfo.badge,
        badge_type: badgeInfo.badge_type,
        unidad: unidad,
        categoria_original: categoriaOriginal,
        codigo_adicional: codigoAdicional
    };
}

// ============================================
// FUNCIÓN PRINCIPAL PARA PROCESAR CSV
// ============================================

function procesarCSV(contenidoCSV) {
    const lineas = contenidoCSV.split('\n');
    const productos = [];
    let id = 1;

    // Saltar header (primera línea)
    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;

        const producto = procesarLineaCSV(linea, id);
        if (producto) {
            productos.push(producto);
            id++;
        }
    }

    return productos;
}

// ============================================
// FUNCIÓN PARA GENERAR ARCHIVO JS DE PRODUCTOS
// ============================================

function generarArchivoProductos(productos) {
    const productosJSON = JSON.stringify(productos, null, 4);

    let contenido = '// Base de datos de productos - Ferretería\n';
    contenido += '// Generado automáticamente desde CSV\n';
    contenido += `// Total de productos: ${productos.length}\n\n`;
    contenido += 'const productos = ' + productosJSON + ';\n\n';
    contenido += '// Función para formatear precio\n';
    contenido += 'function formatearPrecio(precio) {\n';
    contenido += '    return "$U " + precio.toLocaleString("es-UY");\n';
    contenido += '}\n\n';
    contenido += '// Función para obtener texto de stock\n';
    contenido += 'function obtenerTextoStock(stock) {\n';
    contenido += '    if (stock <= 0) return "Agotado";\n';
    contenido += '    if (stock <= 3) return "Últimos " + stock;\n';
    contenido += '    if (stock <= 10) return "Pocas unidades";\n';
    contenido += '    return "En stock";\n';
    contenido += '}\n\n';
    contenido += '// Función para obtener clase de stock\n';
    contenido += 'function obtenerClaseStock(stock) {\n';
    contenido += '    if (stock <= 0) return "product-card__stock--low";\n';
    contenido += '    if (stock <= 3) return "product-card__stock--low";\n';
    contenido += '    return "";\n';
    contenido += '}\n\n';
    contenido += '// Función principal para renderizar productos\n';
    contenido += 'function renderizarProductos(arrayProductos, contenedor) {\n';
    contenido += '    // Limpiar contenedor\n';
    contenido += '    contenedor.innerHTML = "";\n\n';
    contenido += '    // Verificar si hay productos\n';
    contenido += '    if (!arrayProductos || arrayProductos.length === 0) {\n';
    contenido += '        contenedor.innerHTML = \'<div class="catalog__empty"><p>No se encontraron productos.</p></div>\';\n';
    contenido += '        return;\n';
    contenido += '    }\n\n';
    contenido += '    // Generar HTML para cada producto\n';
    contenido += '    arrayProductos.forEach(producto => {\n';
    contenido += '        const article = document.createElement("article");\n';
    contenido += '        article.className = "product-card";\n';
    contenido += '        article.setAttribute("data-category", producto.categoria_principal);\n';
    contenido += '        article.setAttribute("data-sku", producto.sku);\n';
    contenido += '        article.setAttribute("data-id", producto.id);\n\n';
    contenido += '        // Badge (opcional)\n';
    contenido += '        let badgeHTML = "";\n';
    contenido += '        if (producto.badge) {\n';
    contenido += '            const badgeClass = producto.badge_type === "sale" ? "product-card__badge--sale" :\n';
    contenido += '                             producto.badge_type === "new" ? "product-card__badge--new" : "";\n';
    contenido += '            badgeHTML = \'<span class="product-card__badge \' + badgeClass + \'">\' + producto.badge + "</span>";\n';
    contenido += '        }\n\n';
    contenido += '        // Stock\n';
    contenido += '        const stockTexto = obtenerTextoStock(producto.stock);\n';
    contenido += '        const stockClase = obtenerClaseStock(producto.stock);\n\n';
    contenido += '        // Precio original (opcional)\n';
    contenido += '        let precioOriginalHTML = "";\n';
    contenido += '        if (producto.precio_original) {\n';
    contenido += '            precioOriginalHTML = \'<span class="product-card__price--original">\' + formatearPrecio(producto.precio_original) + "</span>";\n';
    contenido += '        }\n\n';
    contenido += '        // Construir HTML de la tarjeta en una sola variable\n';
    contenido += '        let cardHTML = \'\';\n';
    contenido += '        cardHTML += \'<div class="product-card__image-container">\';\n';
    contenido += '        cardHTML += badgeHTML;\n';
    contenido += '        cardHTML += \'<button class="product-card__wishlist" aria-label="Agregar a deseos">\';\n';
    contenido += '        cardHTML += \'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">\';\n';
    contenido += '        cardHTML += \'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />\';\n';
    contenido += '        cardHTML += \'</svg>\';\n';
    contenido += '        cardHTML += \'</button>\';\n';
    contenido += '        cardHTML += \'<img src="\' + producto.imagen + \'" alt="\' + producto.nombre + \'" class="product-card__image">\';\n';
    contenido += '        cardHTML += \'</div>\';\n';
    contenido += '        cardHTML += \'<div class="product-card__content">\';\n';
    contenido += '        cardHTML += \'<span class="product-card__category">\' + producto.subcategoria.toUpperCase() + \'</span>\';\n';
    contenido += '        cardHTML += \'<h3 class="product-card__title">\' + producto.nombre + \'</h3>\';\n';
    contenido += '        cardHTML += \'<p class="product-card__sku">SKU: <span>\' + producto.sku + \'</span></p>\';\n';
    contenido += '        cardHTML += \'<div class="product-card__price-container">\';\n';
    contenido += '        cardHTML += \'<span class="product-card__price">\' + formatearPrecio(producto.precio) + \'</span>\';\n';
    contenido += '        cardHTML += precioOriginalHTML;\n';
    contenido += '        cardHTML += \'<span class="product-card__stock \' + stockClase + \'">\' + stockTexto + "</span>";\n';
    contenido += '        cardHTML += \'</div>\';\n';
    contenido += '        cardHTML += \'<div class="product-card__actions">\';\n';
    contenido += '        cardHTML += \'<button class="product-card__add-btn" aria-label="Añadir al carrito" data-producto-id="\' + producto.id + \'">\';\n';
    contenido += '        cardHTML += \'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">\';\n';
    contenido += '        cardHTML += \'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />\';\n';
    contenido += '        cardHTML += \'</svg>\';\n';
    contenido += '        cardHTML += \'<span>Añadir</span>\';\n';
    contenido += '        cardHTML += \'</button>\';\n';
    contenido += '        cardHTML += \'<button class="product-card__quick-view" aria-label="Vista rápida" data-producto-id="\' + producto.id + \'">\';\n';
    contenido += '        cardHTML += \'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">\';\n';
    contenido += '        cardHTML += \'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />\';\n';
    contenido += '        cardHTML += \'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />\';\n';
    contenido += '        cardHTML += \'</svg>\';\n';
    contenido += '        cardHTML += \'</button>\';\n';
    contenido += '        cardHTML += \'</div>\';\n';
    contenido += '        cardHTML += \'</div>\';\n';
    contenido += '        article.innerHTML = cardHTML;\n';
    contenido += '        contenedor.appendChild(article);\n';
    contenido += '    });\n\n';
    contenido += '    // Inicializar event listeners para los nuevos productos\n';
    contenido += '    inicializarEventListenersProductos(contenedor);\n';
    contenido += '}\n\n';
    contenido += '// Función para inicializar event listeners de productos\n';
    contenido += 'function inicializarEventListenersProductos(contenedor) {\n';
    contenido += '    // Botones de wishlist\n';
    contenido += '    const wishlistButtons = contenedor.querySelectorAll(".product-card__wishlist");\n';
    contenido += '    wishlistButtons.forEach(button => {\n';
    contenido += '        button.addEventListener("click", function() {\n';
    contenido += '            this.classList.toggle("product-card__wishlist--active");\n';
    contenido += '        });\n';
    contenido += '    });\n\n';
    contenido += '    // Botones de añadir al carrito\n';
    contenido += '    const addButtons = contenedor.querySelectorAll(".product-card__add-btn");\n';
    contenido += '    addButtons.forEach(button => {\n';
    contenido += '        button.addEventListener("click", function() {\n';
    contenido += '            const productoId = this.getAttribute("data-producto-id");\n';
    contenido += '            const producto = productos.find(p => p.id === parseInt(productoId));\n';
    contenido += '            if (producto) {\n';
    contenido += '                // Verificar si existe el objeto catalog en el contexto global\n';
    contenido += '                if (typeof window.catalog !== "undefined" && window.catalog) {\n';
    contenido += '                    const card = this.closest(".product-card");\n';
    contenido += '                    const productData = window.catalog.getProductData(card);\n';
    contenido += '                    window.catalog.addToCart(productData);\n';
    contenido += '                    window.catalog.animateButton(this);\n';
    contenido += '                } else {\n';
    contenido += '                    // Fallback si no existe el objeto catalog\n';
    contenido += '                    console.log("Añadir al carrito:", producto.nombre);\n';
    contenido += '                    alert(producto.nombre + " añadido al carrito");\n';
    contenido += '                }\n';
    contenido += '            }\n';
    contenido += '        });\n';
    contenido += '    });\n\n';
    contenido += '    // Botones de vista rápida\n';
    contenido += '    const quickViewButtons = contenedor.querySelectorAll(".product-card__quick-view");\n';
    contenido += '    quickViewButtons.forEach(button => {\n';
    contenido += '        button.addEventListener("click", function() {\n';
    contenido += '            const productoId = this.getAttribute("data-producto-id");\n';
    contenido += '            const producto = productos.find(p => p.id === parseInt(productoId));\n';
    contenido += '            if (producto) {\n';
    contenido += '                // Aquí puedes agregar la lógica de vista rápida\n';
    contenido += '                console.log("Vista rápida:", producto.nombre);\n';
    contenido += '                alert("Vista rápida: " + producto.nombre);\n';
    contenido += '            }\n';
    contenido += '        });\n';
    contenido += '    });\n';
    contenido += '}\n\n';
    contenido += '// Función para filtrar productos por categoría\n';
    contenido += 'function filtrarPorCategoria(categoria) {\n';
    contenido += '    if (categoria === "todos") {\n';
    contenido += '        return productos;\n';
    contenido += '    }\n';
    contenido += '    return productos.filter(producto => producto.categoria_principal === categoria);\n';
    contenido += '}\n\n';
    contenido += '// Función para filtrar productos por subcategoría\n';
    contenido += 'function filtrarPorSubcategoria(subcategoria) {\n';
    contenido += '    return productos.filter(producto => producto.subcategoria === subcategoria);\n';
    contenido += '}\n\n';
    contenido += '// Función para buscar productos\n';
    contenido += 'function buscarProductos(termino) {\n';
    contenido += '    const terminoLower = termino.toLowerCase();\n';
    contenido += '    return productos.filter(producto =>\n';
    contenido += '        producto.nombre.toLowerCase().includes(terminoLower) ||\n';
    contenido += '        producto.sku.toLowerCase().includes(terminoLower) ||\n';
    contenido += '        producto.subcategoria.toLowerCase().includes(terminoLower)\n';
    contenido += '    );\n';
    contenido += '}\n\n';
    contenido += '// Función para ordenar productos\n';
    contenido += 'function ordenarProductos(arrayProductos, criterio) {\n';
    contenido += '    const productosOrdenados = [...arrayProductos];\n\n';
    contenido += '    switch(criterio) {\n';
    contenido += '        case "precio-asc":\n';
    contenido += '            return productosOrdenados.sort((a, b) => a.precio - b.precio);\n';
    contenido += '        case "precio-desc":\n';
    contenido += '            return productosOrdenados.sort((a, b) => b.precio - a.precio);\n';
    contenido += '        case "nombre-asc":\n';
    contenido += '            return productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));\n';
    contenido += '        case "nombre-desc":\n';
    contenido += '            return productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));\n';
    contenido += '        case "stock":\n';
    contenido += '            return productosOrdenados.sort((a, b) => b.stock - a.stock);\n';
    contenido += '        default:\n';
    contenido += '            return productosOrdenados;\n';
    contenido += '    }\n';
    contenido += '}\n\n';
    contenido += '// Función para obtener categorías únicas\n';
    contenido += 'function obtenerCategorias() {\n';
    contenido += '    const categorias = new Set();\n';
    contenido += '    productos.forEach(producto => {\n';
    contenido += '        categorias.add(producto.categoria_principal);\n';
    contenido += '    });\n';
    contenido += '    return Array.from(categorias).sort();\n';
    contenido += '}\n\n';
    contenido += '// Función para obtener subcategorías de una categoría\n';
    contenido += 'function obtenerSubcategorias(categoria) {\n';
    contenido += '    const subcategorias = new Set();\n';
    contenido += '    productos\n';
    contenido += '        .filter(producto => producto.categoria_principal === categoria)\n';
    contenido += '        .forEach(producto => {\n';
    contenido += '            subcategorias.add(producto.subcategoria);\n';
    contenido += '        });\n';
    contenido += '    return Array.from(subcategorias).sort();\n';
    contenido += '}\n\n';
    contenido += '// Exportar funciones para uso global\n';
    contenido += 'if (typeof window !== "undefined") {\n';
    contenido += '    window.productos = productos;\n';
    contenido += '    window.renderizarProductos = renderizarProductos;\n';
    contenido += '    window.filtrarPorCategoria = filtrarPorCategoria;\n';
    contenido += '    window.filtrarPorSubcategoria = filtrarPorSubcategoria;\n';
    contenido += '    window.buscarProductos = buscarProductos;\n';
    contenido += '    window.ordenarProductos = ordenarProductos;\n';
    contenido += '    window.obtenerCategorias = obtenerCategorias;\n';
    contenido += '    window.obtenerSubcategorias = obtenerSubcategorias;\n';
    contenido += '}\n\n';
    contenido += '// Exportar para Node.js (solo si está disponible)\n';
    contenido += 'if (typeof module !== "undefined" && module.exports) {\n';
    contenido += '    module.exports = productos;\n';
    contenido += '}\n';

    return contenido;
}

// ============================================
// EXPORTAR FUNCIONES PARA USO EN NODE.JS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        reglasCategorizacion,
        categorizarProducto,
        generarBadge,
        generarImagenPlaceholder,
        procesarLineaCSV,
        procesarCSV,
        generarArchivoProductos
    };
}