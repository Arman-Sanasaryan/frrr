import categoryConfig from "../data/categoryConfig";

const demoProducts = Array.from({ length: 120 }, (_, i) => {
  const c = categoryConfig[i % categoryConfig.length];

  const sub = c.sub[i % c.sub.length];

  return {
    _id: i,
    name: `${sub} ${i + 1}`,
    price: 5000 + i * 200,
    category: c.id,
    subcategory: sub,
    image: `https://picsum.photos/seed/${c.id}-${sub}-${i}/400/400`,
  };
});

export default demoProducts;