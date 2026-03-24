(function(){
  if(window.__heartQuestInit) return;
  window.__heartQuestInit = true;

  const FREESOUND_KEY = "fiIxGN4e0DNsDZx20fj6qJIBH11A6NXNOScP6pbD";
  const musicToggle = document.getElementById("musicToggle");
  let bgMusic = new Audio();
  bgMusic.loop = true;
  bgMusic.volume = 0.45;

  async function loadFreeSound(){
    try{
      const res = await fetch(`https://freesound.org/apiv2/search/text/?query=cartoon+fun&fields=previews&token=${FREESOUND_KEY}`);
      const data = await res.json();
      if(data.results.length > 0){
        const track = data.results[Math.floor(Math.random()*data.results.length)];
        bgMusic.src = track.previews["preview-hq-mp3"];
      }
    } catch{
      bgMusic.src = "https://cdn.pixabay.com/download/audio/2023/01/26/audio_9c0c8d91f0.mp3";
    }
  }
  loadFreeSound().then(()=>{
    if(localStorage.getItem("heartquest_music")==="on"){ bgMusic.play().catch(()=>{}); musicToggle?.classList.add("active"); }
  });

  musicToggle?.addEventListener("click", ()=>{
    if(bgMusic.paused){ bgMusic.play(); localStorage.setItem("heartquest_music","on"); musicToggle.classList.add("active"); }
    else{ bgMusic.pause(); localStorage.setItem("heartquest_music","off"); musicToggle.classList.remove("active"); }
  });

  // Floating Hearts
  setInterval(()=>{
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = "💖";
    heart.style.left = 8 + Math.random()*84 + "vw";
    heart.style.animationDuration = (4+Math.random()*3)+"s";
    document.body.appendChild(heart);
    setTimeout(()=>heart.remove(),8500);
  },900);

  // Sparkle Canvas
  const canvas = document.getElementById("sparkleCanvas");
  const ctx = canvas?.getContext?.("2d");
  if(canvas && ctx){
    const sparkles = Array.from({length:45},()=>({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      size:0.6+Math.random()*1.8,
      speed:0.3+Math.random()*0.9,
      alpha:0.4+Math.random()*0.7,
      tw: Math.random()*0.05
    }));
    function animate(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const now = Date.now()/1000;
      sparkles.forEach(s=>{
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
        ctx.fillStyle = `rgba(255,200,230,${Math.max(0,Math.min(1,s.alpha+Math.sin(now*2+s.tw)*0.12))})`;
        ctx.fill();
        s.y -= s.speed;
        if(s.y<-10){ s.y=canvas.height+10; s.x=Math.random()*canvas.width; }
      });
      requestAnimationFrame(animate);
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    animate();
  }

  // Forms
  document.addEventListener("DOMContentLoaded", ()=>{
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const sanitize = s=>String(s).trim();

    // Signup
    if(signupForm){
      signupForm.addEventListener("submit", e=>{
        e.preventDefault();
        const username = sanitize(document.getElementById("signupUsername").value);
        const password = document.getElementById("signupPassword").value;
        const confirm = document.getElementById("confirmPassword").value;
        const email = sanitize(document.getElementById("signupEmail").value);
        const birthdate = sanitize(document.getElementById("signupBirthdate").value);

        if(!username || !password){ alert("Fill required fields."); return; }
        if(password!==confirm){ alert("Passwords do not match!"); return; }

        let users = JSON.parse(localStorage.getItem("users")||"[]");
        if(users.find(u=>u.username===username)){ alert("Username already exists!"); return; }

        users.push({username,password,email,birthdate});
        localStorage.setItem("users",JSON.stringify(users));

        localStorage.setItem("heartquest_current_player", JSON.stringify({name: username, email}));
        alert("Account created! Redirecting to profile.");
        window.location.href="profile.html";
      });
    }

    // Login
    if(loginForm){
      loginForm.addEventListener("submit", e=>{
        e.preventDefault();
        const username = sanitize(document.getElementById("loginUsername").value);
        const password = document.getElementById("loginPassword").value;
        const users = JSON.parse(localStorage.getItem("users")||"[]");
        const found = users.find(u=>u.username===username && u.password===password);
        if(found){
          localStorage.setItem("heartquest_current_player", JSON.stringify({name: found.username, email: found.email}));
          alert(`Welcome back, ${username}!`);
          window.location.href="profile.html";
        } else alert("Invalid username or password!");
      });
    }
  });

})();
