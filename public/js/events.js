// 🪖 BE TActic - Gestione Mappa Eventi

document.addEventListener("DOMContentLoaded", () => {
  const CURRENT_USER = localStorage.getItem("beTactic_user") || "Ospite";

  // Inizializza mappa centrata sull'Italia
  const map = L.map("map").setView([42.5, 12.5], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  // Marker temporaneo per selezione posizione
  let tempMarker = null;
  const latInput = document.getElementById("eventLat");
  const lngInput = document.getElementById("eventLng");
  const createBtn = document.getElementById("createEventBtn");
  const coordsHint = document.getElementById("coordsHint");

  // Click sulla mappa per posizionare evento
  map.on("click", (e) => {
    if (tempMarker) map.removeLayer(tempMarker);
    tempMarker = L.marker(e.latlng).addTo(map);
    latInput.value = e.latlng.lat.toFixed(5);
    lngInput.value = e.latlng.lng.toFixed(5);
    createBtn.disabled = false;
    coordsHint.textContent = `📍 Posizione selezionata: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
  });

  // Crea evento
  document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("eventTitle").value.trim();
    const desc = document.getElementById("eventDesc").value.trim();
    const date = document.getElementById("eventDate").value;

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizer: CURRENT_USER,
          title,
          description: desc,
          date,
          lat: latInput.value,
          lng: lngInput.value,
        }),
      });

      if (res.ok) {
        const newEvent = await res.json();
        addEventMarker(newEvent);
        e.target.reset();
        createBtn.disabled = true;
        tempMarker = null;
        coordsHint.textContent =
          "📍 Clicca sulla mappa per posizionare l'evento";
        loadEvents();
      } else {
        const err = await res.json();
        alert("❌ " + err.message);
      }
    } catch {
      alert("Errore di rete");
    }
  });

  // Carica eventi esistenti
  async function loadEvents() {
    try {
      const res = await fetch("/api/events");
      const events = await res.json();

      // Pulisci lista e marker esistenti
      document.getElementById("eventsList").innerHTML = "";
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== tempMarker)
          map.removeLayer(layer);
      });

      if (events.length === 0) {
        document.getElementById("eventsList").innerHTML =
          '<p style="color:var(--color-text-muted)">Nessun evento programmato.</p>';
        return;
      }

      events.forEach(addEventMarker);
    } catch {
      document.getElementById("eventsList").innerHTML =
        '<p style="color:var(--color-error)">❌ Errore caricamento eventi</p>';
    }
  }

  function addEventMarker(event) {
    // Marker sulla mappa
    const marker = L.marker([event.lat, event.lng]).addTo(map);
    const participantText =
      event.participants.length > 0
        ? `👥 ${event.participants.join(", ")}`
        : "👥 Nessun partecipante";

    marker.bindPopup(`
      <div style="min-width:200px">
        <strong style="color:#4a5d3a">${event.title}</strong><br>
        📅 ${new Date(event.date).toLocaleString("it-IT")}<br>
        🎖️ Organizzato da: ${event.organizer}<br>
        ${event.description ? `<p style="margin:4px 0;font-size:0.9rem">${event.description}</p>` : ""}
        <p style="margin:4px 0;font-size:0.85rem">${participantText}</p>
        <button class="join-popup-btn" data-id="${event.id}" ${event.participants.includes(CURRENT_USER) ? "disabled" : ""}>
          ${event.participants.includes(CURRENT_USER) ? "✅ Iscritto" : "🤝 Partecipa"}
        </button>
      </div>
    `);

    // Aggiorna lista laterale
    const listEl = document.createElement("div");
    listEl.className = "event-item";
    listEl.innerHTML = `
      <h4>${event.title}</h4>
      <p>📅 ${new Date(event.date).toLocaleDateString("it-IT")}</p>
      <p>🎖️ ${event.organizer}</p>
      <p>👥 ${event.participants.length} partecipanti</p>
      <button class="join-event-btn" data-id="${event.id}" ${event.participants.includes(CURRENT_USER) ? "disabled" : ""}>
        ${event.participants.includes(CURRENT_USER) ? "✅ Già iscritto" : "🤝 Unisciti"}
      </button>
    `;
    document.getElementById("eventsList").appendChild(listEl);

    // Gestione click "Partecipa" (lista e popup)
    document
      .querySelectorAll(
        `.join-event-btn[data-id="${event.id}"], .join-popup-btn[data-id="${event.id}"]`,
      )
      .forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          try {
            const res = await fetch(`/api/events/${event.id}/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nickname: CURRENT_USER }),
            });
            if (res.ok) loadEvents(); // Ricarica tutto per aggiornare UI
          } catch {
            alert("Errore di rete");
          }
        });
      });
  }

  loadEvents();
});
