(function(){
  const PRODUCTS = [
    { id: 'p1', name: 'Product A', price: 1000 },
    { id: 'p2', name: 'Product B', price: 2500 },
    { id: 's1', name: 'Service X', price: 5000 }
  ];

  function qs(selector){return document.querySelector(selector)}
  const welcome = qs('#welcome-screen');
  const main = qs('#main-screen');
  const chat = qs('#chat-screen');
  const nameInput = qs('#name-input');
  const enterBtn = qs('#enter-btn');
  const greeting = qs('#greeting');
  const productsEl = qs('#products');
  const chatBox = qs('#chat-box');
  const chatMsg = qs('#chat-msg');
  const sendBtn = qs('#send-msg');
  const closeChat = qs('#close-chat');

  // Polling state and shown message ids (declare early to avoid reference errors)
  let polling = false;
  const shownMessageIds = new Set();

  function showMain(name){
    greeting.textContent = `Hello, ${name}! Choose a product:`;
    // play overlay out animation if present
    const overlay = document.getElementById('welcome-overlay');
    if(overlay){
      overlay.classList.remove('overlay-in');
      overlay.classList.add('overlay-out');
      // wait for animation to finish then remove overlay and show main
      overlay.addEventListener('animationend', ()=>{
        overlay.parentNode.removeChild(overlay);
        main.classList.remove('hidden');
        main.classList.add('main-enter');
        renderProducts();
      }, { once: true });
    } else {
      welcome.classList.add('hidden');
      main.classList.remove('hidden');
      renderProducts();
    }
  }

  function renderProducts(){
    productsEl.innerHTML = '';
    PRODUCTS.forEach(p=>{
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `<h4>${p.name}</h4><p>Цена: ${p.price} AMD</p><button data-id="${p.id}">Выбрать</button>`;
      productsEl.appendChild(div);
    });
    productsEl.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        openChatForProduct(btn.dataset.id);
      });
    });
  }

  function openChatForProduct(productId){
    const p = PRODUCTS.find(x=>x.id===productId);
    chatBox.innerHTML = `<p>Request for: <strong>${p.name}</strong> — please contact the seller.</p>`;
    main.classList.add('hidden');
    chat.classList.remove('hidden');
    // send initial message to server to forward to Telegram
    const buyer = localStorage.getItem('buyerName')||'Guest';
    const message = `${buyer} selected ${p.name} (id:${p.id}). Awaiting contact.`;
    const headers = {'Content-Type':'application/json'};
    if(window.SHOP_CONFIG && window.SHOP_CONFIG.SHOP_SECRET){
      headers['Authorization'] = `Bearer ${window.SHOP_CONFIG.SHOP_SECRET}`;
    }
    fetch('/notify',{method:'POST',headers,body:JSON.stringify({message})}).catch(()=>{});
    // start polling for incoming replies
    startPollingMessages();
  }

  enterBtn.addEventListener('click', ()=>{
    const name = nameInput.value && nameInput.value.trim();
    if(!name) return alert('Please enter your name');
    localStorage.setItem('buyerName', name);
    showMain(name);
  });

  sendBtn.addEventListener('click', ()=>{
    const text = chatMsg.value && chatMsg.value.trim();
    if(!text) return;
    const buyer = localStorage.getItem('buyerName')||'Гость';
    const message = `${buyer}: ${text}`;
    // append locally
    const p = document.createElement('p'); p.textContent = message; chatBox.appendChild(p);
    chatMsg.value='';
    const headers2 = {'Content-Type':'application/json'};
    if(window.SHOP_CONFIG && window.SHOP_CONFIG.SHOP_SECRET){
      headers2['Authorization'] = `Bearer ${window.SHOP_CONFIG.SHOP_SECRET}`;
    }
    fetch('/notify',{method:'POST',headers:headers2,body:JSON.stringify({message})}).catch(()=>{});
    startPollingMessages();
  });

  closeChat.addEventListener('click', ()=>{
    chat.classList.add('hidden');
    main.classList.remove('hidden');
    stopPollingMessages();
  });

  // on load, do not prefill the name input (always ask for name)
  const existing = localStorage.getItem('buyerName');
  // intentionally do not set nameInput.value here so user must re-enter or confirm

  // Seed shownMessageIds from any existing DOM messages (if page reloaded)
  Array.from(chatBox.querySelectorAll('p')).forEach((p)=>{
    const id = p.getAttribute('data-msg-id');
    if(id) shownMessageIds.add(Number(id));
  });

  // Poll server for incoming telegram messages and append them
  async function startPollingMessages(){
    if(polling) return;
    polling = true;
    try{
      while(polling){
        const res = await fetch('/messages');
        if(!res.ok) break;
        const data = await res.json();
        if(data && data.messages && data.messages.length){
          // append only messages we haven't shown yet
          const newlyShown = [];
          data.messages.forEach(m=>{
            if(!m.id) return; // skip if no id
            if(shownMessageIds.has(m.id)) return;
            shownMessageIds.add(m.id);
            newlyShown.push(m.id);
            const p = document.createElement('p');
            p.className='incoming';
            p.setAttribute('data-msg-id', m.id);
            p.textContent = `${m.from}: ${m.text}`;
            chatBox.appendChild(p);
          });
          // ack newly shown messages on server so they are removed
          if(newlyShown.length){
            const headersAck = {'Content-Type':'application/json'};
            if(window.SHOP_CONFIG && window.SHOP_CONFIG.SHOP_SECRET){
              headersAck['Authorization'] = `Bearer ${window.SHOP_CONFIG.SHOP_SECRET}`;
            }
            fetch('/messages/ack',{method:'POST',headers:headersAck,body:JSON.stringify({ids:newlyShown})}).catch(()=>{});
          }
        }
        await new Promise(r=>setTimeout(r,2000));
      }
    }catch(e){ console.error(e); }
  }

  function stopPollingMessages(){
    polling = false;
  }
})();
