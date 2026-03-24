// script.js (lightweight floating hearts for pages that include it)

function createHeart() {
  const container = document.getElementById('heart-background');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'heart-wrapper';
  wrapper.style.left = Math.random() * 95 + 'vw';
  wrapper.style.animationDuration = (4 + Math.random() * 5) + 's';

  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.style.fontSize = (20 + Math.random() * 24) + 'px';
  heart.textContent = '❤️';

  wrapper.appendChild(heart);
  container.appendChild(wrapper);

  setTimeout(() => {
    if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }, (parseFloat(wrapper.style.animationDuration) || 6) * 1000 + 400);
}

if (!window.__floatingHeartInterval) {
  window.__floatingHeartInterval = setInterval(createHeart, 350);
}
