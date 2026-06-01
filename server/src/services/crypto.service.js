const Order = require("../repositories/order.repository");

const SUPPORTED_CURRENCIES = ["bitcoin", "ethereum", "usdt"];

function getWallets(env) {
  return {
    bitcoin: env.CRYPTO_WALLET_BTC,
    ethereum: env.CRYPTO_WALLET_ETH,
    usdt: env.CRYPTO_WALLET_USDT
  };
}

function getRates(env) {
  return {
    bitcoin: env.CRYPTO_RATE_BTC,
    ethereum: env.CRYPTO_RATE_ETH,
    usdt: env.CRYPTO_RATE_USDT
  };
}

function calcCartTotal(cart) {
  return cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
}

function calcCryptoAmount(totalRub, currency, rates) {
  const rate = rates[currency];
  if (!rate || rate <= 0) {
    throw new Error("Invalid exchange rate");
  }
  const decimals = currency === "usdt" ? 2 : 8;
  return Number((totalRub / rate).toFixed(decimals));
}

function currencyLabel(currency) {
  const labels = {
    bitcoin: "BTC",
    ethereum: "ETH",
    usdt: "USDT"
  };
  return labels[currency] || currency.toUpperCase();
}

async function createCryptoCheckout({ cart, currency, userId, env }) {
  if (!Array.isArray(cart) || cart.length === 0) {
    const error = new Error("Cart is empty");
    error.status = 400;
    throw error;
  }

  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    const error = new Error("Unsupported cryptocurrency");
    error.status = 400;
    throw error;
  }

  const wallets = getWallets(env);
  const walletAddress = wallets[currency];
  if (!walletAddress) {
    const error = new Error(`Wallet for ${currency} is not configured`);
    error.status = 503;
    throw error;
  }

  const rates = getRates(env);
  const amountRub = calcCartTotal(cart);
  const cryptoAmount = calcCryptoAmount(amountRub, currency, rates);
  const symbol = currencyLabel(currency);

  const order = Order.insert({
    items: cart,
    total: amountRub,
    userId: userId ? String(userId) : undefined,
    status: "pending_crypto",
    paymentMethod: "crypto",
    cryptoCurrency: currency,
    cryptoAmount,
    walletAddress
  });

  return {
    orderId: order._id,
    currency,
    symbol,
    walletAddress,
    amountRub,
    cryptoAmount,
    itemCount: cart.length,
    instructions:
      `Отправьте ${cryptoAmount} ${symbol} на адрес ${walletAddress}. ` +
      `Сумма заказа: ${amountRub} ₽. После подтверждения сети статус заказа обновится.`
  };
}

module.exports = {
  SUPPORTED_CURRENCIES,
  createCryptoCheckout,
  getWallets
};
