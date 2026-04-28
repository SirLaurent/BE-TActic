// 🪖 BE TActic - Chat in Tempo Reale (Versione Completa)

document.addEventListener("DOMContentLoaded", () => {
  const CURRENT_USER = localStorage.getItem("beTactic_user") || "Ospite";

  // Verifica che socket.io sia caricato
  if (typeof io === "undefined") {
    console.error("❌ Socket.io non caricato! Controlla chat.html");
    return;
  }

  const socket = io();
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const typingIndicator = document.getElementById("typingIndicator");
  const onlineCount = document.getElementById("onlineCount");

  console.log("🔌 Chat inizializzata per:", CURRENT_USER);

  // ✅ Connessione stabilita
  socket.on("connect", () => {
    console.log("✅ Connesso a Socket.IO");
    if (chatMessages) {
      chatMessages.innerHTML = `<p class="system-msg">✅ Connesso come <strong>${escapeHtml(CURRENT_USER)}</strong>. Trasmetti.</p>`;
    }
    socket.emit("join_chat", CURRENT_USER);
  });

  // ❌ Errore connessione
  socket.on("connect_error", (err) => {
    console.error("❌ Socket.IO error:", err.message);
    if (chatMessages) {
      chatMessages.innerHTML = `<p class="system-msg" style="color:#c44">❌ Connessione fallita</p>`;
    }
  });

  // 🔢 Utenti online
  socket.on("online_count", (count) => {
    if (onlineCount) onlineCount.textContent = `🟢 ${count} online`;
  });

  // 📩 Ricevi messaggio
  socket.on("chat_message", (data) => {
    if (!chatMessages) return;
    const msgEl = document.createElement("div");
    msgEl.className = `msg ${data.user === CURRENT_USER ? "self" : "user"}`;
    msgEl.innerHTML = `
      <div class="msg-header">
        <span class="msg-author">${escapeHtml(data.user)}</span>
        <span class="msg-time">${escapeHtml(data.time)}</span>
      </div>
      <div class="msg-body">${escapeHtml(data.text)}</div>
    `;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // 📢 Messaggi sistema
  socket.on("system_message", (text) => {
    if (!chatMessages) return;
    const el = document.createElement("p");
    el.className = "system-msg";
    el.textContent = `📡 ${text}`;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // ⌨️ "Sta scrivendo..."
  chatInput?.addEventListener("input", () => {
    if (chatInput.value.trim().length > 0) {
      socket.emit("typing", CURRENT_USER);
    } else {
      socket.emit("stop_typing", CURRENT_USER);
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("stop_typing", CURRENT_USER);
    }, 1000);
  });

  socket.on("user_typing", (user) => {
    if (typingIndicator)
      typingIndicator.textContent = `${escapeHtml(user)} sta scrivendo...`;
  });
  socket.on("user_stopped_typing", () => {
    if (typingIndicator) typingIndicator.textContent = "";
  });

  // 📤 Invio messaggio
  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
    socket.emit("chat_message", { user: CURRENT_USER, text, time: now });

    chatInput.value = "";
    socket.emit("stop_typing", CURRENT_USER);
  });

  // 🔒 Escape HTML
  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
