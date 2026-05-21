/**
 * Vercel Serverless Function — Ferretería Pro
 * Crea una preferencia de pago en MercadoPago de forma segura (server-side).
 *
 * El Access Token vive en las variables de entorno de Vercel, nunca en el navegador.
 *
 * Setup en Vercel Dashboard:
 *   Settings → Environment Variables → MP_ACCESS_TOKEN = "tu_access_token"
 */

module.exports = async (req, res) => {
    // CORS — permite llamadas desde cualquier origen (necesario si el sitio se sirve de otro dominio)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
        return res.status(500).json({
            error: 'MP_ACCESS_TOKEN no configurado. Agregalo en Settings → Environment Variables de tu proyecto Vercel.'
        });
    }

    try {
        const { items, cliente, pedidoId, siteUrl } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío.' });
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

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(preference)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error de MercadoPago:', data);
            return res.status(500).json({ error: data.message || 'Error al crear preferencia en MercadoPago' });
        }

        return res.status(200).json({
            preferenceId: data.id,
            initPoint: data.init_point,
            sandboxInitPoint: data.sandbox_init_point
        });

    } catch (err) {
        console.error('Error en crear-preferencia:', err);
        return res.status(500).json({ error: err.message || 'Error interno del servidor' });
    }
};
