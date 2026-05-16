const CATEGORIAS = {
    herramientas: {
        nombre: 'Herramientas',
        dataMenu: 'herramientas',
        subcategorias: [
            {
                nombre: 'Herramienta eléctrica',
                items: [
                    { slug: 'taladros', texto: 'Taladros' },
                    { slug: 'sierras', texto: 'Sierras' },
                    { slug: 'amoladoras', texto: 'Amoladoras' },
                    { slug: 'pistolas', texto: 'Pistolas' },
                    { slug: 'lijadoras', texto: 'Lijadoras' }
                ]
            },
            {
                nombre: 'Herramienta neumática',
                items: [
                    { slug: 'compresores', texto: 'Compresores' },
                    { slug: 'herramientas_neumaticas', texto: 'Martillos neumáticos' },
                    { slug: 'pistolas', texto: 'Pistolas de clavos' },
                    { slug: 'impactos', texto: 'Herramientas de impacto' },
                    { slug: 'discos', texto: 'Discos' }
                ]
            },
            {
                nombre: 'Herramienta manual',
                items: [
                    { slug: 'destornilladores', texto: 'Destornilladores' },
                    { slug: 'llaves', texto: 'Llaves' },
                    { slug: 'martillos', texto: 'Martillos' },
                    { slug: 'alicates', texto: 'Alicates' },
                    { slug: 'cortadores', texto: 'Cortadores' }
                ]
            },
            {
                nombre: 'Medición',
                items: [
                    { slug: 'mechas', texto: 'Medición' }
                ]
            }
        ]
    },
    electricidad: {
        nombre: 'Material Eléctrico',
        dataMenu: 'electrico',
        subcategorias: [
            {
                nombre: 'Cableado',
                items: [
                    { slug: 'cables', texto: 'Cables eléctricos' },
                    { slug: 'cables_coaxil', texto: 'Cables coaxiales' },
                    { slug: 'conectores_red', texto: 'Cables de red' },
                    { slug: 'conectores', texto: 'Conectores' }
                ]
            },
            {
                nombre: 'Interruptores',
                items: [
                    { slug: 'interruptores', texto: 'Interruptores' },
                    { slug: 'tomas', texto: 'Tomas de corriente' },
                    { slug: 'cajas', texto: 'Cajas' }
                ]
            },
            {
                nombre: 'Iluminación LED',
                items: [
                    { slug: 'focos', texto: 'Focos LED' },
                    { slug: 'tubos_led', texto: 'Tiras LED' },
                    { slug: 'transformadores', texto: 'Transformadores' }
                ]
            },
            {
                nombre: 'Seguridad',
                items: [
                    { slug: 'termicas', texto: 'Térmicas' },
                    { slug: 'fusibles', texto: 'Fusibles' },
                    { slug: 'diferenciales', texto: 'Diferenciales' },
                    { slug: 'cajas', texto: 'Cajas' }
                ]
            }
        ]
    },
    tornilleria: {
        nombre: 'Tornillería',
        dataMenu: 'tornilleria',
        subcategorias: [
            {
                nombre: 'Tornillos',
                items: [
                    { slug: 'tornillos', texto: 'Tornillos' }
                ]
            },
            {
                nombre: 'Tuercas',
                items: [
                    { slug: 'tuercas', texto: 'Tuercas' }
                ]
            },
            {
                nombre: 'Arandelas',
                items: [
                    { slug: 'arandelas', texto: 'Arandelas' }
                ]
            },
            {
                nombre: 'Accesorios',
                items: [
                    { slug: 'pernos', texto: 'Pernos' },
                    { slug: 'bulones', texto: 'Espárragos' },
                    { slug: 'remaches', texto: 'Remaches' },
                    { slug: 'clavos', texto: 'Clavos' },
                    { slug: 'tirafondos', texto: 'Tirafondos' }
                ]
            }
        ]
    },
    cerrajeria: {
        nombre: 'Cerrajería',
        dataMenu: 'cerrajeria',
        subcategorias: [
            {
                nombre: 'Cerraduras',
                items: [
                    { slug: 'cerraduras', texto: 'Cerraduras' },
                    { slug: 'cilindros', texto: 'Cilindros' }
                ]
            },
            {
                nombre: 'Llaves',
                items: [
                    { slug: 'cilindros', texto: 'Llaves' }
                ]
            },
            {
                nombre: 'Candados',
                items: [
                    { slug: 'candados', texto: 'Candados' }
                ]
            },
            {
                nombre: 'Accesorios',
                items: [
                    { slug: 'bisagras', texto: 'Bisagras' },
                    { slug: 'pestillos', texto: 'Pestillos' }
                ]
            }
        ]
    },
    pintura: {
        nombre: 'Pintura',
        dataMenu: 'pintura',
        subcategorias: [
            {
                nombre: 'Pinturas',
                items: [
                    { slug: 'latex', texto: 'Pintura látex' },
                    { slug: 'esmaltes', texto: 'Pintura esmalte' },
                    { slug: 'pinturas', texto: 'Pinturas' }
                ]
            },
            {
                nombre: 'Disolventes',
                items: [
                    { slug: 'thinner', texto: 'Thinner' },
                    { slug: 'removedores', texto: 'Removedores' }
                ]
            },
            {
                nombre: 'Adhesivos',
                items: [
                    { slug: 'selladores', texto: 'Selladores' }
                ]
            },
            {
                nombre: 'Herramientas',
                items: [
                    { slug: 'rodillos', texto: 'Rodillos' },
                    { slug: 'brochas', texto: 'Brochas' }
                ]
            }
        ]
    },
    construccion: {
        nombre: 'Construcción',
        dataMenu: 'construccion',
        subcategorias: [
            {
                nombre: 'Acero y metales',
                items: [
                    { slug: 'acero', texto: 'Acero' },
                    { slug: 'hierro', texto: 'Hierro' },
                    { slug: 'varillas', texto: 'Varillas' },
                    { slug: 'viruta_acero', texto: 'Viruta de acero' }
                ]
            },
            {
                nombre: 'Mallas y termocontraíble',
                items: [
                    { slug: 'mallas', texto: 'Mallas' },
                    { slug: 'termocontraible', texto: 'Termocontraíble' }
                ]
            },
            {
                nombre: 'Materiales de obra',
                items: [
                    { slug: 'cal', texto: 'Cal' },
                    { slug: 'cemento', texto: 'Cemento' },
                    { slug: 'bloques', texto: 'Bloques' },
                    { slug: 'ladrillos', texto: 'Ladrillos' }
                ]
            },
            {
                nombre: 'Herramientas de obra',
                items: [
                    { slug: 'palas', texto: 'Palas' },
                    { slug: 'picos', texto: 'Picos' },
                    { slug: 'azadas', texto: 'Azadas' }
                ]
            },
            {
                nombre: 'Terminaciones',
                items: [
                    { slug: 'ceramicas', texto: 'Cerámicas' },
                    { slug: 'porcelanatos', texto: 'Porcelanatos' },
                    { slug: 'yeso', texto: 'Yeso' }
                ]
            },
            {
                nombre: 'Impermeabilización',
                items: [
                    { slug: 'marrones', texto: 'Burletes' }
                ]
            }
        ]
    },
    proteccion: {
        nombre: 'Protección',
        dataMenu: 'proteccion',
        subcategorias: [
            {
                nombre: 'Protección personal',
                items: [
                    { slug: 'guantes', texto: 'Guantes' },
                    { slug: 'lentes', texto: 'Lentes' },
                    { slug: 'mascaras', texto: 'Máscaras' },
                    { slug: 'protectores', texto: 'Protectores auditivos' }
                ]
            },
            {
                nombre: 'Calzado de seguridad',
                items: [
                    { slug: 'botas', texto: 'Botas' },
                    { slug: 'zapatos', texto: 'Zapatos' }
                ]
            },
            {
                nombre: 'Seguridad corporal',
                items: [
                    { slug: 'chalecos', texto: 'Chalecos' },
                    { slug: 'arneses', texto: 'Arneses' },
                    { slug: 'cinturones', texto: 'Cinturones' },
                    { slug: 'rodilleras', texto: 'Rodilleras' }
                ]
            }
        ]
    },
    jardin: {
        nombre: 'Jardín',
        dataMenu: 'jardin',
        subcategorias: [
            {
                nombre: 'Riego',
                items: [
                    { slug: 'mangueras', texto: 'Mangueras' },
                    { slug: 'regadores', texto: 'Regadores' },
                    { slug: 'aspersores', texto: 'Aspersores' },
                    { slug: 'riego', texto: 'Riego por goteo' }
                ]
            },
            {
                nombre: 'Jardinería',
                items: [
                    { slug: 'jardin', texto: 'Herramientas de jardín' },
                    { slug: 'rastrillos', texto: 'Rastrillos' }
                ]
            },
            {
                nombre: 'Piscinas',
                items: [
                    { slug: 'filtros', texto: 'Filtros' },
                    { slug: 'bombas', texto: 'Bombas' }
                ]
            }
        ]
    },
    agricola: {
        nombre: 'Agrícola',
        dataMenu: 'agricola',
        subcategorias: [
            {
                nombre: 'Control de plagas',
                items: [
                    { slug: 'trampas', texto: 'Trampas' },
                    { slug: 'hormiguicidas', texto: 'Hormiguicidas' },
                    { slug: 'insecticidas', texto: 'Insecticidas' },
                    { slug: 'cucarachas', texto: 'Cucarachicidas' },
                    { slug: 'moscas', texto: 'Moscicidas' },
                    { slug: 'raticidas', texto: 'Raticidas' }
                ]
            },
            {
                nombre: 'Fungicidas y venenos',
                items: [
                    { slug: 'fungicidas', texto: 'Fungicidas' },
                    { slug: 'venenos', texto: 'Venenos' }
                ]
            },
            {
                nombre: 'Piscinas',
                items: [
                    { slug: 'piscinas', texto: 'Acc. para piscinas' }
                ]
            }
        ]
    },
    automotriz: {
        nombre: 'Automotriz',
        dataMenu: 'automotriz',
        subcategorias: [
            {
                nombre: 'Accesorios',
                items: [
                    { slug: 'corrugados', texto: 'Corrugados' },
                    { slug: 'automotriz', texto: 'Acc. automotrices' }
                ]
            },
            {
                nombre: 'Baterías y bujías',
                items: [
                    { slug: 'baterias', texto: 'Baterías' },
                    { slug: 'bujias', texto: 'Bujías' }
                ]
            }
        ]
    },
    almacenamiento: {
        nombre: 'Almacenamiento',
        dataMenu: 'almacenamiento',
        subcategorias: [
            {
                nombre: 'Organización',
                items: [
                    { slug: 'valijas', texto: 'Valijas' },
                    { slug: 'organizadores', texto: 'Organizadores' }
                ]
            },
            {
                nombre: 'Contenedores',
                items: [
                    { slug: 'baldes', texto: 'Baldes' }
                ]
            }
        ]
    },
    cocina: {
        nombre: 'Cocina',
        dataMenu: 'cocina',
        subcategorias: [
            {
                nombre: 'Utensilios',
                items: [
                    { slug: 'cocina', texto: 'Utensilios de cocina' },
                    { slug: 'tablas', texto: 'Tablas' },
                    { slug: 'cuchillos', texto: 'Cuchillos' }
                ]
            },
            {
                nombre: 'Vajilla',
                items: [
                    { slug: 'ollas', texto: 'Ollas' },
                    { slug: 'sartenes', texto: 'Sartenes' },
                    { slug: 'woks', texto: 'Woks' }
                ]
            },
            {
                nombre: 'Electrodomésticos',
                items: [
                    { slug: 'cafeteras', texto: 'Cafeteras' }
                ]
            }
        ]
    },
    soldadura: {
        nombre: 'Soldadura',
        dataMenu: 'soldadura',
        subcategorias: [
            {
                nombre: 'Equipos',
                items: [
                    { slug: 'gases', texto: 'Gases' }
                ]
            },
            {
                nombre: 'Soldadura',
                items: [
                    { slug: 'soldadura', texto: 'Soldadura' }
                ]
            },
            {
                nombre: 'Insumos',
                items: [
                    { slug: 'electrodos', texto: 'Electrodos' }
                ]
            }
        ]
    },
    hogar: {
        nombre: 'Hogar',
        dataMenu: 'hogar',
        subcategorias: [
            {
                nombre: 'Fontanería',
                items: [
                    { slug: 'grifos', texto: 'Grifos' },
                    { slug: 'canillas', texto: 'Tuberías' },
                    { slug: 'valvulas', texto: 'Válvulas' }
                ]
            },
            {
                nombre: 'Decoración',
                items: [
                    { slug: 'manijas', texto: 'Molduras' },
                    { slug: 'tiradores', texto: 'Cornisas' },
                    { slug: 'topes', texto: 'Rodapiés' },
                    { slug: 'burletes', texto: 'Zócalos' },
                    { slug: 'alfombras', texto: 'Revestimientos' }
                ]
            },
            {
                nombre: 'Organización',
                items: [
                    { slug: 'estanterias', texto: 'Estanterías' },
                    { slug: 'ganchos', texto: 'Ganchos' },
                    { slug: 'cajas_organizadoras', texto: 'Cajas organizadoras' },
                    { slug: 'perchas', texto: 'Perchas' }
                ]
            },
            {
                nombre: 'Limpieza',
                items: [
                    { slug: 'escobas', texto: 'Escobas' },
                    { slug: 'trapeadores', texto: 'Trapeadores' },
                    { slug: 'cubos', texto: 'Cubos' },
                    { slug: 'aspiradoras', texto: 'Aspiradoras' }
                ]
            }
        ]
    }
};

function generarMegaMenuHTML() {
    let html = '';
    for (const [key, cat] of Object.entries(CATEGORIAS)) {
        html += `<div class="nav__mega-menu" data-menu="${cat.dataMenu}">\n`;
        html += `    <div class="nav__mega-menu__grid">\n`;
        for (const grupo of cat.subcategorias) {
            html += `        <div class="nav__mega-menu__column">\n`;
            html += `            <h3 class="nav__mega-menu__title">${grupo.nombre.toUpperCase()}</h3>\n`;
            html += `            <ul class="nav__mega-menu__list">\n`;
            for (const item of grupo.items) {
                const catKey = key === 'electricidad' ? 'electricidad' : key;
                html += `                <li><a href="catalogo.html?categoria=${catKey}&subcategoria=${item.slug}">${item.texto}</a></li>\n`;
            }
            html += `            </ul>\n`;
            html += `        </div>\n`;
        }
        html += `    </div>\n`;
        html += `</div>\n`;
    }
    return html;
}

function generarMenuMovilHTML() {
    let html = `<nav class="header__mobile-menu__nav">\n`;
    html += `    <ul class="header__mobile-menu__list">\n`;
    for (const [key, cat] of Object.entries(CATEGORIAS)) {
        const submenuId = `submenu-${key}`;
        const catKey = key === 'electricidad' ? key : key;
        html += `        <li class="header__mobile-menu__item">\n`;
        html += `            <button class="header__mobile-menu__accordion" data-category="${key}">\n`;
        html += `                <span class="header__mobile-menu__category-name">${cat.nombre}</span>\n`;
        html += `                <svg class="header__mobile-menu__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n`;
        html += `                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n`;
        html += `                </svg>\n`;
        html += `            </button>\n`;
        html += `            <div class="header__mobile-menu__submenu" id="${submenuId}">\n`;
        for (const grupo of cat.subcategorias) {
            html += `                <div class="header__mobile-menu__submenu-section">\n`;
            html += `                    <h4 class="header__mobile-menu__submenu-title">${grupo.nombre.toUpperCase()}</h4>\n`;
            html += `                    <ul class="header__mobile-menu__submenu-list">\n`;
            for (const item of grupo.items) {
                html += `                        <li><a href="catalogo.html?categoria=${catKey}&subcategoria=${item.slug}">${item.texto}</a></li>\n`;
            }
            html += `                    </ul>\n`;
            html += `                </div>\n`;
        }
        html += `            </div>\n`;
        html += `        </li>\n`;
    }
    html += `    </ul>\n`;
    html += `</nav>`;
    return html;
}

// PARCHE: Reubicar productos existentes a la categoría Hogar según su nombre
if (typeof window !== 'undefined' && window.productos) {
    window.productos.forEach(p => {
        const n = p.nombre.toLowerCase();
        let nuevaSub = null;

        // Organización
        if (n.includes('estante') || n.includes('estanteria') || n.includes('estantería')) nuevaSub = 'estanterias';
        else if (n.includes('gancho')) nuevaSub = 'ganchos';
        else if (n.includes('caja org') || n.includes('organizador')) nuevaSub = 'cajas_organizadoras';
        else if (n.includes('percha')) nuevaSub = 'perchas';
        // Limpieza
        else if (n.includes('escoba')) nuevaSub = 'escobas';
        else if (n.includes('trapeador') || n.includes('mopa') || n.includes('fregona')) nuevaSub = 'trapeadores';
        else if (n.includes('cubo') || n.includes('balde')) nuevaSub = 'cubos';
        else if (n.includes('aspiradora')) nuevaSub = 'aspiradoras';

        // Si coincide con alguna palabra clave, lo movemos a Hogar
        if (nuevaSub) {
            p.categoria_principal = 'hogar';
            p.subcategoria = nuevaSub;
        }
    });
}
