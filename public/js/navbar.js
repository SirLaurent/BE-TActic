// 🪖 BE TACTIC - Barra di Navigazione Battlelog Style
document.addEventListener("DOMContentLoaded", () => {
  const navContainer = document.getElementById("app-navbar");
  if (!navContainer) return;

  const currentUser = localStorage.getItem("beTactic_user") || "Ospite";
  const currentPath = window.location.pathname;

  navContainer.innerHTML = `
    <nav class="main-navbar">
      <div class="nav-brand">
        <a href="/dashboard" class="glitch-logo">BE TACTIC</a>
      </div>
      <ul class="nav-links">
        <li><a href="/feed" class="${currentPath === "/feed" ? "active" : ""}">FEED</a></li>
        <li><a href="/teams" class="${currentPath === "/teams" ? "active" : ""}">SQUADRE</a></li>
        <li><a href="/events" class="${currentPath === "/events" ? "active" : ""}">EVENTI</a></li>
        <li><a href="/chat" class="${currentPath === "/chat" ? "active" : ""}">CHAT</a></li>
        <li><a href="/direct" class="${currentPath === "/direct" ? "active" : ""}">DIRECT</a></li>
        <li><a href="/profile" class="${currentPath.startsWith("/profile") ? "active" : ""}">PROFILO</a></li>
      </ul>
      <div class="nav-user">
        <span class="user-badge">${currentUser.toUpperCase()}</span>
        <button class="btn-logout" onclick="handleLogout()">ESCI</button>
      </div>
    </nav>
  `;

  window.handleLogout = () => {
    localStorage.removeItem("beTactic_user");
    window.location.href = "/login";
  };
});
