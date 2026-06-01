function withMongoId(row) {
  if (!row) {
    return null;
  }
  return {
    ...row,
    _id: String(row.id)
  };
}

function parseOrderRow(row) {
  if (!row) {
    return null;
  }
  return {
    _id: String(row.id),
    items: JSON.parse(row.items),
    total: row.total,
    userId: row.user_id,
    status: row.status,
    paymentMethod: row.payment_method,
    cryptoCurrency: row.crypto_currency,
    cryptoAmount: row.crypto_amount,
    walletAddress: row.wallet_address,
    createdAt: row.created_at
  };
}

function parseProductRow(row) {
  if (!row) {
    return null;
  }
  return {
    _id: String(row.id),
    name: row.name,
    price: row.price,
    image: row.image,
    category: row.category,
    subcategory: row.subcategory
  };
}

function parseUserRow(row) {
  if (!row) {
    return null;
  }
  return {
    _id: String(row.id),
    email: row.email,
    password: row.password,
    name: row.name || "",
    googleId: row.google_id || "",
    avatarUrl: row.avatar_url || ""
  };
}

function parseReviewRow(row) {
  if (!row) {
    return null;
  }
  return {
    _id: String(row.id),
    productId: row.product_id,
    text: row.text,
    rating: row.rating
  };
}

module.exports = {
  withMongoId,
  parseOrderRow,
  parseProductRow,
  parseUserRow,
  parseReviewRow
};
