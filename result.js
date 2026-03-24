// result.js
document.addEventListener("DOMContentLoaded", () => {
  const playerName = localStorage.getItem("playerName") || "Player";
  const finalScore = parseInt(localStorage.getItem("finalScore"), 10) || 0;
  const level = localStorage.getItem("level") || "easy";

  const playerNameEl = document.getElementById("playerName");
  const finalScoreEl = document.getElementById("finalScore");
  const levelEl = document.getElementById("level");

  if (playerNameEl) playerNameEl.textContent = "Well done!";
  if (finalScoreEl) finalScoreEl.textContent = `${finalScore}`;
  if (levelEl) levelEl.textContent = level.charAt(0).toUpperCase() + level.slice(1);

  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({
    name: playerName,
    score: finalScore,
    level: level,
    date: new Date().toLocaleString(),
  });
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  setTimeout(() => {
    window.location.href = "leaderboard.html";
  }, 3000);
});
