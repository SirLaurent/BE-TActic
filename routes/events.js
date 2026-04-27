// 🪖 BE TActic - Rotte Eventi/Partite

const express = require("express");
const router = express.Router();

// Database in memoria (SOLO PER TEST)
const events = [];
let eventIdCounter = 1;

// 🔒 Escape anti-XSS
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// 📍 GET /api/events → Lista tutti gli eventi
router.get("/events", (req, res) => {
  res.json(events.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// 📍 POST /api/events → Crea nuovo evento
router.post("/events", (req, res) => {
  const { organizer, title, description, date, lat, lng } = req.body;

  if (!organizer || !title || !date || lat == null || lng == null) {
    return res
      .status(400)
      .json({
        message: "Campi obbligatori: organizzatore, titolo, data, lat, lng",
      });
  }

  const newEvent = {
    id: eventIdCounter++,
    organizer: escapeHtml(organizer),
    title: escapeHtml(title),
    description: escapeHtml(description || ""),
    date: new Date(date).toISOString(),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    participants: [],
    createdAt: new Date(),
  };

  events.push(newEvent);
  console.log(`🗺️ Nuovo evento creato: ${newEvent.title}`);
  res.status(201).json(newEvent);
});

// 📍 POST /api/events/:id/join → Partecipa a evento
router.post("/events/:id/join", (req, res) => {
  const { nickname } = req.body;
  const event = events.find((e) => e.id === parseInt(req.params.id));

  if (!event) return res.status(404).json({ message: "Evento non trovato" });
  if (event.participants.includes(nickname)) {
    return res.status(400).json({ message: "Sei già iscritto" });
  }

  event.participants.push(escapeHtml(nickname));
  res.json({
    message: "Iscrizione confermata!",
    participants: event.participants,
  });
});

module.exports = router;
