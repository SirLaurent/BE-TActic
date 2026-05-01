// 🪖 BE TActic - Direct Messages (Real-time + Ricerca)
document.addEventListener("DOMContentLoaded", () => {
  const CURRENT_USER = localStorage.getItem("beTactic_user") || "Ospite";
  const socket = io();

  let activeConvoId = null;
  let allUsers = []; // Lista utenti per la ricerca

  const convoList = document.getElementById("convoList");
  const messagesContainer = document.getElementById("messagesContainer");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const chatWithUser = document.getElementById("chatWithUser");
  const emptyChat = document.getElementById("emptyChat");
  const activeChat = document.getElementById("activeChat");
  const searchInput = document.getElementById("searchUser");
  const searchResults = document.getElementById("searchResults");
  const startChatBtn = document.getElementById("startChatBtn");

  // Carica lista utenti (per ricerca) - simulato
  async function loadUsers() {
    // In produzione: fetch('/api/users')
    allUsers = [
      "TacticalWolf",
      "ShadowRecon",
      "AlphaOne",
      "BravoSix",
      "GhostReaper",
    ];
  }

  // Carica conversazioni esistenti
  async function loadConversations() {
    const res = await fetch(`/api/direct/conversations/${CURRENT_USER}`);
    const convos = await res.json();

    convoList.innerHTML = "";
    if (convos.length === 0) {
      convoList.innerHTML =
        '<p class="loading-msg">💬 Nessuna conversazione. Cerca un operatore per iniziare.</p>';
      return;
    }

    convos.forEach((c) => {
      const el = document.createElement("div");
      el.className = "convo-item";
      el.dataset.id = c.id;
      el.innerHTML = `
        <div class="convo-avatar">👤</div>
        <div class="convo-info">
          <div class="convo-name">${escapeHtml(c.otherUser)}</div>
          <div class="convo-preview">${escapeHtml(c.lastMessage)}</div>
        </div>
      `;
      el.addEventListener("click", () => openConversation(c.id, c.otherUser));
      convoList.appendChild(el);
    });
  }

  // Cerca utenti (filtro locale)
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = "";

    if (query.length < 2) {
      searchResults.classList.add("hidden");
      return;
    }

    const matches = allUsers.filter(
      (u) => u.toLowerCase().includes(query) && u !== CURRENT_USER,
    );

    if (matches.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result-item">Nessun operatore trovato</div>';
    } else {
      matches.forEach((user) => {
        const el = document.createElement("div");
        el.className = "search-result-item";
        el.innerHTML = `<span>👤</span> ${escapeHtml(user)}`;
        el.addEventListener("click", () => startNewConversation(user));
        searchResults.appendChild(el);
      });
    }
    searchResults.classList.remove("hidden");
  });

  // Nascondi risultati se clicchi fuori
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".search-box") &&
      !e.target.closest(".search-results")
    ) {
      searchResults.classList.add("hidden");
    }
  });

  // Avvia nuova conversazione
  async function startNewConversation(otherUser) {
    const convoId = [CURRENT_USER, otherUser].sort().join("_");

    // Salva messaggio iniziale per creare la conversazione
    await fetch("/api/direct/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CURRENT_USER,
        to: otherUser,
        text: "👋 Ciao! Pronto a coordinarci?",
        time: new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }),
    });

    searchInput.value = "";
    searchResults.classList.add("hidden");
    loadConversations();
    openConversation(convoId, otherUser);
  }

  startChatBtn.addEventListener("click", () => {
    if (searchInput.value.trim().length >= 2) {
      const user = allUsers.find(
        (u) => u.toLowerCase() === searchInput.value.toLowerCase().trim(),
      );
      if (user) startNewConversation(user);
    }
  });

  // Apri conversazione esistente
  async function openConversation(convoId, otherUser) {
    activeConvoId = convoId;
    chatWithUser.textContent = `👤 ${otherUser}`;
    emptyChat.classList.add("hidden");
    activeChat.classList.remove("hidden");

    document
      .querySelectorAll(".convo-item")
      .forEach((el) => el.classList.remove("active"));
    document
      .querySelector(`.convo-item[data-id="${convoId}"]`)
      ?.classList.add("active");

    socket.emit("join_private", convoId);

    const res = await fetch(`/api/direct/${convoId}/messages`);
    const messages = await res.json();
    messagesContainer.innerHTML = "";
    messages.forEach(renderMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderMessage(msg) {
    const el = document.createElement("div");
    el.className = `msg-bubble ${msg.from === CURRENT_USER ? "sent" : "received"}`;
    el.innerHTML = `<div>${escapeHtml(msg.text)}</div><div class="msg-time">${escapeHtml(msg.time)}</div>`;
    messagesContainer.appendChild(el);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Ricevi messaggio privato in tempo reale
  socket.on("private_message", (msg) => {
    if (activeConvoId === msg.convoId) {
      renderMessage(msg);
    } else {
      loadConversations(); // Aggiorna anteprima
    }
  });

  // Invia messaggio
  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !activeConvoId) return;

    const now = new Date().toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const msgData = {
      convoId: activeConvoId,
      from: CURRENT_USER,
      text,
      time: now,
    };

    socket.emit("send_private", msgData);
    messageInput.value = "";
  });

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Init
  loadUsers();
  loadConversations();
});
