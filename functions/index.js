/**
 * Firebase Cloud Functions — Ferretería Pro
 * Integración con MercadoPago Checkout Pro
 *
 * Despliegue:
 *   firebase functions:config:set mp.access_token="TU_ACCESS_TOKEN"
 *   firebase deploy --only functions
 */

const functions = require('firebase-functions');
const mercadopago = require('mercadopago');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * crearPreferenciaMp
 * Callable Function: recibe datos del pedido y devuelve un preference_id + init_point de MercadoPago.
 * El Access Token nunca toca el cliente — queda seguro en las variables de entorno del servidor.
 */
exports.crearPreferenciaMp = functions.https.onCall(async (data, context) => {
    const accessToken = functions.config().mp && functions.config().mp.access_token;
    if (!accessToken) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Access Token de MercadoPago no configurado. Ejecutá: firebase functions:config:set mp.access_token="TOKEN"'
        );
    }

    mercadopago.configure({ access_token: accessToken });

    const { items, cliente, pedidoId, siteUrl } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'El carrito está vacío.');
    }

    const preference = {
        items: items.map(item => ({
            id: String(item.sku || item.id || 'producto'),
            title: String(item.nombre || 'Producto').substring(0, 256),
            quantity: Number(item.cantidad) || 1,
            unit_price: Number(item.precio) || 0,
            currency_id: 'UYU'
        })),
        payer: {
            name: cliente ? String(cliente.name || '') : '',
            phone: {
                area_code: '598',
                number: cliente ? String(cliente.phone || '') : ''
            }
        },
        back_urls: {
            success: `${siteUrl}?mp_status=approved&mp_ref=${pedidoId}`,
            failure: `${siteUrl}?mp_status=failure&mp_ref=${pedidoId}`,
            pending: `${siteUrl}?mp_status=pending&mp_ref=${pedidoId}`
        },
        auto_return: 'approved',
        external_reference: String(pedidoId || ''),
        statement_descriptor: 'MP FERRETERIA'
    };

    try {
        const response = await mercadopago.preferences.create(preference);
        return {
            preferenceId: response.body.id,
            initPoint: response.body.init_point,
            sandboxInitPoint: response.body.sandbox_init_point
        };
    } catch (err) {
        console.error('Error al crear preferencia MP:', err);
        throw new functions.https.HttpsError(
            'internal',
            'No se pudo crear la preferencia de pago: ' + (err.message || err)
        );
    }
});
