// Smooth scroll for navigation links
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId.startsWith('#')) {
      e.preventDefault();
      document.querySelector(targetId).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Sticky header shadow effect on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// --- Dynamic animation speed based on scroll velocity ---
let lastScrollY = window.scrollY;
let lastTime = performance.now();
let fadeDuration = 0.4; // default

function updateFadeDuration() {
  const now = performance.now();
  const newY = window.scrollY;
  const dy = Math.abs(newY - lastScrollY);
  const dt = now - lastTime;
  // pixels per ms
  const velocity = dt > 0 ? dy / dt : 0;
  // Map velocity to duration: fast scroll = short duration, slow scroll = long duration
  // velocity: 0 (stopped) => 1.2s, velocity: 1+ (very fast) => 0.2s
  let duration = 1.2 - Math.min(velocity, 1) * 1.0; // 1.2s to 0.2s
  duration = Math.max(0.2, Math.min(duration, 1.2));
  fadeDuration = duration;
  document.documentElement.style.setProperty('--fade-duration', fadeDuration + 's');
  lastScrollY = newY;
  lastTime = now;
}
window.addEventListener('scroll', updateFadeDuration);
window.addEventListener('DOMContentLoaded', updateFadeDuration);

// Fade-in animation on scroll for sections and service cards
function revealOnScroll() {
  const fadeEls = document.querySelectorAll('.fade-in');
  const windowHeight = window.innerHeight;
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < windowHeight - 60 && rect.bottom > 60) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });

  // Service cards: trigger when services section is near center (within 80% of viewport)
  const servicesSection = document.querySelector('.services-section');
  if (servicesSection) {
    const rect = servicesSection.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = windowHeight / 2;
    const dist = Math.abs(sectionCenter - viewportCenter);
    const threshold = windowHeight * 0.8 / 2; // 80% of viewport height
    const serviceCards = document.querySelectorAll('.service-card');
    if (dist < threshold) {
      serviceCards.forEach(card => card.classList.add('visible'));
    } else {
      serviceCards.forEach(card => card.classList.remove('visible'));
    }
  }
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
});

// Optional: Prevent form submission (demo only)
document.querySelector('.contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you for contacting us!');
});

// --- Section fade based on distance from viewport center ---
function updateSectionFades() {
  const sections = document.querySelectorAll('.fade-section');
  const windowHeight = window.innerHeight;
  const center = window.scrollY + windowHeight / 2;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + window.scrollY + rect.height / 2;
    const dist = Math.abs(center - sectionCenter);
    // 0 when centered, up to windowHeight/2 when at edge
    let fade = 1 - Math.min(dist / (windowHeight / 2), 1) * 0.4; // fade to 0.6 (less fady)
    section.style.setProperty('--section-fade', fade);
  });
  requestAnimationFrame(updateSectionFades);
}
requestAnimationFrame(updateSectionFades);

// --- Virtual Circular Carousel: No clones, just real cards ---
function setupCarousel() {
  // Get stories from the global carousel data (set by updateCarouselWithData)
  const stories = window.carouselStories || [];
  
  if (stories.length === 0) {
    console.log('No stories available for carousel');
    return;
  }

  const carousel = document.querySelector('.services-carousel');
  const slidesContainer = carousel.querySelector('.carousel-slides');
  const dotsContainer = document.querySelector('.carousel-dots');
  const cardCount = stories.length;

  // Dots
  dotsContainer.innerHTML = '';
  for (let i = 0; i < cardCount; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to story ${i + 1}`);
    dot.addEventListener('click', function() { goToIndex(i); });
    dotsContainer.appendChild(dot);
  }
  const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

  let currentIndex = 0;
  let autoScrollTimer = null;
  let lastIndex = 0;

  function renderSlides(direction = 1) {
    // Animate out old cards if present
    const oldCards = Array.from(slidesContainer.children);
    oldCards.forEach((card, i) => {
      if (i === 0 && direction === 1) {
        card.classList.add('fade-out-left');
      } else if (i === oldCards.length - 1 && direction === -1) {
        card.classList.add('fade-out-right');
      } else {
        card.classList.add(direction === 1 ? 'fade-out-left' : 'fade-out-right');
      }
      card.addEventListener('animationend', () => card.remove());
    });
    // Wait a tick to allow fade-out, then add new cards
    setTimeout(() => {
      slidesContainer.innerHTML = '';
      // Get the 5 visible indices in order: edge, side, center, side, edge
      const idxs = [
        (currentIndex - 2 + cardCount) % cardCount,
        (currentIndex - 1 + cardCount) % cardCount,
        currentIndex,
        (currentIndex + 1) % cardCount,
        (currentIndex + 2) % cardCount
      ];
      const classes = [
        'service-card carousel-edge',
        'service-card carousel-side',
        'service-card carousel-center',
        'service-card carousel-side-right',
        'service-card carousel-edge-right'
      ];
      idxs.forEach((storyIdx, i) => {
        const story = stories[storyIdx];
        const card = document.createElement('div');
        card.className = classes[i];
        
        // Create media content
        let mediaContent = '';
        if (story.mediaUrl) {
          if (story.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            // Image
            mediaContent = `<div class='card-extra'><img src='${story.mediaUrl}' alt='${story.title}' style='max-width:100%;max-height:60px;margin-top:8px;'></div>`;
          } else if (story.mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
            // Video
            mediaContent = `<div class='card-extra'><video controls style='width:90%;margin-top:8px;'><source src='${story.mediaUrl}' type='video/mp4'>Your browser does not support the video tag.</video></div>`;
          } else if (story.mediaUrl.match(/\.(mp3|wav|ogg)$/i)) {
            // Audio
            mediaContent = `<div class='card-extra'><audio controls style='width:90%;margin-top:8px;'><source src='${story.mediaUrl}' type='audio/mpeg'>Your browser does not support the audio element.</audio></div>`;
          }
        }
        
        // Center card: show story with read more link that appears on hover
        if (i === 2) {
          card.innerHTML = `
            <a class="service-link" href="stories.html#story${(story.originalIndex !== undefined ? story.originalIndex + 1 : stories.indexOf(story) + 1)}">
              <h3>${story.title}</h3>
              <div class="story-author"><span class="author-name">${story.name || 'Anonymous'}</span></div>
              <p><span class="story-full clamped">${story.content}</span></p>
              <div class="read-more-hover">Read more →</div>
              ${mediaContent}
            </a>
          `;
        } else {
          // Truncate content for side cards
          const shortContent = story.content.length > 100 ? story.content.substring(0, 100) + '...' : story.content;
          card.innerHTML = `
            <a class="service-link" href="stories.html#story${(story.originalIndex !== undefined ? story.originalIndex + 1 : stories.indexOf(story) + 1)}">
              <h3>${story.title}</h3>
              <div class="story-author"><span class="author-name">${story.name || 'Anonymous'}</span></div>
              <p><span class="story-short">${shortContent}</span></p>
            </a>
          `;
        }
        // Animate in
        if (i === 0 && direction === 1) {
          card.classList.add('fade-in-right');
        } else if (i === classes.length - 1 && direction === -1) {
          card.classList.add('fade-in-left');
        } else {
          card.classList.add(direction === 1 ? 'fade-in-right' : 'fade-in-left');
        }
        slidesContainer.appendChild(card);
      });
      // --- True center fix: dynamically offset center card ---
      const centerCard = slidesContainer.querySelector('.carousel-center');
      if (centerCard) {
        const scale = 1.28;
        const cardRect = centerCard.getBoundingClientRect();
        const cardWidth = cardRect.width / scale;
        const offset = ((cardWidth * scale) - cardWidth) / 2 - 52;
        centerCard.style.transform = `scale(${scale}) translateX(-${offset}px)`;
      }
      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }, 50);
  }

  function updateCarousel(newIndex = currentIndex) {
    currentIndex = newIndex;
    renderSlides();
  }

  function goToIndex(idx) {
    const direction = idx > currentIndex ? 1 : -1;
    currentIndex = idx;
    renderSlides(direction);
  }

  function startAutoScroll() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % cardCount;
      renderSlides(1);
    }, 5000);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  // Pause auto-scroll on hover
  carousel.addEventListener('mouseenter', stopAutoScroll);
  carousel.addEventListener('mouseleave', startAutoScroll);

  // Add hover event listeners for card expansion
  slidesContainer.addEventListener('mouseover', function(e) {
    const card = e.target.closest('.service-card');
    if (card && card.classList.contains('carousel-center')) {
      card.classList.add('card-hovered');
      stopAutoScroll();
    }
  });
  
  slidesContainer.addEventListener('mouseout', function(e) {
    const card = e.target.closest('.service-card');
    if (card && card.classList.contains('carousel-center')) {
      card.classList.remove('card-hovered');
      startAutoScroll();
    }
  });

  // Initialize
  renderSlides();
  startAutoScroll();
}

window.addEventListener('DOMContentLoaded', setupCarousel);

// --- Hero Slideshow ---
function setupHeroSlideshow() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dotsContainer = document.querySelector('.hero-dots');
  if (!slides.length || !dotsContainer) return;
  let current = 0;
  let timer = null;

  // Create dots
  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = Array.from(dotsContainer.querySelectorAll('.hero-dot'));

  function showSlide(idx) {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === idx));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    current = idx;
  }

  function goTo(idx) {
    showSlide(idx);
    restartTimer();
  }

  function next() {
    showSlide((current + 1) % slides.length);
  }

  function startTimer() {
    timer = setInterval(next, 4000);
  }
  function stopTimer() {
    if (timer) clearInterval(timer);
  }
  function restartTimer() {
    stopTimer();
    startTimer();
  }

  // Pause on hover
  const heroSection = document.querySelector('.hero-section');
  heroSection.addEventListener('mouseenter', stopTimer);
  heroSection.addEventListener('mouseleave', startTimer);

  showSlide(0);
  startTimer();
}

window.addEventListener('DOMContentLoaded', setupHeroSlideshow);

// --- Hero Photo Carousel ---
function setupHeroPhotoCarousel() {
  const photos = Array.from(document.querySelectorAll('.memorial-photo'));
  if (photos.length < 2) return; // Need at least 2 photos for carousel

  let currentPhotoIndex = 0;
  let photoTimer = null;

  function showPhoto(index) {
    photos.forEach((photo, i) => {
      photo.classList.toggle('active', i === index);
    });
    currentPhotoIndex = index;
  }

  function nextRandomPhoto() {
    // Get a random photo that's different from the current one
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * photos.length);
    } while (nextIndex === currentPhotoIndex && photos.length > 1);

    showPhoto(nextIndex);
  }

  function startPhotoTimer() {
    if (photoTimer) clearInterval(photoTimer);
    photoTimer = setInterval(nextRandomPhoto, 5500); // 5.5 seconds
  }

  function stopPhotoTimer() {
    if (photoTimer) clearInterval(photoTimer);
  }

  // Pause on hover
  const heroPhoto = document.querySelector('.hero-photo');
  if (heroPhoto) {
    heroPhoto.addEventListener('mouseenter', stopPhotoTimer);
    heroPhoto.addEventListener('mouseleave', startPhotoTimer);
  }

  // Initialize
  showPhoto(0); // Start with first photo
  startPhotoTimer();
}

window.addEventListener('DOMContentLoaded', setupHeroPhotoCarousel);

function createScatteredBackgroundPhotos() {
  const container = document.querySelector('.background-photos');
  if (!container) return;
  container.innerHTML = '';
  if (window.innerWidth < 900) return;

  // Images to use
  const images = ['kabir1.jpg', 'kabir2.jpg', 'kabir3.jpg', 'kabir4.jpg'];
  // Number of photos
  const count = 13 + Math.floor(Math.random() * 4); // 13, 14, 15, or 16
  // Sizes in px (reduced by ~25%)
  const sizes = [
    {w: 128, h: 158}, // large
    {w: 105, h: 128}, // medium
    {w: 82, h: 105}   // small
  ];
  // Area for placement
  const areaW = container.offsetWidth || window.innerWidth * 0.38;
  const areaH = container.offsetHeight || window.innerHeight;
  const margin = 18; // px from edge, slightly reduced

  // Grid-based even spread, but allow rightmost column to reach the edge (no right margin)
  const cols = 4;
  const rows = Math.ceil(count / cols);
  let photoIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (photoIndex >= count) break;
      // Pick random size
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      // Compute cell bounds
      const cellW = (areaW - margin) / cols; // only left margin
      const cellH = (areaH - margin * 2) / rows;
      // Jitter within cell for naturalness
      const jitterX = Math.random() * (cellW - size.w);
      const jitterY = Math.random() * (cellH - size.h);
      const left = margin + col * cellW + jitterX;
      const top = margin + row * cellH + jitterY;
      // For rightmost column, allow photo to extend to the very edge
      const adjustedLeft = (col === cols - 1) ? Math.min(left, areaW - size.w) : left;
      // Create image
      const img = document.createElement('img');
      img.src = images[Math.floor(Math.random() * images.length)];
      img.className = 'background-photo';
      img.style.width = size.w + 'px';
      img.style.height = size.h + 'px';
      img.style.left = adjustedLeft + 'px';
      img.style.top = top + 'px';
      const rotate = Math.floor(Math.random() * 40) - 20; // -20 to +20 deg
      img.style.transform = `rotate(${rotate}deg)`;
      img.alt = '';
      container.appendChild(img);
      photoIndex++;
    }
  }
}

window.addEventListener('DOMContentLoaded', createScatteredBackgroundPhotos);
window.addEventListener('resize', createScatteredBackgroundPhotos);

// --- Navigation Active State ---
function setupNavigationActiveState() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    // Remove any existing active class
    link.classList.remove('active');
    
    // Check if this link matches the current page
    if (currentPage === 'stories.html' && link.getAttribute('href') === 'stories.html') {
      link.classList.add('active');
    } else if (currentPage === 'index.html' || currentPage === '') {
      // For index page, highlight Home link
      if (link.getAttribute('href') === '#home' || link.getAttribute('href') === 'index.html#home') {
        link.classList.add('active');
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', setupNavigationActiveState);

// --- Dynamic Carousel Update Function ---
// This function is called by the Google Drive integration to update carousel with new data
window.updateCarouselWithData = function(newStories) {
    if (!newStories || !Array.isArray(newStories) || newStories.length === 0) {
        console.log('No valid stories data received');
        return;
    }

    console.log('Updating carousel with', newStories.length, 'stories from Google Drive');

    // Store stories in global variable for setupCarousel to use
    window.carouselStories = newStories;

    // Reinitialize the carousel with new data
    setupCarousel();
};

// Export for use in other scripts
window.createScatteredBackgroundPhotos = createScatteredBackgroundPhotos;

