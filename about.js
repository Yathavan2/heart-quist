// about.js
// Heart floating particles + section reveal (cleaned & defensive)

const heartEmojis = ['❤️', '💖', '💕', '💞', '💘', '❣️'];

function createHeart() {
  const container = document.getElementById('heart-background');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'heart-wrapper';
  wrapper.style.left = Math.random() * 95 + 'vw';
  wrapper.style.animationDuration = (4 + Math.random() * 6) + 's';

  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.style.fontSize = (18 + Math.random() * 28) + 'px';
  heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  wrapper.appendChild(heart);

  container.appendChild(wrapper);

  // Remove after animation (safe)
  setTimeout(() => {
    if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }, (parseFloat(wrapper.style.animationDuration) || 6) * 1000 + 300);
}

if (!window.__aboutHeartInterval) {
  window.__aboutHeartInterval = setInterval(createHeart, 350);
}

// Section reveal
const revealSections = document.querySelectorAll('.about-section, .developer-section, .howto-section, section');
function handleReveal() {
  const triggerOffset = window.innerHeight - 120;
  revealSections.forEach(sec => {
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    if (rect.top < triggerOffset) sec.classList.add('visible');
  });
}
window.addEventListener('scroll', handleReveal, { passive: true });
window.addEventListener('resize', handleReveal);
document.addEventListener('DOMContentLoaded', handleReveal);

// Scroll top button safe handling
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
  function toggleScrollTop() {
    scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }
  window.addEventListener('scroll', toggleScrollTop, { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  toggleScrollTop();
}
