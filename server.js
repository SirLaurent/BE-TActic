// 🪖 BE TActic - Server principale (Express + Socket.io)
// ⚠️ QUESTO FILE GIRÀ SOLO SUL SERVER (Node.js). NIENTE 'document' O 'window'!

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 📦 Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 💬 Socket.io (Chat in tempo reale)
io.on("connection", (socket) => {
  console.log("👤 Utente connesso:", socket.id);

  const updateOnlineCount = () => {
    io.emit("online_count", io.of("/").sockets.size);
  };
  updateOnlineCount();

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

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("system_message", `${socket.username} ha lasciato la chat.`);
    }
    updateOnlineCount();
  });
});

// 🔌 Import Route Backend
const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feed");
const teamRoutes = require("./routes/teams");
const eventRoutes = require("./routes/events");

app.use("/api", authRoutes);
app.use("/api", feedRoutes);
app.use("/api", teamRoutes);
app.use("/api", eventRoutes);

// 📄 Route Pagine HTML
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
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public/dashboard.html")),
);

// 🏠 ROOT REDIRECT
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// 🚀 Avvio Server
server.listen(PORT, () => {
  console.log(`✅ Server BE TActic attivo su http://localhost:${PORT}`);
});
