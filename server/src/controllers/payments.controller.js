const {
  createCheckoutSession,
  constructWebhookEvent
} = require("../services/payments.service");
const { createPaidOrderFromSession } = require("../services/orders.service");
const { addSubscriber, sendPush } = require("../services/push.service");

function subscribeController(req, res) {
  addSubscriber(req.body);
  res.sendStatus(201);
}

async function createCheckoutSessionController(req, res) {
  const { cart } = req.body;
  const session = await createCheckoutSession({
    stripe: req.stripe,
    cart,
    successUrl: `${req.publicBaseUrl}/success`,
    cancelUrl: `${req.publicBaseUrl}/cancel`
  });

  res.json({ url: session.url });
}

function webhookController(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = constructWebhookEvent({
      stripe: req.stripe,
      rawBody: req.body,
      signature,
      webhookSecret: req.stripeWebhookSecret
    });
  } catch {
    return res.sendStatus(400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    createPaidOrderFromSession({ session });
    sendPush("Новый оплаченный заказ 💰");
  }

  return res.json({ received: true });
}

module.exports = {
  subscribeController,
  createCheckoutSessionController,
  webhookController
};
