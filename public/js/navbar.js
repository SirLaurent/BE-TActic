// 🪖 BE TActic - Barra di Navigazione Dinamica

document.addEventListener("DOMContentLoaded", () => {
  // Cerca il contenitore dove inserire la navbar
  const navContainer = document.getElementById("app-navbar");
  if (!navContainer) return; // Se la pagina non ha il div, non fa nulla

  // Recupera utente loggato (se presente)
  const currentUser = localStorage.getItem("beTactic_user") || "Ospite";

  // Determina quale link evidenziare in base all'URL
  const currentPath = window.location.pathname;

  // Genera HTML della navbar
  navContainer.innerHTML = `
    <nav class="main-navbar">
      <div class="nav-brand">
        <a href="/dashboard">🪖 BE TActic</a>
      </div>
      <ul class="nav-links">
        <li><a href="/feed" class="${currentPath === "/feed" ? "active" : ""}">📡 Feed</a></li>
        <li><a href="/teams" class="${currentPath === "/teams" ? "active" : ""}">🏴 Squadre</a></li>
        <li><a href="/profile" class="${currentPath.startsWith("/profile") ? "active" : ""}">👤 Profilo</a></li>
        <li><a href="/events" class="${currentPath === "/events" ? "active" : ""}">📅 Eventi</a></li>
        <li><a href="/chat" class="${currentPath === "/chat" ? "active" : ""}">💬 Chat</a></li>
        </ul>
      <div class="nav-user">
        <span class="user-badge">👤 ${currentUser}</span>
        <button class="btn-logout" onclick="handleLogout()">🚪 Esci</button>
      </div>
    </nav>
  `;

  // Funzione logout globale
  window.handleLogout = () => {
    localStorage.removeItem("beTactic_user");
    window.location.href = "/login";
  };
});
