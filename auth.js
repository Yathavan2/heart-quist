
// auth.js
// Central auth code for Heart Quest (login + signup).
// Uses localStorage keys:
// - heartquest_users : array of { username, password, email, birthdate }
// - heartquest_current_player : { username, email }
// - heartquest_music : "on"/"off"

(function () {
  'use strict';

  // Utility
  const qs = sel => document.querySelector(sel);
  const sanitize = s => String(s || '').trim();
  const lk = key => localStorage.getItem(key);
  const setk = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  function loadUsers() {
    try {
      const raw = lk('heartquest_users') || '[]';
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // normalize & dedupe by username (lowercase)
      const map = new Map();
      parsed.forEach(u => {
        if (!u || !u.username) return;
        const un = String(u.username).trim().toLowerCase();
        if (!map.has(un)) map.set(un, { username: un, password: u.password || '', email: u.email || '', birthdate: u.birthdate || '' });
      });
      const arr = Array.from(map.values());
      // write back normalized users (safe)
      setk('heartquest_users', arr);
      return arr;
    } catch (e) {
      console.warn('loadUsers failed', e);
      setk('heartquest_users', []);
      return [];
    }
  }

  function saveUsers(users) {
    try {
      setk('heartquest_users', users);
    } catch (e) {
      console.warn('saveUsers failed', e);
    }
  }

  function signupHandler(e) {
    e.preventDefault();
    const usernameRaw = sanitize(qs('#signupUsername')?.value);
    const username = usernameRaw.toLowerCase();
    const password = qs('#signupPassword')?.value || '';
    const confirm = qs('#confirmPassword')?.value || '';
    const email = sanitize(qs('#signupEmail')?.value);
    const birthdate = sanitize(qs('#signupBirthdate')?.value);

    if (!username || !password) { alert('Please fill required fields.'); return; }
    if (password !== confirm) { alert('Passwords do not match!'); return; }
    if (password.length < 4) { alert('Password should be at least 4 characters.'); return; }

    const users = loadUsers();
    if (users.find(u => u.username === username)) {
      alert('Username already exists! Choose another.');
      return;
    }

    users.push({ username, password, email, birthdate });
    saveUsers(users);
    alert('Account created. You may now login.');
    // go to login page
    window.location.href = 'login.html';
  }

  async function loginHandler(e) {
    if (e) e.preventDefault();
    const usernameRaw = sanitize(qs('#loginUsername')?.value);
    const username = usernameRaw.toLowerCase();
    const password = qs('#loginPassword')?.value || '';

    if (!username || !password) {
      alert('Enter username and password.');
      return;
    }

    // Prefer server auth if you have it — fallback to localStorage
    try {
      // try server login first (non-blocking)
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        const email = data.email || '';
        const player = { username, email };
        localStorage.setItem('heartquest_current_player', JSON.stringify(player));
        alert(`Welcome back, ${username}! ❤️`);
        window.location.href = 'index.html';
        return;
      }
    } catch (err) {
      // server may not exist — fallback to local
      console.info('Server login failed, falling back to localStorage.');
    }

    const users = loadUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      const player = { username: found.username, email: found.email || '' };
      localStorage.setItem('heartquest_current_player', JSON.stringify(player));
      alert(`Welcome back, ${username}! ❤️`);
      window.location.href = 'index.html';
    } else {
      alert('Invalid username or password!');
    }
  }

  // Attach handlers on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const signupForm = qs('#signupForm');
    const loginForm = qs('#loginForm');

    // Protect: create users storage if missing
    loadUsers();

    if (signupForm) signupForm.addEventListener('submit', signupHandler);

    if (loginForm) loginForm.addEventListener('submit', loginHandler);

    // If some pages include old inline code, expose a function
    window.heartQuestLocalLogin = loginHandler;
  });

})();
