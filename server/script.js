const container = document.getElementById("products");

const socket = io("http://localhost:3000");

function sendMessage() {
  const text = input.value;
  socket.emit("sendMessage", text);
}

socket.on("newMessage", msg => {
  chat.innerHTML += <p>${msg}</p>;
});

async function checkout() {
  const res = await fetch("http://localhost:3000/create-order", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ cart })
  });

  const data = await res.json();
  window.location = data.url;
}

async function loadProducts() {
  const category = document.getElementById("categoryFilter").value;
  const price = document.getElementById("priceFilter").value;

  const res = await fetch(
    `http://localhost:3000/products?category=${category}&price=${price}`
  );

  const products = await res.json();

  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += 
      <div class="product">
        <img src="${p.image}" />
        <h4>${p.name}</h4>
        <p>${p.price}</p>
      </div>
    ;
  });
}

document.getElementById("categoryFilter").onchange = loadProducts;
document.getElementById("priceFilter").onchange = loadProducts;

checkout(), loadProducts();