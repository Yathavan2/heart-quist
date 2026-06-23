<div align="center">

# 💗 HeartQuest

**An interactive web-based quiz game that tests your knowledge with style.**

![HTML](https://img.shields.io/badge/HTML-28%25-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-29%25-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-41%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-1.6%25-777BB4?style=flat-square&logo=php&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

</div>

---

## 📖 Overview

HeartQuest is a full-featured web-based quiz application that challenges players with multiple-choice questions, tracks scores in real time, and ranks players on a live leaderboard. With dedicated pages for login, signup, profile management, and game history, it goes far beyond a simple quiz — it's a complete competitive knowledge platform.

---

## ✨ Features

- ❓ **Multiple-choice quiz gameplay** — Questions with instant right/wrong feedback
- 📊 **Real-time score tracking** — Live score updates as you play
- 🏆 **Leaderboard** — Compete with others and see where you rank
- 👤 **User authentication** — Sign up, log in, and manage your profile
- 📜 **Game history** — Review your past quiz sessions
- 📋 **Result summary** — Detailed breakdown after every game
- 🌐 **Fully browser-based** — No installation required, runs in any modern browser
- 📱 **Responsive UI** — Clean, styled interface across screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 |
| Logic | JavaScript (Vanilla) |
| Backend / API | Node.js (`server.js`) |
| Leaderboard API | PHP (`leaderboard_api.php`) |
| Data Storage | JSON (`users.json`, `leaderboard.json`, `histories.json`) |

---

## 📁 Project Structure

```
heart-quist/
├── index.html              # Landing / home page
├── login.html              # Login page
├── signup.html             # Sign-up page
├── game.html               # Quiz gameplay screen
├── result.html             # Result summary screen
├── leaderboard.html        # Leaderboard page
├── profile.html            # User profile page
├── about.html              # About page
├── model.html              # Quiz model / structure page
│
├── style.css               # Global styles
├── game.css                # Game screen styles
├── result.css              # Result screen styles
├── leaderboard.css         # Leaderboard styles
├── login.css / signup.css  # Auth page styles
├── profile.css             # Profile styles
├── about.css               # About page styles
├── auth-styles.css         # Shared auth styles
│
├── script.js               # Main scripts
├── game.js                 # Quiz logic
├── heartQuest.js           # Core game engine
├── result.js               # Result handling
├── leaderboard.js          # Leaderboard logic
├── auth.js                 # Authentication logic
├── profile.js              # Profile management
├── about.js                # About page logic
├── server.js               # Node.js backend server
├── leaderboard_api.php     # PHP leaderboard API
│
├── users.json              # User data store
├── leaderboard.json        # Leaderboard data store
├── histories.json          # Game history data store
├── package.json            # Node.js dependencies
└── 112.jpg                 # Asset image
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge)
- [Node.js](https://nodejs.org/) (for running the backend server)
- A local server or PHP environment (for leaderboard API, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YathavanJD/heart-quist.git
   cd heart-quist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   node server.js
   ```

4. **Open the app**
   - Open `index.html` in your browser, or visit `http://localhost:<port>` if the server serves files directly

> **Quick start (no backend):** If you only want to explore the frontend, simply open `index.html` directly in your browser.

---

## 🎮 How to Play

1. Open the app and **sign up** or **log in**
2. From the home screen, click **Start Quiz**
3. Answer each multiple-choice question — feedback is instant
4. View your **result summary** at the end of the game
5. Check the **leaderboard** to see how you rank against other players
6. Revisit your **profile** to see your game history

---

## 🎯 Purpose

HeartQuest was built to strengthen front-end development skills and explore full-stack web concepts, including:

- **Multi-page web app** architecture with consistent navigation
- **User authentication** flow (sign up, login, session handling)
- **DOM manipulation** and event-driven JavaScript
- **JSON-based data persistence** for users, scores, and history
- **Backend integration** with a Node.js server and PHP API

---

## 🤝 Contributing

Contributions are welcome!

1. Fork this repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with 💗 to learn and build better web experiences

</div>
