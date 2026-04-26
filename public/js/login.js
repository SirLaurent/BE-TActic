// 🪖 BE TActic - Gestione login frontend (AGGIORNATO)

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita il ricaricamento della pagina

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ FIX: Usiamo direttamente data.message e data.redirect
      alert(`✅ ${data.message}`);

      // Se il backend fornisce un URL di redirect, ci andiamo
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } else {
      alert("❌ Errore: " + data.message);
    }
  } catch (error) {
    console.error("❌ Errore di rete:", error);
    alert("❌ Errore di connessione. Riprova.");
  }
});
