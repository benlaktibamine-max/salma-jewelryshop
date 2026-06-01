/* Tsawer Salma — phototourl (stable) */

const PHOTO_URLS = {
  p1: "https://cdn.phototourl.com/free/2026-05-23-41b69fcb-0182-4acf-961b-8735b597d8b0.jpg",
  p2: "https://cdn.phototourl.com/free/2026-05-23-87b2eb61-7561-4b69-881b-7bd27ac377f5.jpg",
  p3: "https://cdn.phototourl.com/free/2026-05-23-03f94407-e5e6-45c3-b472-298d0f707885.jpg",
  p4: "https://cdn.phototourl.com/free/2026-05-23-4ad15cdf-2b14-4a68-abf4-48ed7fd66679.jpg",
};

const IMAGES = {
  hero: {
    bijoux:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2400&q=90",
    couple:
      "https://images.unsplash.com/photo-1603561591412-07134e18571b?auto=format&fit=crop&w=2400&q=90",
    paquets: PHOTO_URLS.p3,
  },
  heroFallback:
    "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=2400&q=90",
  about:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=85",
  fallback:
    "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=800&q=85",
};

/** Applique src + secours si l'image ne charge pas */
function bindImageFallback(img) {
  if (!img || img.dataset.fallbackBound) return;
  img.dataset.fallbackBound = "1";
  img.referrerPolicy = "no-referrer";
  const alt = img.dataset.fallback || IMAGES.fallback;

  img.addEventListener("error", function onErr() {
    if (img.src !== alt) {
      img.src = alt;
    } else {
      img.removeEventListener("error", onErr);
    }
  });
}

function initAllImageFallbacks() {
  document
    .querySelectorAll("img[data-fallback], .hero__bg img, .paquet-card__img img, .about__visual img")
    .forEach(bindImageFallback);
}

function heroImageList() {
  const h = IMAGES.hero;
  return [h.bijoux, h.couple, h.paquets].filter(Boolean);
}

function applyHeroSlideImages() {
  const slides = document.querySelectorAll(".hero__slide");
  const sources = [IMAGES.hero.bijoux, IMAGES.hero.couple, IMAGES.hero.paquets];
  const fb = IMAGES.heroFallback || IMAGES.fallback;

  slides.forEach((slide, i) => {
    const url = sources[i];
    const bg = slide.querySelector(".hero__bg");
    if (!bg || !url) return;

    bg.classList.remove("hero__bg--multi");
    delete bg.dataset.bgInterval;

    const priority = i === 0 ? 'fetchpriority="high"' : 'loading="eager"';
    bg.innerHTML = `<img src="${url}" alt="" width="1920" height="1080" ${priority} decoding="async" referrerpolicy="no-referrer" data-fallback="${fb}">`;
  });

  initAllImageFallbacks();
}

function preloadHeroImages() {
  heroImageList().forEach((url) => {
    if (document.querySelector(`link[rel="preload"][href="${url}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
}
