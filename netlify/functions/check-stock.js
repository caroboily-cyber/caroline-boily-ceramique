const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Payment Link IDs pour vérifier le stock restant
const PAYMENT_LINKS = {
  'Blizzard · Tasse 12 oz':          'plink_1T7OX5Py5tPWAdRZNELezt1y',
  'Forestière · Tasse 10 oz':        'plink_1T7OIbPy5tPWAdRZgpGdFkgo',
  'Grande tasse 16 oz':              'plink_1T7OT2Py5tPWAdRZTpw0PMsL',
  'Blizzard · Assiette creuse':      'plink_1T7OXzPy5tPWAdRZWIrCVETO',
  'Forestière · Assiette':           'plink_1T7OWcPy5tPWAdRZgeNnJnvH',
  'Blizzard · Bol':                  'plink_1T7OYfPy5tPWAdRZys58krtM',
  'Montagnarde · Bol':               'plink_1T7OZ6Py5tPWAdRZJnCQmK6g',
  'Montagnarde · Poubelle de table': 'plink_1T7OViPy5tPWAdRZVGC4fAMT',
};

exports.handler = async () => {
  try {
    const stock = {};

    await Promise.all(
      Object.entries(PAYMENT_LINKS).map(async ([name, linkId]) => {
        const link = await stripe.paymentLinks.retrieve(linkId);
        const limit = link.restrictions?.completed_sessions?.limit ?? null;
        const count = link.restrictions?.completed_sessions?.count ?? 0;

        if (!link.active) {
          stock[name] = 0;
        } else if (limit !== null) {
          stock[name] = limit - count;
        } else {
          stock[name] = null; // pas de limite définie
        }
      })
    );

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'no-store' },
      body: JSON.stringify(stock),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
