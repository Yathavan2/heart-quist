// server.js (Express) — provides leaderboard, users, and history JSON storage
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const leaderboardFile = path.join(__dirname, "leaderboard.json");
const usersFile = path.join(__dirname, "users.json");
const historiesFile = path.join(__dirname, "histories.json");

// ensure files exist
function ensureJsonFile(filePath, defaultContent = "[]") {
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, defaultContent);
    else {
      const raw = fs.readFileSync(filePath, "utf-8");
      try {
        JSON.parse(raw);
      } catch {
        fs.writeFileSync(filePath, defaultContent);
      }
    }
  } catch (err) { console.error("Error ensuring file", filePath, err); }
}
ensureJsonFile(leaderboardFile, "[]");
ensureJsonFile(usersFile, "[]");
ensureJsonFile(historiesFile, "{}"); // histories keyed by username

app.use(express.json());
app.use(express.static(__dirname));

// basic ping so client can detect server presence
app.get("/_ping", (req, res) => res.json({ ok: true }));

/* ---------- SIGNUP / LOGIN ---------- */
app.post("/signup", (req, res) => {
  const { username, password, email, birthdate } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  let users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  if (users.find(u => u.username === username)) return res.status(400).json({ error: "Username exists" });

  users.push({ username, password, email, birthdate });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.json({ message: "Signup successful" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username/password required" });

  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  const found = users.find(u => u.username === username && u.password === password);
  if (found) res.json({ message: "Login successful", username, email: found.email || '' });
  else res.status(401).json({ error: "Invalid username/password" });
});

/* ---------- LEADERBOARD ---------- */
app.get("/leaderboard", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(leaderboardFile, "utf-8"));
    data.sort((a, b) => (b.score || 0) - (a.score || 0));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

app.post("/leaderboard", (req, res) => {
  const { name, score, level } = req.body;
  if (!name || typeof score !== "number" || !level) return res.status(400).json({ error: "Invalid data" });

  try {
    const data = JSON.parse(fs.readFileSync(leaderboardFile, "utf-8"));
    data.push({ name, score, level, date: new Date().toISOString() });
    data.sort((a, b) => (b.score || 0) - (a.score || 0));
    fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2));
    res.json({ message: "Score added", scores: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save score" });
  }
});

/* ---------- HISTORY (per-user) ---------- */
// POST /history { username, score, difficulty, date }
app.post("/history", (req, res) => {
  const { username, score, difficulty, date } = req.body;
  if (!username || typeof score === 'undefined') return res.status(400).json({ error: "Invalid history data" });

  try {
    const all = JSON.parse(fs.readFileSync(historiesFile, "utf-8") || "{}");
    const key = String(username).toLowerCase();
    if (!Array.isArray(all[key])) all[key] = [];
    all[key].push({ score, difficulty, date: date || new Date().toISOString() });
    // keep last 200
    all[key] = all[key].slice(-200);
    fs.writeFileSync(historiesFile, JSON.stringify(all, null, 2));
    res.json({ message: "History saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save history" });
  }
});

// GET /history?user=username
app.get("/history", (req, res) => {
  try {
    const user = String(req.query.user || "").toLowerCase();
    const all = JSON.parse(fs.readFileSync(historiesFile, "utf-8") || "{}");
    if (!user) return res.json(all); // return full object if no user
    return res.json(all[user] || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// Fallback: serve login.html (or index) for unknown paths
app.use((req, res) => res.sendFile(path.join(__dirname, "login.html")));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
