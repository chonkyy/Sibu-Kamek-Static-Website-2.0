const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.classList.toggle('is-open', isOpen);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('is-open');
    nav.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
      dropdown.open = false;
      delete dropdown.dataset.hoverOpen;
    });
  });
});

nav.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  const summary = dropdown.querySelector('summary');

  summary.addEventListener('click', (event) => {
    event.preventDefault();
    const wasHoverOpen = dropdown.dataset.hoverOpen === 'true';
    dropdown.open = wasHoverOpen ? true : !dropdown.open;
    delete dropdown.dataset.hoverOpen;
  });

  dropdown.addEventListener('mouseenter', () => {
    if (window.matchMedia('(hover: hover)').matches) {
      dropdown.open = true;
      dropdown.dataset.hoverOpen = 'true';
    }
  });

  dropdown.addEventListener('mouseleave', () => {
    if (dropdown.dataset.hoverOpen === 'true') {
      dropdown.open = false;
      delete dropdown.dataset.hoverOpen;
    }
  });
});

document.addEventListener('pointermove', (event) => {
  nav.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
    if (dropdown.dataset.hoverOpen === 'true' && !dropdown.contains(event.target)) {
      dropdown.open = false;
      delete dropdown.dataset.hoverOpen;
    }
  });
});

const newsCarousel = document.querySelector('.news-carousel');
const newsTrack = document.querySelector('.news-track');
const newsCards = [...document.querySelectorAll('.news-card')];
const carouselStatus = document.querySelector('.carousel-status');
const articleModal = document.querySelector('#article-modal');
const articleDialog = document.querySelector('.article-dialog');
const articleClose = document.querySelector('.article-close');
const articleTitle = document.querySelector('#article-title');
const articleMeta = document.querySelector('#article-meta');
const articleImage = document.querySelector('.article-image');
let carouselPage = 0;

function cardsPerPage() {
  return window.innerWidth <= 480 ? 1 : window.innerWidth <= 800 ? 2 : 3;
}

function updateCarousel() {
  const visibleCards = cardsPerPage();
  const pageCount = Math.ceil(newsCards.length / visibleCards);
  carouselPage = Math.min(carouselPage, pageCount - 1);
  const cardWidth = newsCards[0].getBoundingClientRect().width;
  newsTrack.style.transform = `translateX(-${carouselPage * visibleCards * (cardWidth + 18)}px)`;
  carouselStatus.textContent = `${String(carouselPage + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}`;
}

function openArticle(card) {
  articleTitle.textContent = card.dataset.newsTitle;
  articleMeta.textContent = `${card.dataset.newsDate} · ${card.dataset.newsCategory}`;
  articleImage.src = card.dataset.newsImage;
  articleImage.alt = card.querySelector('img').alt;
  articleModal.classList.add('is-open');
  articleModal.setAttribute('aria-hidden', 'false');
  articleDialog.scrollTop = 0;
  articleClose.focus();
}

function closeArticle() {
  articleModal.classList.remove('is-open');
  articleModal.setAttribute('aria-hidden', 'true');
}

newsCarousel.addEventListener('click', (event) => {
  const control = event.target.closest('[data-carousel-direction]');
  const card = event.target.closest('.news-card');
  if (control) {
    const pageCount = Math.ceil(newsCards.length / cardsPerPage());
    carouselPage = control.dataset.carouselDirection === 'next'
      ? (carouselPage + 1) % pageCount
      : (carouselPage - 1 + pageCount) % pageCount;
    updateCarousel();
  } else if (card) {
    openArticle(card);
  }
});

newsCards.forEach((card) => card.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openArticle(card);
  }
}));

articleClose.addEventListener('click', closeArticle);
articleModal.addEventListener('click', (event) => {
  if (event.target === articleModal) closeArticle();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && articleModal.classList.contains('is-open')) closeArticle();
});
window.addEventListener('resize', updateCarousel);
updateCarousel();
