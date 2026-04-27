// 🪖 BE TActic - Rotte di autenticazione (SICURE E COMPLETE)

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Database in memoria (SOLO PER TEST)
const users = [];

// 🔐 REGISTRAZIONE
router.post("/register", async (req, res) => {
  const { nickname, email, password, confirmPassword } = req.body;

  if (!nickname || !email || !password) {
    return res.status(400).json({ message: "Tutti i campi sono obbligatori" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Le password non coincidono" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "La password deve avere almeno 8 caratteri" });
  }

  const existing = users.find(
    (u) => u.email === email || u.nickname === nickname,
  );
  if (existing) {
    return res.status(400).json({ message: "Email o nickname già registrati" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: users.length + 1,
      nickname,
      email,
      passwordHash: hashedPassword,
      team: "Nessuna",
      stats: { matches: 0, wins: 0, accuracy: 0 },
      createdAt: new Date(),
    };

    users.push(newUser);
    console.log("✅ Utente registrato (hash sicuro):", newUser.nickname);

    res.status(201).json({
      message: "Registrazione riuscita!",
      user: { nickname: newUser.nickname, email: newUser.email },
    });
  } catch (err) {
    console.error("Errore hashing:", err);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

// 🔐 LOGIN (con redirect al Feed)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email e password sono obbligatori" });
  }

  const user = users.find((u) => u.email === email || u.nickname === email);
  if (!user) {
    return res.status(401).json({ message: "Credenziali non valide" });
  }

  try {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    console.log("✅ Login riuscito:", user.nickname);

    // 🔁 Redirect al feed dopo il login
    res.json({
      message: "Login riuscito!",
      redirect: "/feed",
    });
  } catch (err) {
    console.error("Errore login:", err);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

// 👤 PROFILO PUBBLICO
router.get("/users/:nickname", (req, res) => {
  const user = users.find((u) => u.nickname === req.params.nickname);

  if (!user) {
    return res.status(404).json({ message: "Utente non trovato" });
  }

  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
