// game.js — Heart Quest (kids-friendly sounds, require login, hints, background music)
// Note: place correct element IDs in your HTML (start button remains but name input removed)

const FREESOUND_KEY = "fiIxGN4e0DNsDZx20fj6qJIBH11A6NXNOScP6pbD"; // keep, but we use filtered queries + fallback
const GIPHY_KEY = "qEfGaQD6QAcY5wzHvYflgk1hugbDkG";

const LEVEL_SETTINGS = {
  easy:   { label: "Melody Meadows (Easy)",    puzzles: 10 },
  medium: { label: "Harmony Hills (Medium)",   puzzles: 20 },
  hard:   { label: "Symphony of Hearts (Hard)", puzzles: 30 }
};

let currentLevel = "easy";
let puzzles = [];
let pIndex = 0;
let filledSlots = 0;
let score = 0;
let hintsLeft = 3;
let livesLeft = 3;
let memoryGridCount = 0;
let bgMusic = null;
let bgMusicEnabled = false;

// small helpers
function $(id) { return document.getElementById(id) || null; }
function $all(sel, root = document) { try { return Array.from(root.querySelectorAll(sel)); } catch { return []; } }
function setText(el, txt) { if (!el) return; el.textContent = String(txt); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function shuffleArray(a) { return a.sort(() => Math.random() - 0.5); }
function safeJSON(s) { try { return JSON.parse(s); } catch { return null; } }

const home = $("home");
const game = $("game");
const end = $("end");
const startBtn = $("startBtn");
const levelButtons = $all(".pill");
const chapterTitle = $("chapterTitle");
const questionText = $("questionText");
const answersDiv = $("answers");
const progressText = $("progressText");
const questionNumber = $("questionNumber");
const feedback = $("feedback");
const hintBtn = $("hintBtn");
const boardContainer = $("boardContainer");
const gifBox = $("gifBox");
const scoreEl = $("score");
const hintsEl = $("hints");
const livesEl = $("lives");
const correctAudio = $("correctAudio") || new Audio();
const wrongAudio = $("wrongAudio") || new Audio();
const endTitle = $("endTitle");
const endSummary = $("endSummary");
const quoteBox = $("quoteBox");
const musicToggle = $("musicToggle"); // a button in UI that toggles bg music

// make sure a player is logged in — if not, redirect to login
function requireLogin() {
  const cur = safeJSON(localStorage.getItem('heartquest_current_player') || 'null');
  if (!cur || !cur.username) {
    alert('Please login to play the game.');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Level selector
if (levelButtons.length) {
  levelButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      levelButtons.forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      currentLevel = e.currentTarget.dataset.level || "easy";
    });
  });
}

// Start button — now requires login and uses current player name (no name input)
if (startBtn) {
  startBtn.addEventListener("click", async () => {
    if (!requireLogin()) return;
    if (!currentLevel) currentLevel = "easy";
    await startGame(currentLevel);
  });
}

// Start/resume game
async function startGame(levelKey) {
  pIndex = 0;
  puzzles = [];
  filledSlots = 0;
  score = 0;
  hintsLeft = 3;
  livesLeft = 3;

  setText(scoreEl, score);
  setText(hintsEl, hintsLeft);
  updateLivesUI();

  home?.classList.add("hidden");
  end?.classList.add("hidden");
  game?.classList.remove("hidden");

  currentLevel = levelKey;
  const cfg = LEVEL_SETTINGS[currentLevel] || LEVEL_SETTINGS.easy;
  memoryGridCount = cfg.puzzles;
  chapterTitle && (chapterTitle.textContent = cfg.label);

  buildMemoryGrid(memoryGridCount);
  await fetchHeartPuzzles(cfg.puzzles);
  prefetchSounds();
  ensureBgMusic();
  loadNextPuzzle();
}

// build memory grid UI
function buildMemoryGrid(n) {
  if (!boardContainer) return;
  boardContainer.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "memory-grid";
  const cols = n <= 6 ? 3 : n <= 12 ? 4 : 5;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  for (let i = 0; i < n; i++) {
    const slot = document.createElement("div");
    slot.className = "memory-slot empty";
    slot.dataset.index = i;
    slot.textContent = "♡";
    grid.appendChild(slot);
  }
  boardContainer.appendChild(grid);
  setText(progressText, `Fragments Restored: ${filledSlots}/${memoryGridCount}`);
}

// Fetch puzzles — use the same API but be defensive
async function fetchHeartPuzzles(amount) {
  showFeedback("Loading heart puzzles...", "info");
  puzzles = [];
  const apiUrl = "https://marcconrad.com/uob/heart/api.php?out=json&base64=no";
  for (let i = 0; i < amount; i++) {
    try {
      const res = await fetch(apiUrl, { cache: "no-cache" });
      const data = await res.json();
      puzzles.push({ img: data.question || "", solution: String(data.solution || Math.floor(Math.random()*12+1)) });
    } catch (err) {
      puzzles.push({ img: "", solution: String(Math.floor(Math.random() * 12) + 1) });
    }
  }
  showFeedback("");
}

// load next puzzle
function loadNextPuzzle() {
  gifBox?.classList.add("hidden");
  showFeedback("");

  if (pIndex >= puzzles.length) return finishLevel();

  const p = puzzles[pIndex];
  setText(questionNumber, `Puzzle ${pIndex + 1} / ${puzzles.length}`);

  if (questionText) {
    questionText.innerHTML = `
      <div style="text-align:center;margin-bottom:8px;">
        ${p.img ? `<img src="${p.img}" alt="puzzle" style="max-width:100%;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08)">` : '<div class="placeholder-puzzle">No image</div>'}
      </div>
      <p style="text-align:center;margin-bottom:12px;">Pick the correct number that completes this heart puzzle</p>
    `;
  }

  const allNums = new Set([String(p.solution)]);
  while (allNums.size < 4) allNums.add(String(Math.floor(Math.random() * 12) + 1));
  const choices = shuffleArray(Array.from(allNums));

  answersDiv.innerHTML = "";
  choices.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = c;
    btn.disabled = false;
    btn.addEventListener("click", () => handleAnswer(btn, c === p.solution));
    answersDiv.appendChild(btn);
  });

  setText(progressText, `Fragments Restored: ${filledSlots}/${memoryGridCount}`);
}

// answer handling
function handleAnswer(btnEl, isCorrect) {
  // disable all options immediately
  [...answersDiv.children].forEach(b => b.disabled = true);

  if (isCorrect) {
    btnEl.classList.add("correct");
    showFeedback("💖 Correct — fragment restored!", "success");
    score += 10;
    setText(scoreEl, score);
    fillNextSlotWithHeart();
    playClap();
    showGif("heart celebration");
  } else {
    btnEl.classList.add("wrong");
    showFeedback("💔 Wrong — you lost a life.", "error");
    livesLeft = Math.max(0, livesLeft - 1);
    updateLivesUI();
    playErrorSound();
    punishRandomFilledSlot();
    if (livesLeft <= 0) return setTimeout(() => finishLevel(true), 900);
  }

  pIndex++;
  setTimeout(loadNextPuzzle, 900);
}

// fill a grid slot visually
function fillNextSlotWithHeart() {
  const slot = $all(".memory-slot.empty")[0];
  if (!slot) return;
  slot.classList.remove("empty");
  slot.innerHTML = `<div class="heart-fragment" style="font-size:2rem;">${randomHeartEmoji()}</div>`;
  filledSlots++;
  setText(progressText, `Fragments Restored: ${filledSlots}/${memoryGridCount}`);
}

// punish reduces one filled slot
function punishRandomFilledSlot() {
  const filled = $all(".memory-slot:not(.empty)");
  if (!filled.length) return;
  const slot = filled[Math.floor(Math.random() * filled.length)];
  slot.style.opacity = "0.45";
  score = Math.max(0, score - 5);
  setText(scoreEl, score);
  filledSlots = Math.max(0, filledSlots - 1);
  setText(progressText, `Fragments Restored: ${filledSlots}/${memoryGridCount}`);
}

// random emoji helper
function randomHeartEmoji() {
  const arr = ["❤️","💖","💘","💝","❣️","💕","💞"];
  return arr[Math.floor(Math.random() * arr.length)];
}

// format difficulty
function formatDifficulty(level) {
  const cfg = LEVEL_SETTINGS[level] || LEVEL_SETTINGS.easy;
  return cfg.label;
}

// Save history to server (if available) or local
async function saveHistory(finalScore, levelKey) {
  const cur = JSON.parse(localStorage.getItem("heartquest_current_player") || "null");
  if (!cur || !cur.username) return;

  const payload = {
    username: cur.username.toLowerCase(),
    score: finalScore,
    difficulty: formatDifficulty(levelKey),
    date: new Date().toISOString()
  };

  try {
    const res = await fetch('/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('server failed');
  } catch (err) {
    // fallback: store local history per-user
    const key = `heartquest_history_${payload.username}`;
    try {
      let h = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(h)) h = [];
      h.push(payload);
      h = h.slice(-200);
      localStorage.setItem(key, JSON.stringify(h));
    } catch (e) { console.warn('Failed to store history locally', e); }
  }
}

// finish level
function finishLevel(forced = false) {
  game.classList.add("hidden");
  end.classList.remove("hidden");

  const cfg = LEVEL_SETTINGS[currentLevel];
  setText(endTitle, forced ? "Game Over 💔" : "Level Complete 💖");
  setText(endSummary, `Score: ${score}, Restored: ${filledSlots}/${memoryGridCount}`);

  localStorage.setItem("finalScore", score);
  localStorage.setItem("level", currentLevel);
  saveHistory(score, currentLevel);
  submitScoreToLeaderboard(getCurrentUsername(), score, cfg.label);
  tryShowQuote();

  setTimeout(() => window.location.href = "result.html", 1000);
}

// update lives UI
function updateLivesUI() {
  if (!livesEl) return;
  const hearts = "❤️".repeat(livesLeft) + "🤍".repeat(3 - livesLeft);
  setText(livesEl, hearts);
}

// feedback UI
function showFeedback(txt = "", type = "") {
  if (!feedback) return;
  feedback.textContent = txt;
  feedback.className = type; // you can map classes to colors in CSS
}

// try show quote
async function tryShowQuote() {
  try {
    const res = await fetch("https://api.quotable.io/random");
    if (!res.ok) throw new Error();
    const data = await res.json();
    quoteBox.textContent = `"${data.content}" — ${data.author}`;
  } catch {
    quoteBox.textContent = "";
  }
}

// submit score to server (leaderboard)
async function submitScoreToLeaderboard(name, scoreValue, difficulty) {
  try {
    await fetch("/leaderboard", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name, score: scoreValue, level: difficulty })
    });
  } catch { /* silent fallback */ }
}

function getCurrentUsername() {
  const cur = JSON.parse(localStorage.getItem('heartquest_current_player') || 'null');
  return cur && cur.username ? cur.username : 'guest';
}

// -----------------------
// Sounds: kid-friendly handling
// -----------------------

// Preload or set up audio elements
function prefetchSounds() {
  // Use stable clap & error sounds from trusted CDNs as primary.
  // Fallback conservative samples (Pixabay or included assets) used.
  try {
    correctAudio.src = "https://cdn.pixabay.com/audio/2021/08/04/audio_3e1c88d3c7.mp3"; // light applause
    wrongAudio.src = "https://cdn.pixabay.com/audio/2021/08/04/audio_8b2b8d2b92.mp3"; // gentle fail sound
    correctAudio.volume = 0.5;
    wrongAudio.volume = 0.5;
  } catch (e) {
    console.warn('prefetchSounds', e);
  }
}

function playClap() {
  try {
    correctAudio.currentTime = 0;
    correctAudio.play().catch(()=>{});
  } catch (e) {}
}

function playErrorSound() {
  try {
    wrongAudio.currentTime = 0;
    wrongAudio.play().catch(()=>{});
  } catch (e) {}
}

// Try to fetch kid-friendly sound from freesound (but use vetted query)
async function playFreesoundPreview(query, audioEl) {
  // do NOT rely solely on this; we use fallback URLs above
  try {
    const safeQ = `${query} kids children applause cartoon`;
    const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(safeQ)}&fields=previews,username,tags,duration&filter=duration:[0 TO 30]&token=${FREESOUND_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const candidate = data.results?.find(r => Array.isArray(r.tags) ? !r.tags.includes('nsfw') : true) || data.results?.[0];
    const preview = candidate?.previews?.["preview-lq-mp3"] || candidate?.previews?.["preview-hq-mp3"];
    if (preview) {
      audioEl.src = preview;
      audioEl.play().catch(()=>{});
    }
  } catch (e) { /* ignore */ }
}

// -----------------------
// GIFs (celebration)
async function showGif(q = "celebration") {
  if (!gifBox) return;
  try {
    const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=6&rating=pg`);
    if (!res.ok) throw new Error();
    const list = (await res.json()).data;
    if (!list || !list.length) return;
    const gifUrl = list[Math.floor(Math.random()*list.length)]?.images?.downsized_medium?.url;
    gifBox.innerHTML = `<img src="${gifUrl}" alt="gif" style="max-width:180px;border-radius:8px;">`;
    gifBox.classList.remove("hidden");
    setTimeout(() => gifBox.classList.add("hidden"), 1800);
  } catch (e) { /* ignore */ }
}

// -----------------------
// HINTS implementation
// - On hint, reduce answer options to 2: correct + one random wrong.
// - Decreases hintsLeft, updates UI, and gives feedback.
if (hintBtn) {
  hintBtn.addEventListener('click', () => {
    if (hintsLeft <= 0) { showFeedback("No hints left!", "error"); return; }
    const p = puzzles[pIndex];
    if (!p) { showFeedback("No puzzle loaded.", "error"); return; }

    // reduce options: find current buttons, leave correct + one other
    const buttons = Array.from(answersDiv.querySelectorAll('button'));
    if (!buttons.length) return;

    // find correct and wrong
    const correctBtn = buttons.find(b => b.textContent.trim() === String(p.solution));
    const wrongBtns = buttons.filter(b => b !== correctBtn);
    if (!correctBtn || wrongBtns.length === 0) return;

    const keepWrong = wrongBtns[Math.floor(Math.random() * wrongBtns.length)];
    // disable and fade other wrong choices
    buttons.forEach(b => {
      if (b !== correctBtn && b !== keepWrong) {
        b.disabled = true;
        b.classList.add('hidden-choice'); // style with CSS to fade
      }
    });

    hintsLeft = Math.max(0, hintsLeft - 1);
    setText(hintsEl, hintsLeft);
    showFeedback("Hint used — two options remain.", "info");
  });
}

// -----------------------
// Background music & music toggle
function ensureBgMusic() {
  if (bgMusic) return;
  try {
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.45;
    bgMusic.src = "https://cdn.pixabay.com/download/audio/2023/01/26/audio_9c0c8d91f0.mp3?filename=fantasy-ambient-13477.mp3"; // safe ambient
  } catch (e) { console.warn("bgMusic init failed", e); bgMusic = null; }
}

if (musicToggle) {
  // reflect saved state
  if (localStorage.getItem("heartquest_music") === "on") {
    ensureBgMusic();
    if (bgMusic) { bgMusic.play().catch(()=>{}); musicToggle.classList.add("active"); bgMusicEnabled = true; }
  }

  musicToggle.addEventListener("click", () => {
    ensureBgMusic();
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play().catch(()=>{});
      localStorage.setItem("heartquest_music", "on");
      musicToggle.classList.add("active");
      bgMusicEnabled = true;
    } else {
      bgMusic.pause();
      localStorage.setItem("heartquest_music", "off");
      musicToggle.classList.remove("active");
      bgMusicEnabled = false;
    }
  });
}

// -----------------------
// Helper server ping endpoint used by auth
// (nothing to do here)

// -----------------------
// Initialize
document.addEventListener("DOMContentLoaded", () => {
  prefetchSounds();
});
