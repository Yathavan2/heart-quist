// leaderboard.js
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("leaderboardBody");
  const filterButtons = document.querySelectorAll(".filter-btn");

  function loadAllHistoryLocal() {
    let allEntries = [];
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith("heartquest_history_")) {
        const username = key.replace("heartquest_history_", "");
        const history = JSON.parse(localStorage.getItem(key) || "[]");
        (history || []).forEach(entry => {
          allEntries.push({
            username,
            score: entry.score,
            difficulty: entry.difficulty,
            date: new Date(entry.date)
          });
        });
      }
    }
    return allEntries.sort((a, b) => b.score - a.score);
  }

  async function loadAllHistory() {
    // try server first
    try {
      const res = await fetch('/leaderboard', { cache: 'no-cache' });
      if (res.ok) {
        const serverData = await res.json();
        // server returns {name, score, level, date}
        return serverData.map(d => ({
          username: (d.name || 'unknown'),
          score: d.score,
          difficulty: d.level || '',
          date: new Date(d.date)
        })).sort((a,b) => b.score - a.score);
      }
    } catch (e) { /* fallback to local */ }
    return loadAllHistoryLocal();
  }

  async function applyFilter(type) {
    let data = await loadAllHistory();
    const now = new Date();

    if (type === "today") {
      data = data.filter(e => e.date.toDateString() === now.toDateString());
    } else if (type === "week") {
      let weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      data = data.filter(e => e.date >= weekAgo);
    }
    render(data);
  }

  function rankMedal(rank) {
    return rank === 1 ? "🥇" :
           rank === 2 ? "🥈" :
           rank === 3 ? "🥉" : rank;
  }

  function render(data) {
    if (!tbody) return;
    tbody.innerHTML = "";
    data.forEach((p, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${rankMedal(i + 1)}</td>
        <td>${p.username}</td>
        <td>${p.score}</td>
        <td>${p.difficulty}</td>
        <td>${p.date.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
    if (!data.length) tbody.innerHTML = '<tr><td colspan="5">No entries yet</td></tr>';
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.dataset.filter);
    });
  });

  // default
  applyFilter("all");
});
