// 🪖 BE TActic - Server Principale Completo
// Express + Socket.io + Tutte le Route

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// 🚀 Inizializzazione
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// 📦 Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 💬 Socket.io: Gestione Connessioni Real-time
io.on("connection", (socket) => {
  console.log("👤 Utente connesso:", socket.id);

  // Conteggio utenti online
  const updateOnlineCount = () => {
    io.emit("online_count", io.of("/").sockets.size);
  };
  updateOnlineCount();

  // --- CHAT GLOBALE (Canale Radio) ---
  socket.on("join_chat", (username) => {
    socket.username = username;
    socket.broadcast.emit("system_message", `${username} è entrato in chat.`);
    updateOnlineCount();
  });

  socket.on("chat_message", (data) => {
    io.emit("chat_message", data);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("user_typing", username);
  });

  socket.on("stop_typing", (username) => {
    socket.broadcast.emit("user_stopped_typing", username);
  });

  // --- DIRECT MESSAGES (Privati stile Instagram) ---
  socket.on("join_private", (convoId) => {
    socket.join(convoId);
  });

  socket.on("send_private", (msg) => {
    // Invia il messaggio solo ai partecipanti della conversazione privata
    io.to(msg.convoId).emit("private_message", msg);
  });

  // Disconnessione
  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("system_message", `${socket.username} ha lasciato la chat.`);
    }
    updateOnlineCount();
    console.log("👋 Utente disconnesso:", socket.id);
  });
});

// 🔌 Import Route Backend (API)
const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feed");
const teamRoutes = require("./routes/teams");
const eventRoutes = require("./routes/events");
const profileRoutes = require("./routes/profile");
const directRoutes = require("./routes/direct");

// Montaggio route API sotto /api
app.use("/api", authRoutes);
app.use("/api", feedRoutes);
app.use("/api", teamRoutes);
app.use("/api", eventRoutes);
app.use("/api", profileRoutes);
app.use("/api", directRoutes);

// 📄 Route Pagine HTML (Frontend)
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public/login.html")),
);
app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "public/register.html")),
);
app.get("/profile", (req, res) =>
  res.sendFile(path.join(__dirname, "public/profile.html")),
);
app.get("/feed", (req, res) =>
  res.sendFile(path.join(__dirname, "public/feed.html")),
);
app.get("/teams", (req, res) =>
  res.sendFile(path.join(__dirname, "public/team.html")),
);
app.get("/events", (req, res) =>
  res.sendFile(path.join(__dirname, "public/events.html")),
);
app.get("/chat", (req, res) =>
  res.sendFile(path.join(__dirname, "public/chat.html")),
);
app.get("/direct", (req, res) =>
  res.sendFile(path.join(__dirname, "public/direct.html")),
);
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public/dashboard.html")),
);

// 🏠 ROOT: Reindirizza sempre alla Dashboard
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// ❌ Gestione Errori 404 (opzionale ma utile)
app.use((req, res) => {
  res.status(404).send("⚠️ Pagina non trovata su BE TActic");
});

// 🚀 Avvio Server
server.listen(PORT, () => {
  console.log(`✅ Server BE TActic attivo su http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready per chat globale e direct messages`);
});
