const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  'Blizzard · Tasse 12 oz':          'price_1T7OIQPy5tPWAdRZTGPAJkOQ',
  'Forestière · Tasse 10 oz':        'price_1T7OIWPy5tPWAdRZmxGONqk5',
  'Grande tasse 16 oz':              'price_1T7OIZPy5tPWAdRZJ0FuD7da',
  'Blizzard · Assiette creuse':      'price_1T7OIRPy5tPWAdRZNTDZ3JBx',
  'Forestière · Assiette':           'price_1T7OIYPy5tPWAdRZX2o6gYYL',
  'Blizzard · Bol':                  'price_1T7OIRPy5tPWAdRZhdFcqAWf',
  'Montagnarde · Bol':               'price_1T7OIVPy5tPWAdRZaXGLvfcw',
  'Montagnarde · Poubelle de table': 'price_1T7OIQPy5tPWAdRZfcn2sCko',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items, successUrl, cancelUrl } = JSON.parse(event.body);

    const lineItems = items.map(item => ({
      price: PRICE_IDS[item.name],
      quantity: item.quantity,
    }));

    // Livraison fixe 15$
    lineItems.push({
      price_data: {
        currency: 'cad',
        product_data: { name: 'Livraison — Québec et Canada' },
        unit_amount: 1500,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
