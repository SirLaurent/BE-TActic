// 🪖 BE TActic - Rotte Squadre/Clan

const express = require("express");
const router = express.Router();

// Database in memoria (SOLO PER TEST)
const teams = [];

// 🔒 Escape base anti-XSS
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

// 📋 LISTA SQUADRE (GET /api/teams)
router.get("/teams", (req, res) => {
  res.json(
    teams.map((t) => ({
      name: t.name,
      description: t.description,
      membersCount: t.members.length,
      maxMembers: t.maxMembers,
    })),
  );
});

// 🔎 DETTAGLI SQUADRA (GET /api/teams/:name)
router.get("/teams/:name", (req, res) => {
  const team = teams.find((t) => t.name === req.params.name);
  if (!team) return res.status(404).json({ message: "Squadra non trovata" });
  res.json(team);
});

// ✅ CREA SQUADRA (POST /api/teams)
router.post("/teams", (req, res) => {
  const { creator, name, description, maxMembers = 20 } = req.body;

  if (!creator || !name || !description) {
    return res
      .status(400)
      .json({ message: "Campi obbligatori: creatore, nome, descrizione" });
  }
  if (teams.find((t) => t.name === name)) {
    return res.status(400).json({ message: "Nome squadra già in uso" });
  }

  const newTeam = {
    name: escapeHtml(name),
    description: escapeHtml(description),
    maxMembers: parseInt(maxMembers),
    members: [
      { nickname: escapeHtml(creator), role: "Leader", joinedAt: new Date() },
    ],
    createdAt: new Date(),
  };

  teams.push(newTeam);
  console.log(`🏴 Nuova squadra creata: ${newTeam.name}`);
  res.status(201).json(newTeam);
});

// 🤝 UNISCI ALLA SQUADRA (POST /api/teams/:name/join)
router.post("/teams/:name/join", (req, res) => {
  const { nickname } = req.body;
  const team = teams.find((t) => t.name === req.params.name);

  if (!team) return res.status(404).json({ message: "Squadra non trovata" });
  if (team.members.length >= team.maxMembers) {
    return res.status(400).json({ message: "Squadra al completo" });
  }
  if (team.members.find((m) => m.nickname === nickname)) {
    return res.status(400).json({ message: "Sei già in questa squadra" });
  }

  team.members.push({
    nickname: escapeHtml(nickname),
    role: "Soldato",
    joinedAt: new Date(),
  });
  res.json({ message: "Unito alla squadra!", team });
});

// 👥 SQUADRA DI UN UTENTE (GET /api/teams/user/:nickname)
router.get("/teams/user/:nickname", (req, res) => {
  const userTeam = teams.find((t) =>
    t.members.some((m) => m.nickname === req.params.nickname),
  );
  if (!userTeam)
    return res
      .status(404)
      .json({ message: "L'utente non appartiene a nessuna squadra" });
  res.json(userTeam);
});

module.exports = router;
