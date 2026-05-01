// 🪖 BE TACTIC - Dashboard Logic (Battlelog Style)
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("beTactic_user") || "Ospite";

  // Popola dati utente
  document.getElementById("subNickname").textContent = user.toUpperCase();
  document.getElementById("statsName").textContent = user.toUpperCase();
  document.getElementById("statusUpdate").placeholder =
    `Update your status text as ${user}...`;

  // Simula caricamento dati (in futuro fetch reali)
  setTimeout(() => {
    document.getElementById("serverFeed").innerHTML = `
      <div style="padding:0.3rem 0;border-bottom:1px solid #222">🟢 SERVER ALPHA - 12/20 Giocatori - [Milano]</div>
      <div style="padding:0.3rem 0;border-bottom:1px solid #222">🟢 SERVER BRAVO - 8/20 Giocatori - [Roma]</div>
      <div style="padding:0.3rem 0">🟡 SERVER DELTA - 18/20 Giocatori - [Napoli]</div>
    `;
    document.getElementById("teamFeed").innerHTML = `
      <div style="padding:0.3rem 0;border-bottom:1px solid #222">🏴 SHADOW WOLVES - 15 Membri</div>
      <div style="padding:0.3rem 0">🏴 GHOST RECON - 9 Membri</div>
    `;
  }, 800);

  // Gestione tab status
  const statusInput = document.getElementById("statusUpdate");
  statusInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && statusInput.value.trim()) {
      const feed = document.getElementById("feedContainer");
      const now = new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });
      feed.innerHTML =
        `<div style="padding:0.5rem;border-bottom:1px solid #222;font-size:0.9rem"><span style="color:var(--accent-gold)">${user}</span> <span style="color:#666">${now}</span><br>${statusInput.value}</div>` +
        feed.innerHTML;
      statusInput.value = "";
    }
  });
});
