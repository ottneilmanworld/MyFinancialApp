// Función serverless de Vercel. Se ejecuta en el SERVIDOR, nunca en el
// navegador del usuario — por eso aquí SÍ es seguro usar la llave secreta
// de Cotizave (está guardada como variable de entorno en Vercel, no en
// el código). El navegador solo recibe el resultado final ya calculado.

export default async function handler(req, res) {
  try {
    const cotizaveKey = process.env.COTIZAVE_API_KEY;

    // 1) Bolívares (VES): tasa P2P real de Cotizave (promedio de exchanges)
    let vesRate = null;
    if (cotizaveKey) {
      try {
        const cotizaveRes = await fetch('https://api.cotizave.com/v1/fx/rates', {
          headers: { 'X-API-Key': cotizaveKey },
        });
        const cotizaveData = await cotizaveRes.json();
        const p2p = (cotizaveData.rates || []).filter(r => r.type === 'p2p');
        if (p2p.length > 0) {
          vesRate = p2p.reduce((sum, r) => sum + r.mid, 0) / p2p.length;
        }
      } catch (err) {
        console.error('Error consultando Cotizave:', err.message);
      }
    }

    // 2) EUR, MXN, COP, ARS: API gratuita, sin llave, tasa oficial de mercado
    let freeRates = {};
    try {
      const freeRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const freeData = await freeRes.json();
      freeRates = freeData.rates || {};
    } catch (err) {
      console.error('Error consultando open.er-api.com:', err.message);
    }

    const result = {
      base: 'USD',
      updatedAt: new Date().toISOString(),
      rates: {
        USD: 1,
        EUR: freeRates.EUR ?? null,
        MXN: freeRates.MXN ?? null,
        COP: freeRates.COP ?? null,
        ARS: freeRates.ARS ?? null,
        VES: vesRate,
      },
    };

    // Guarda esta respuesta en caché 5 minutos, para no golpear las APIs
    // externas cada vez que alguien abra el conversor.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'No se pudo obtener el tipo de cambio', details: err.message });
  }
}