// 🪖 BE TActic - Rotte Feed Attività

const express = require("express");
const router = express.Router();

// Database in memoria (SOLO PER TEST - resetta al riavvio)
const posts = [];
let postIdCounter = 1;

// 🔒 Funzione base anti-XSS
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// GET /api/feed → Restituisce tutti i post (dal più recente)
router.get("/feed", (req, res) => {
  res.json(posts.sort((a, b) => b.createdAt - a.createdAt));
});

// POST /api/feed → Crea un nuovo post
router.post("/feed", (req, res) => {
  const { author, content, type = "generic" } = req.body;

  if (!author || !content || content.trim().length === 0) {
    return res
      .status(400)
      .json({ message: "Autore e contenuto sono obbligatori" });
  }
  if (content.length > 500) {
    return res
      .status(400)
      .json({ message: "Il post non può superare 500 caratteri" });
  }

  const newPost = {
    id: postIdCounter++,
    author: escapeHtml(author),
    content: escapeHtml(content),
    type, // 'match', 'photo', 'gear', 'generic'
    likes: 0,
    comments: [],
    createdAt: Date.now(),
  };

  posts.push(newPost);
  console.log(`📝 Nuovo post di ${newPost.author}`);
  res.status(201).json(newPost);
});

// POST /api/feed/:id/like → Aggiunge un like
router.post("/feed/:id/like", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post non trovato" });

  post.likes += 1;
  res.json({ likes: post.likes });
});

// POST /api/feed/:id/comment → Aggiunge un commento
router.post("/feed/:id/comment", (req, res) => {
  const { author, text } = req.body;
  const post = posts.find((p) => p.id === parseInt(req.params.id));

  if (!post) return res.status(404).json({ message: "Post non trovato" });
  if (!author || !text)
    return res.status(400).json({ message: "Autore e testo obbligatori" });

  post.comments.push({
    id: Date.now(),
    author: escapeHtml(author),
    text: escapeHtml(text),
    createdAt: Date.now(),
  });

  res.json(post.comments);
});

module.exports = router;
