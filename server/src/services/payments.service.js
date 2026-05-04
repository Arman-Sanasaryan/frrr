async function createCheckoutSession({ stripe, cart, successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: cart.map(item => ({
      price_data: {
        currency: "amd",
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: 1
    })),
    mode: "payment",
    metadata: {
      cart: JSON.stringify(cart)
    },
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  return session;
}

function constructWebhookEvent({ stripe, rawBody, signature, webhookSecret }) {
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

module.exports = {
  createCheckoutSession,
  constructWebhookEvent
};
