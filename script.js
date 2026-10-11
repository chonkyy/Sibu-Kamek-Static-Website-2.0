const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.classList.toggle("is-open", isOpen);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.classList.remove("is-open");
    nav.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
      dropdown.open = false;
      delete dropdown.dataset.hoverOpen;
    });
  });
});

nav.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
  const summary = dropdown.querySelector("summary");

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    const wasHoverOpen = dropdown.dataset.hoverOpen === "true";
    dropdown.open = wasHoverOpen ? true : !dropdown.open;
    delete dropdown.dataset.hoverOpen;
  });

  dropdown.addEventListener("mouseenter", () => {
    if (window.matchMedia("(hover: hover)").matches) {
      dropdown.open = true;
      dropdown.dataset.hoverOpen = "true";
    }
  });

  dropdown.addEventListener("mouseleave", () => {
    if (dropdown.dataset.hoverOpen === "true") {
      dropdown.open = false;
      delete dropdown.dataset.hoverOpen;
    }
  });
});

document.addEventListener("pointermove", (event) => {
  nav.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    if (
      dropdown.dataset.hoverOpen === "true" &&
      !dropdown.contains(event.target)
    ) {
      dropdown.open = false;
      delete dropdown.dataset.hoverOpen;
    }
  });
});

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const newsCarousel = document.querySelector(".news-carousel");
const newsTrack = document.querySelector(".news-track");
const newsCards = [...document.querySelectorAll(".news-card")];
const articleModal = document.querySelector("#article-modal");
const articleDialog = document.querySelector(".article-dialog");
const articleClose = document.querySelector(".article-close");
let articleOpener, wheelSnapTimer;

function updateCarousel() {
  if (!newsTrack || !newsCards.length) return;
  const stride = newsCards[0].getBoundingClientRect().width + 18;
  const first = Math.min(
    newsCards.length,
    Math.round(newsTrack.scrollLeft / stride) + 1,
  );
  const visible = Math.max(1, Math.round(newsTrack.clientWidth / stride));
  const status = document.querySelector(".carousel-status");
  if (status)
    status.textContent = `${first}–${Math.min(newsCards.length, first + visible - 1)} / ${newsCards.length}`;
  const previous = newsCarousel.querySelector(
    '[data-carousel-direction="prev"]',
  );
  const next = newsCarousel.querySelector('[data-carousel-direction="next"]');
  if (previous) previous.disabled = newsTrack.scrollLeft <= 1;
  if (next)
    next.disabled =
      newsTrack.scrollLeft >= newsTrack.scrollWidth - newsTrack.clientWidth - 2;
}
function openArticle(card) {
  if (!articleModal || articleModal.open) return;
  articleOpener = card;
  const overviewX = newsTrack.scrollLeft;
  newsTrack.scrollTo({ left: overviewX, behavior: "instant" });
  document.querySelector("#article-title").textContent = card.dataset.newsTitle;
  document.querySelector("#article-meta").textContent =
    `${card.dataset.newsDate} · ${card.dataset.newsCategory}`;
  const image = document.querySelector(".article-image");
  image.src = card.dataset.newsImage;
  image.alt = card.querySelector("img").alt;
  articleModal.showModal();
  document.body.classList.add("article-open");
  articleModal.classList.add("is-open");
  articleDialog.scrollTop = 0;
  articleClose.focus({ preventScroll: true });
}
function closeArticle() {
  if (!articleModal?.open) return;
  articleModal.close();
  articleModal.classList.remove("is-open");
  document.body.classList.remove("article-open");
  updateCarousel();
  articleOpener?.focus({ preventScroll: true });
}
if (newsCarousel) {
  newsCarousel.addEventListener("click", (event) => {
    const control = event.target.closest("[data-carousel-direction]");
    const card = event.target.closest(".news-card");
    if (control)
      newsTrack.scrollBy({
        left:
          (control.dataset.carouselDirection === "next" ? 1 : -1) *
          newsTrack.clientWidth,
        behavior: motion.matches ? "instant" : "smooth",
      });
    else if (card) openArticle(card);
  });
  newsCards.forEach((card) =>
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openArticle(card);
      }
    }),
  );
  newsTrack.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
        return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? newsTrack.clientWidth
            : 1);
      const max = newsTrack.scrollWidth - newsTrack.clientWidth;
      if (
        (delta > 0 && newsTrack.scrollLeft < max - 1) ||
        (delta < 0 && newsTrack.scrollLeft > 1)
      ) {
        event.preventDefault();
        // Preserve small trackpad/wheel deltas instead of snapping each event back.
        clearTimeout(wheelSnapTimer);
        newsTrack.style.scrollSnapType = "none";
        newsTrack.scrollLeft += delta;
        wheelSnapTimer = setTimeout(() => {
          newsTrack.style.scrollSnapType = "";
        }, 180);
      }
    },
    { passive: false },
  );
  newsTrack.addEventListener("scroll", updateCarousel, { passive: true });
  window.addEventListener("resize", updateCarousel);
  updateCarousel();
}
if (articleModal) {
  articleClose.addEventListener("click", closeArticle);
  articleModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeArticle();
  });
  articleModal.addEventListener("click", (event) => {
    if (event.target === articleModal) closeArticle();
  });
}
