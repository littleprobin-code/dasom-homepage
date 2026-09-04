const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 80), {passive:true});
const items = [...document.querySelectorAll('.product-item')]; let active = 0;
function applyProductVisibility(){
  const mobile = innerWidth <= 760;
  items.forEach((item, index) => {
    if (mobile) {
      item.style.display = index === active ? '' : 'none';
      item.style.opacity = '1';
      item.style.transform = 'none';
    } else {
      item.style.display = '';
      item.style.opacity = '1';
      item.style.transform = index === active ? 'translateY(-8px)' : 'translateY(0)';
    }
  });
}
function move(step){ active = (active + step + items.length) % items.length; applyProductVisibility(); }
document.querySelector('.stage-next')?.addEventListener('click', () => move(1));
document.querySelector('.stage-prev')?.addEventListener('click', () => move(-1));
applyProductVisibility();
window.addEventListener('resize', applyProductVisibility);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Typing reveal: splits an element's text into per-character spans and
   fades them in one by one, like the headline being typed out. ---- */
function typeReveal(el, speed = 22) {
  if (!el) return;
  el.querySelectorAll('.type-caret').forEach(c => c.remove());
  if (reduceMotion) return;
  (function wrap(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3 && child.textContent.trim() !== '') {
        const frag = document.createDocumentFragment();
        [...child.textContent].forEach(ch => {
          const span = document.createElement('span');
          span.className = 'type-ch';
          span.textContent = ch;
          frag.appendChild(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        wrap(child);
      }
    });
  })(el);
  const chars = [...el.querySelectorAll('.type-ch')];
  const caret = document.createElement('span');
  caret.className = 'type-caret';
  el.appendChild(caret);
  chars.forEach((c, i) => window.setTimeout(() => c.classList.add('show'), i * speed));
  window.setTimeout(() => caret.remove(), chars.length * speed + 450);
}

/* ---- Scroll reveal: fades and lifts content in as it enters the viewport. ---- */
const revealGroups = [
  '.section-label, .eyebrow',
  '.company h2, .business h2, .channel h2, .brand h2, .strength h2, .partnership h2, .contact h2',
  '.company-text, .business-head > p, .brand-heading > p, .contact-email',
  '.text-link, .store-link',
  '.company-stats > div',
  '.flow > article',
  '.channel-grid > .channel-card',
  '.product-copy, .products > .product-item',
  '.strength-list > article',
  '.partnership-inner > *',
  '.contact-bottom'
];
const revealTargets = [];
revealGroups.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
    revealTargets.push(el);
  });
});
if (reduceMotion) {
  revealTargets.forEach(el => el.classList.add('is-visible'));
} else if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

const hero = document.querySelector('.hero');
const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('.hero-dot')];
const heroTitle = document.querySelector('#hero-title');
const heroDescription = document.querySelector('.hero-description');
const heroCount = document.querySelector('.hero-count b');
const heroCopy = document.querySelector('.hero-copy');
const pauseButton = document.querySelector('.hero-pause');
const heroMessages = [
  ['좋은 상품을 발견하고<br><em>더 큰 시장으로</em> 연결합니다.', '상품의 가능성을 찾는 순간부터, 브랜드가 고객을 만나는 순간까지.<br>다솜인터내셔널은 식품 유통의 모든 과정을 함께 설계합니다.'],
  ['좋은 상품으로<br><em>새로운 시장을</em> 만듭니다.', '상품 소싱과 기획, 콘텐츠와 유통을 연결해<br>고객이 선택하는 브랜드 경험을 만들어갑니다.'],
  ['브랜드의 성장을<br><em>더 멀리</em> 연결합니다.', '온라인 유통과 다양한 판매 채널을 통해<br>상품의 다음 가능성을 함께 찾아갑니다.']
];
let heroIndex = 0;
let heroPaused = reduceMotion;
let heroTimer;
function setHero(index) {
  heroIndex = (index + slides.length) % slides.length;
  heroCopy.classList.add('is-changing');
  slides.forEach((slide, i) => slide.classList.toggle('active', i === heroIndex));
  dots.forEach((dot, i) => { dot.classList.toggle('active', i === heroIndex); dot.setAttribute('aria-current', i === heroIndex ? 'true' : 'false'); });
  heroCount.textContent = String(heroIndex + 1).padStart(2, '0');
  window.setTimeout(() => {
    heroTitle.innerHTML = heroMessages[heroIndex][0];
    heroDescription.innerHTML = heroMessages[heroIndex][1];
    heroCopy.classList.remove('is-changing');
    typeReveal(heroTitle);
  }, 260);
}
function startHeroTimer() { if (!heroPaused) { clearInterval(heroTimer); heroTimer = window.setInterval(() => setHero(heroIndex + 1), 5500); } }
dots.forEach((dot, index) => dot.addEventListener('click', () => { setHero(index); startHeroTimer(); }));
pauseButton?.addEventListener('click', () => { heroPaused = !heroPaused; pauseButton.textContent = heroPaused ? '▶' : 'Ⅱ'; pauseButton.setAttribute('aria-label', heroPaused ? '자동 전환 재생' : '자동 전환 일시정지'); if (heroPaused) clearInterval(heroTimer); else startHeroTimer(); });
hero?.addEventListener('mouseenter', () => clearInterval(heroTimer));
hero?.addEventListener('mouseleave', startHeroTimer);
startHeroTimer();
window.setTimeout(() => typeReveal(heroTitle), 120);
