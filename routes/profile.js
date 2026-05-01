// 🪖 BE TActic - Rotte Profilo, Post e Squadre (stile Instagram)
const express = require("express");
const router = express.Router();

// Database in memoria (solo per test)
const users = {};
const posts = [];
const teams = {
  "Shadow Wolves": {
    banner: "https://placehold.co/800x300/1a2a1a/4a5d3a?text=SHADOW+WOLVES",
    members: ["TacticalWolf", "ShadowRecon"],
    subTeams: ["Alpha Squad", "Bravo Recon"],
  },
};

// 🔐 Inizializza utente al primo accesso
router.post("/api/profile/init", (req, res) => {
  const { nickname, email, team = "Nessuna" } = req.body;
  if (!users[nickname]) {
    users[nickname] = {
      nickname,
      email,
      team,
      avatar: "🪖",
      bio: "Operativo. Pronto per il campo.",
      followers: 0,
      following: 0,
      stories: [],
    };
  }
  res.json(users[nickname]);
});

// 👤 GET profilo pubblico
router.get("/api/profile/:nickname", (req, res) => {
  const user = users[req.params.nickname];
  if (!user) return res.status(404).json({ message: "Utente non trovato" });

  const teamData = Object.entries(teams).find(([_, t]) =>
    t.members.includes(req.params.nickname),
  );
  const teamName = teamData ? teamData[0] : "Nessuna";

  const userPosts = posts
    .filter((p) => p.author === req.params.nickname && p.type !== "story")
    .sort((a, b) => b.timestamp - a.timestamp);

  res.json({
    ...user,
    team: teamName,
    teamData,
    posts: userPosts,
  });
});

// 📸 POST nuovo contenuto
router.post("/api/posts", (req, res) => {
  const { author, type, url, caption } = req.body;
  if (!author || !url)
    return res.status(400).json({ message: "Campi obbligatori: author, url" });

  posts.push({
    id: Date.now(),
    author,
    type: type || "photo",
    url,
    caption,
    timestamp: Date.now(),
  });
  res.status(201).json({ message: "Contenuto pubblicato" });
});

// 🏴 GET info squadra
router.get("/api/teams/:name", (req, res) => {
  const team = teams[req.params.name];
  if (!team) return res.status(404).json({ message: "Squadra non trovata" });
  res.json(team);
});

module.exports = router;
