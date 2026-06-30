(function(){
  const PRODUCTS = [
    { id: 'p1', name: 'Product A', price: 1000 },
    { id: 'p2', name: 'Product B', price: 2500 },
    { id: 's1', name: 'Service X', price: 5000 }
  ];

  function qs(selector){ return document.querySelector(selector); }
  const welcome   = qs('#welcome-screen');
  const main      = qs('#main-screen');
  const chat      = qs('#chat-screen');
  const nameInput = qs('#name-input');
  const enterBtn  = qs('#enter-btn');
  const greeting  = qs('#greeting');
  const productsEl = qs('#products');
  const chatBox   = qs('#chat-box');
  const chatMsg   = qs('#chat-msg');
  const sendBtn   = qs('#send-msg');
  const closeChat = qs('#close-chat');

  // --- session id: persistent per browser ---
  function getSessionId() {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
      localStorage.setItem('sessionId', sid);
    }
    return sid;
  }
  const SESSION_ID = getSessionId();
  const API_BASE = 'https://arrrman.pythonanywhere.com';

  let polling = false;
  const shownMessageIds = new Set();

  function getSecret() {
    return window.SHOP_CONFIG && window.SHOP_CONFIG.SHOP_SECRET
      ? window.SHOP_CONFIG.SHOP_SECRET
      : null;
  }

  function authHeaders() {
    const h = { 'Content-Type': 'application/json' };
    const s = getSecret();
    if (s) h['Authorization'] = `Bearer ${s}`;
    return h;
  }

  function showMain(name) {
    greeting.textContent = `Hello, ${name}! Choose a product:`;
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
      overlay.classList.remove('overlay-in');
      overlay.classList.add('overlay-out');
      overlay.addEventListener('animationend', () => {
        overlay.parentNode.removeChild(overlay);
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.style.display = '';
        document.querySelector('.main').style.display = '';
        // const chatScreen = document.getElementById('chat-screen');
        // if (chatScreen) chatScreen.style.display = '';
        main.style.display = '';
        main.classList.remove('hidden');
        main.classList.add('main-enter');
        renderProducts();
      }, { once: true });
    } else {
      welcome.classList.add('hidden');
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.style.display = '';
      document.querySelector('.main').style.display = '';
      // const chatScreen = document.getElementById('chat-screen');
      // if (chatScreen) chatScreen.style.display = '';
      main.style.display = '';
      main.classList.remove('hidden');
      renderProducts();
    }
  }

  function renderProducts() {
    productsEl.innerHTML = '';
    PRODUCTS.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `<h4>${p.name}</h4><p>Цена: ${p.price} AMD</p><button data-id="${p.id}">Выбрать</button>`;
      productsEl.appendChild(div);
    });
    productsEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => openChatForProduct(btn.dataset.id));
    });
  }

  function openChatForProduct(productId) {
    const p = PRODUCTS.find(x => x.id === productId);
    chatBox.innerHTML = `<p>Request for: <strong>${p.name}</strong> — please contact the seller.</p>`;
    main.classList.add('hidden');
    chat.classList.remove('hidden');

    const buyer = localStorage.getItem('buyerName') || 'Guest';
    const message = `${buyer} selected ${p.name} (id:${p.id}). Awaiting contact.`;

    fetch(API_BASE + '/notify', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message, session_id: SESSION_ID })
    }).catch(() => {});

    startPollingMessages();
  }

  enterBtn.addEventListener('click', () => {
    const name = nameInput.value && nameInput.value.trim();
    if (!name) return alert('Please enter your name');
    localStorage.setItem('buyerName', name);
    showMain(name);
  });

  sendBtn.addEventListener('click', () => {
    const text = chatMsg.value && chatMsg.value.trim();
    if (!text) return;
    const buyer = localStorage.getItem('buyerName') || 'Гость';
    const message = `${buyer}: ${text}`;

    const p = document.createElement('p');
    p.textContent = message;
    chatBox.appendChild(p);
    chatMsg.value = '';

    fetch(API_BASE + '/notify', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message, session_id: SESSION_ID })
    }).catch(() => {});

    startPollingMessages();
  });

  closeChat.addEventListener('click', () => {
    chat.classList.add('hidden');
    main.classList.remove('hidden');
    stopPollingMessages();
  });

  // Seed shownMessageIds from existing DOM
  Array.from(chatBox.querySelectorAll('p')).forEach(p => {
    const id = p.getAttribute('data-msg-id');
    if (id) shownMessageIds.add(Number(id));
  });

  async function startPollingMessages() {
    if (polling) return;
    polling = true;
    try {
      while (polling) {
        const res = await fetch(API_BASE + `/messages?session_id=${SESSION_ID}`);
        if (!res.ok) break;
        const data = await res.json();
        if (data && data.messages && data.messages.length) {
          const newlyShown = [];
          data.messages.forEach(m => {
            if (!m.id) return;
            if (shownMessageIds.has(m.id)) return;
            shownMessageIds.add(m.id);
            newlyShown.push(m.id);
            const p = document.createElement('p');
            p.className = 'incoming';
            p.setAttribute('data-msg-id', m.id);
            p.textContent = `${m.from}: ${m.text}`;
            chatBox.appendChild(p);
          });
          if (newlyShown.length) {
            fetch(API_BASE + '/messages/ack', {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({ ids: newlyShown, session_id: SESSION_ID })
            }).catch(() => {});
          }
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch(e) {
      console.error(e);
    }
  }

  function stopPollingMessages() {
    polling = false;
  }
})();