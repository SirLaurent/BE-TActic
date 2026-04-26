// 🪖 BE TActic - Gestione registrazione frontend

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita il ricaricamento della pagina

    // Recupera i valori dai campi
    const nickname = document.getElementById("nickname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    console.log("📤 Invio registrazione per:", nickname); // Debug: vedi nella console

    try {
      // Invia i dati al backend
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();
      console.log("📥 Risposta backend:", data); // Debug: vedi la risposta

      if (response.ok) {
        alert("✅ Registrazione riuscita! Ora puoi accedere.");
        // Reindirizza alla pagina di login
        window.location.href = "/login";
      } else {
        alert("❌ Errore: " + data.message);
      }
    } catch (error) {
      console.error("❌ Errore di rete:", error);
      alert("❌ Errore di connessione. Controlla che il server sia acceso!");
    }
  });
