// BE TActic - Server principale
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Rotte di autenticazione
const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feed");
app.use("/api", feedRoutes);
app.use("/api", authRoutes);

// Pagine HTML
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/login");
});
app.get("/profile", (req, res) => {
  res.sendFile(__dirname + "/public/profile.html");
});

app.get("/feed", (req, res) => {
  res.sendFile(__dirname + "/public/feed.html");
});

app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});

// Redirect root alla dashboard se loggato, altrimenti login
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// Avvio server
app.listen(PORT, () => {
  console.log("Server BE TActic in ascolto su http://localhost:" + PORT);
});
const teamRoutes = require("./routes/teams");
app.use("/api", teamRoutes);

app.get("/teams", (req, res) => {
  res.sendFile(__dirname + "/public/team.html");
});
const eventRoutes = require("./routes/events");
app.use("/api", eventRoutes);

app.get("/events", (req, res) => {
  res.sendFile(__dirname + "/public/events.html");
});
