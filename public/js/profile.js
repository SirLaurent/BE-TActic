// 🪖 BE TActic - Gestione profilo (VERSIONE CORRETTA ✅)

document.addEventListener("DOMContentLoaded", async () => {
  // 🔍 Priorità: 1) Parametro URL, 2) Utente loggato da localStorage
  const params = new URLSearchParams(window.location.search);
  const nickname = params.get("user") || localStorage.getItem("beTactic_user");

  if (!nickname) {
    alert("❌ Devi effettuare il login per vedere un profilo");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch(`/api/users/${nickname}`);
    if (!response.ok) throw new Error("Utente non trovato");

    const user = await response.json();

    // Popola la pagina
    document.getElementById("profileNickname").textContent = user.nickname;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileTeam").textContent =
      `Squadra: ${user.team}`;
    document.getElementById("statMatches").textContent = user.stats.matches;
    document.getElementById("statWins").textContent = user.stats.wins;
    document.getElementById("statAccuracy").textContent =
      `${user.stats.accuracy}%`;
    document.getElementById("statKDR").textContent =
      user.stats.accuracy > 0
        ? (user.stats.wins / Math.max(user.stats.matches, 1)).toFixed(2)
        : "0.00";

    const date = new Date(user.createdAt).toLocaleDateString("it-IT");
    document.getElementById("profileDate").textContent = date;
  } catch (error) {
    console.error("Errore caricamento profilo:", error);
    document.querySelector(".profile-container").innerHTML = `
      <p style="color: var(--color-error);">❌ ${error.message}</p>
      <a href="/login.html" class="btn-secondary">🔙 Torna al Login</a>
    `;
  }
});
