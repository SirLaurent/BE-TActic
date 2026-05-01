// 🪖 BE TActic - Rotte Direct Messages (stile Instagram)
const express = require("express");
const router = express.Router();

// Database in memoria
const conversations = {}; // chiave: "userA_userB" (ordinati), valore: { participants, messages }

// 📋 Ottieni lista conversazioni di un utente
router.get("/api/direct/conversations/:nickname", (req, res) => {
  const myConvos = Object.entries(conversations)
    .filter(([_, c]) => c.participants.includes(req.params.nickname))
    .map(([key, c]) => {
      const other = c.participants.find((p) => p !== req.params.nickname);
      const lastMsg = c.messages[c.messages.length - 1];
      return {
        id: key,
        otherUser: other,
        lastMessage: lastMsg?.text || "Inizia a chattare...",
        lastTime: lastMsg?.time || "",
        avatar: "👤", // In futuro: recupero avatar reale
      };
    })
    .sort((a, b) => (b.lastTime > a.lastTime ? 1 : -1));

  res.json(myConvos);
});

// 💬 Ottieni messaggi di una conversazione
router.get("/api/direct/:conversationId/messages", (req, res) => {
  const convo = conversations[req.params.conversationId];
  res.json(convo ? convo.messages : []);
});

// 📤 Salva messaggio (fallback HTTP, ma useremo Socket.io per real-time)
router.post("/api/direct/message", (req, res) => {
  const { from, to, text, time } = req.body;
  if (!from || !to || !text)
    return res.status(400).json({ error: "Campi mancanti" });

  const convoId = [from, to].sort().join("_");
  if (!conversations[convoId]) {
    conversations[convoId] = { participants: [from, to], messages: [] };
  }
  conversations[convoId].messages.push({ from, text, time, read: false });
  res.json({ status: "ok", convoId });
});

module.exports = router;
