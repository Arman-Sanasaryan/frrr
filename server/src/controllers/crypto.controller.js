const { createCryptoCheckout } = require("../services/crypto.service");

async function createCryptoCheckoutController(req, res) {
  try {
    const result = await createCryptoCheckout({
      cart: req.body.cart,
      currency: req.body.currency,
      userId: req.user?.id,
      env: req.cryptoEnv
    });
    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.message || "Crypto checkout failed"
    });
  }
}

module.exports = { createCryptoCheckoutController };
