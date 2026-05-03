const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", socket => {
  socket.on("sendMessage", msg => {
    io.emit("newMessage", msg);
  });
});

http.listen(3000);

mongoose.connect("mongodb://127.0.0.1:27017/shop");

// 🔐 Секрет
const SECRET = "mysecretkey";
const Stripe = require("stripe");
const stripe = Stripe("sk_test_ТВОЙ_КЛЮЧ");
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:test@test.com",
  "PUBLIC_KEY",
  "PRIVATE_KEY"
);

let subscribers = [];

app.post("/subscribe", (req, res) => {
  subscribers.push(req.body);
  res.sendStatus(201);
});

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_ТВОЙ_SECRET"
    );
  } catch (err) {
    return res.sendStatus(400);
  }

  // 💥 УСПЕШНАЯ ОПЛАТА
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const order = new Order({
      items: JSON.parse(session.metadata.cart),
      total: session.amount_total / 100,
      status: "оплачен"
    });

    order.save();

    // 🔔 пуш
    sendPush("Новый оплаченный заказ 💰");
  }

  res.json({ received: true });
});

// отправка
function sendPush(message) {
  subscribers.forEach(sub => {
    webpush.sendNotification(sub, JSON.stringify({
      title: "Новый заказ!",
      body: message
    }));
  });
}

sendPush("У тебя новый заказ 💰");

// 👤 ADMIN (один)
const adminUser = {
  username: "admin",
  password: bcrypt.hashSync("123456", 8)
};

// 📦 Product модель
const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  image: String,
  category: String
});

// 📁 Загрузка файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// 🔐 LOGIN
app.post("/user-login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.sendStatus(401);

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.sendStatus(401);

  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token });
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  try {
    const data = jwt.verify(refreshToken, SECRET);
    const newToken = jwt.sign({ id: data.id }, SECRET, { expiresIn: "15m" });

    res.json({ token: newToken });
  } catch {
    res.sendStatus(403);
  }
});

app.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 8);

  const user = new User({
    email: req.body.email,
    password: hash
  });

  await user.save();
  res.send("OK");
});

app.get("/my-orders", async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json(orders);
});

// 🔐 Middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(403);

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

app.post("/create-checkout-session", async (req, res) => {
  const { cart } = req.body;

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

    // 👉 передаём корзину
    metadata: {
      cart: JSON.stringify(cart)
    },

    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel"
  });

  res.json({ url: session.url });
});

app.post("/create-order", async (req, res) => {
  const { cart } = req.body;

  const total = cart.reduce((sum, i) => sum + i.price, 0);

  const order = new Order({
    items: cart,
    total
  });

  await order.save();

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
    success_url: "http://localhost:5500/success.html",
    cancel_url: "http://localhost:5500/cancel.html"
  });

  res.json({ url: session.url });
});

app.get("/orders", auth, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.put("/order/:id", auth, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status
  });
  res.send("OK");
});

app.put("/order/:id", auth, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status
  });
  res.send("OK");
});

app.post("/add-review", async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.json(review);
});

app.get("/reviews/:productId", async (req, res) => {
  const reviews = await Review.find({
    productId: req.params.productId
  });
  res.json(reviews);
});

// ➕ Добавить товар
app.post("/add-product", auth, upload.single("image"), async (req, res) => {
  const { name, price } = req.body;

  const product = new Product({
    name,
    price,
    image: "http://localhost:3000/uploads/" + req.file.filename
  });

  await product.save();
  res.json(product);
});

// ❌ Удалить товар
app.delete("/delete-product/:id", auth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.send("Удалено");
});

// 📦 Получить товары
app.get("/products", async (req, res) => {
  const { category, price } = req.query;

  let filter = {};

  if (category) filter.category = category;
  if (price === "low") filter.price = { $lte: 5000 };
  if (price === "high") filter.price = { $gte: 5000 };

  const products = await Product.find(filter);
  res.json(products);
});

const User = mongoose.model("User", {
  email: String,
  password: String
});

// 📦 Заказы
const Order = mongoose.model("Order", {
  items: Array,
  total: Number,
  status: { type: String, default: "новый" },
  createdAt: { type: Date, default: Date.now }
});

// ⭐ Отзывы
const Review = mongoose.model("Review", {
  productId: String,
  text: String,
  rating: Number
});

app.listen(3000, () => console.log("🚀 Server started"));