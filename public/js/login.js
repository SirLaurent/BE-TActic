// 🪖 BE TActic - Gestione login frontend (CORRETTO ✅)

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userInput, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ ${data.message}`);

      // 🔐 FIX FONDAMENTALE: Salva l'utente nel browser
      localStorage.setItem("beTactic_user", userInput);

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
