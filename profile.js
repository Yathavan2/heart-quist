// profile.js — unified, robust profile script
document.addEventListener("DOMContentLoaded", () => {
  // Elements (may be absent on some pages)
  const playerNameEl = document.getElementById("playerName");
  const playerEmailEl = document.getElementById("playerEmail");
  const gamesPlayedEl = document.getElementById("gamesPlayed");
  const avgScoreEl = document.getElementById("avgScore");
  const lastPlayedEl = document.getElementById("lastPlayed");
  const gameHistoryTable = document.getElementById("gameHistoryTable");
  const musicToggle = document.getElementById("musicToggle");
  const avatarEl = document.getElementById("avatarCircle");
  const particleIntervalMs = 600; // how often to spawn hearts

  // Helper: safe text set
  const setTextSafe = (el, txt) => { if (!el) return; el.textContent = String(txt); };

  // Read current player (unified key)
  const currentPlayer = JSON.parse(localStorage.getItem("heartquest_current_player") || "null");

  if (!currentPlayer || !currentPlayer.username) {
    // Guest view: fill placeholders where present
    setTextSafe(playerNameEl, "Guest");
    setTextSafe(playerEmailEl, "Not logged in");
    setTextSafe(gamesPlayedEl, "0");
    setTextSafe(avgScoreEl, "0");
    setTextSafe(lastPlayedEl, "-");
    if (gameHistoryTable) gameHistoryTable.innerHTML = '<tr><td colspan="4">No history (please log in)</td></tr>';
    // Still initialize music toggle & particles so page feels alive even for guest
    initMusicToggle();
    startHeartParticles();
    return;
  }

  // We have a logged-in user
  const storedUsername = String(currentPlayer.username || "").trim();
  const displayName = storedUsername.length ? (storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1)) : "Player";
  const usernameKey = storedUsername.toLowerCase(); // keys are stored lowercased

  // Display basic info
  setTextSafe(playerNameEl, displayName);
  setTextSafe(playerEmailEl, currentPlayer.email || "—");

  // Avatar generator (single initial + pastel background)
  if (avatarEl) {
    const initial = displayName.charAt(0).toUpperCase() || "?";
    // generate pastel color from username
    const hue = (storedUsername.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * 37) % 360;
    avatarEl.style.background = `linear-gradient(135deg, hsl(${hue},70%,66%), hsl(${(hue+30)%360},78%,68%))`;
    avatarEl.textContent = initial;
  }

  // Load history safely (default to [])
  let history = [];
  try {
    const key = `heartquest_history_${usernameKey}`;
    const raw = localStorage.getItem(key) || "[]";
    history = JSON.parse(raw);
    if (!Array.isArray(history)) history = [];
  } catch (e) {
    console.warn("Failed to read history, using empty array", e);
    history = [];
  }

  // Stats
  setTextSafe(gamesPlayedEl, history.length);
  if (history.length > 0) {
    const avg = history.reduce((s, g) => s + (Number(g.score) || 0), 0) / history.length;
    setTextSafe(avgScoreEl, avg.toFixed(1));
    const last = history[history.length - 1];
    setTextSafe(lastPlayedEl, last && last.date ? new Date(last.date).toLocaleString() : "-");
  } else {
    setTextSafe(avgScoreEl, "0");
    setTextSafe(lastPlayedEl, "-");
  }

  // Render history table
  if (gameHistoryTable) {
    if (!history.length) {
      gameHistoryTable.innerHTML = '<tr><td colspan="4">No games played yet.</td></tr>';
    } else {
      gameHistoryTable.innerHTML = "";
      // show newest first
      history.slice().reverse().forEach((g, idx) => {
        const tr = document.createElement("tr");
        const score = Number(g.score) || 0;
        const difficulty = g.difficulty || "N/A";
        const dateText = g.date ? new Date(g.date).toLocaleString() : "-";
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${score}</td>
          <td>${difficulty}</td>
          <td>${dateText}</td>
        `;
        gameHistoryTable.appendChild(tr);
      });
    }
  }

  // Music toggle init (works for guest too)
  initMusicToggle();

  // Start particles
  startHeartParticles();

  // -------------------------
  // Helper functions
  // -------------------------
  function initMusicToggle() {
    if (!musicToggle) return;
    // Create audio instance (shared)
    let bgMusic;
    try {
      bgMusic = new Audio();
      bgMusic.loop = true;
      bgMusic.volume = 0.45;
      bgMusic.src = "https://cdn.pixabay.com/download/audio/2023/01/26/audio_9c0c8d91f0.mp3?filename=fantasy-ambient-13477.mp3";
    } catch (e) {
      console.warn("Could not create background audio", e);
      return;
    }

    // Reflect current state
    if (localStorage.getItem("heartquest_music") === "on") {
      bgMusic.play().catch(()=>{});
      musicToggle.classList.add("active");
    } else {
      musicToggle.classList.remove("active");
    }

    // toggle handler
    musicToggle.addEventListener("click", () => {
      if (bgMusic.paused) {
        bgMusic.play().catch(()=>{});
        localStorage.setItem("heartquest_music", "on");
        musicToggle.classList.add("active");
      } else {
        bgMusic.pause();
        localStorage.setItem("heartquest_music", "off");
        musicToggle.classList.remove("active");
      }
    });
  }

  // Heart particle spawner — safe for guest or logged-in
  function startHeartParticles() {
    // avoid creating multiple intervals if function accidentally called more than once
    if (window.__heartParticlesStarted) return;
    window.__heartParticlesStarted = true;

    function spawnHeartOnce() {
      const heart = document.createElement("div");
      heart.className = "heart-particle";
      const hearts = ["💖","💕","💞","💘","❤️","❣️"];
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      // position within viewport width with a bit of padding
      const left = Math.random() * 90 + 2; // 2vw to 92vw
      heart.style.left = `${left}vw`;
      heart.style.fontSize = `${18 + Math.random() * 28}px`;
      heart.style.opacity = (0.35 + Math.random() * 0.5).toString();
      heart.style.animationDuration = `${4 + Math.random() * 5}s`;
      document.body.appendChild(heart);
      // cleanup after animation (safe timeout slightly larger than duration)
      setTimeout(() => {
        try { heart.remove(); } catch {}
      }, (9000));
    }

    // initial burst
    for (let i = 0; i < 6; i++) setTimeout(spawnHeartOnce, i * 160);
    // continuous spawn
    window.__heartParticleInterval = setInterval(spawnHeartOnce, particleIntervalMs);
  }

});
