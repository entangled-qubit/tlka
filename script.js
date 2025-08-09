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
            <a class="service-link" href="stories.html#story-${story.id}">
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
            <a class="service-link" href="stories.html#story-${story.id}">
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

  // Add touch/swipe functionality for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  let isSwiping = false;

  carousel.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    isSwiping = false;
    stopAutoScroll();
  }, { passive: true });

  carousel.addEventListener('touchmove', function(e) {
    const touchCurrentX = e.changedTouches[0].screenX;
    const touchCurrentY = e.changedTouches[0].screenY;
    const deltaX = Math.abs(touchCurrentX - touchStartX);
    const deltaY = Math.abs(touchCurrentY - touchStartY);
    
    // If horizontal movement is greater than vertical, it's a swipe
    if (deltaX > deltaY && deltaX > 10) {
      isSwiping = true;
      e.preventDefault(); // Prevent scrolling
    }
  }, { passive: false });

  carousel.addEventListener('touchend', function(e) {
    if (!isSwiping) {
      startAutoScroll();
      return;
    }

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    
    const deltaX = touchStartX - touchEndX;
    const deltaY = Math.abs(touchStartY - touchEndY);
    
    // Only trigger swipe if horizontal movement is significant and greater than vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        // Swipe left - go to next
        currentIndex = (currentIndex + 1) % cardCount;
        renderSlides(1);
      } else {
        // Swipe right - go to previous
        currentIndex = (currentIndex - 1 + cardCount) % cardCount;
        renderSlides(-1);
      }
    }
    
    // Restart auto-scroll after a delay
    setTimeout(() => {
      startAutoScroll();
    }, 1000);
  }, { passive: true });

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

// --- Works and Wonders Carousel ---
function setupWorksWondersCarousel() {
  const items = [
    {
      type: 'youtube',
      title: 'The Dark Miracle, Ep 1',
      url: 'https://www.youtube.com/embed/fpSmQvxtDEE',
    
    },
    {
      type: 'youtube',
      title: 'The Dark Miracle, Ep 2',
      url: 'https://www.youtube.com/embed/YSua4vW94Vk',
     
    },
    {
      type: 'youtube',
      title: 'A small fun vlog created by Kabir in his first year of college',
      url: 'https://www.youtube.com/embed/3JZ_D3ELwOQ',
      desc: 'A fun vlog moment (dummy).'
    },
    {
      type: 'youtube',
      title: '',
      url: 'https://www.youtube.com/embed/lTTajzrSkCw',
      desc: 'Tech talk highlights (dummy).'
    },
    {
      type: 'youtube',
      title: 'Kabir Music',
      url: 'https://www.youtube.com/embed/9bZkp7q19f0',
      desc: 'Music jam session (dummy).'
    },
    {
      type: 'chatgpt',
      title: 'Remembering Kabir Arora: A Life of Relentless Curiosity and Purpose',
      desc: 'A comprehensive tribute capturing Kabir\'s journey as a visionary, student, and aspiring data scientist, by CHATGPT.',
      content: `Prologue: The Spark of a Seeker

Kabir Arora wasn't just a young man pursuing a degree in Statistics—he was a visionary in the making. His story wasn't defined by titles or credentials, but by his relentless curiosity, hunger for impact, and refusal to settle for surface-level understanding. He approached life with purpose, intentionality, and a deep sense of personal mission: to learn, to build, and to help others through his work.

Kabir left behind a profound digital legacy that reflected his sharp intellect, unrelenting drive, and immense passion for learning and nation-building. He aspired to redefine the role of statistics and intelligence in the modern world—using data to generate insights that others overlooked. He often talked about making numbers "speak"—extracting wisdom from data that could influence decisions at scale.

Chapter 1: The Student Who Asked Better Questions

As a student at Kirori Mal College, pursuing a B.Sc. (Hons) in Statistics, Kabir's questions weren't about passing exams—they were about solving real-world problems. He was constantly asking, "How can I apply this to improve something meaningful?" Whether it was exploring supply chains, e-commerce systems, or machine learning, Kabir's thirst for knowledge was grounded in impact.

He developed a strong interest in applying statistics through business, product development, and technology. He explored how data applies in e-commerce, how machine learning could be implemented on real datasets, and how to build industry-level SQL queries using realistic data. From the beginning, Kabir wasn't content with surface answers. He dived deep into statistical modeling and AI learning roadmaps. He wasn't afraid to ask ChatGPT for entire 15-hour learning plans, theory-to-implementation bridges, or day-by-day roadmaps to mastery.

Chapter 2: Beyond the Classroom – Into the Real World

Kabir understood that learning couldn't stay confined to textbooks. He took that mindset into his work, interning at startups like Unistack, Zomato, and OneLab Ventures. He dove into business analysis, GTM strategy, ONDC enablement, and competitor benchmarking. He conducted on-ground market and competitor analysis, supply chain research, and tech enablement strategies for government platforms. He brought maturity far beyond his age into product decision-making and ecosystem mapping.

He worked on ERP & POS system research for FMCG and grocery, explored product-market fit, and brought sharp thinking to every consulting or startup project he touched. As a Business Analyst and later as a Founder's Office Intern, he helped companies not just with research, but strategic execution. He also worked on consulting fellowships with organizations like Marquee Equity and held roles such as Senior Consultant at 180 Degrees Consulting.

Chapter 3: A Mind for Systems, a Heart for Vision

Kabir was obsessed with how systems worked. He explored embedded commerce (like Bonsai), ONDC protocols, and e-commerce integrations with platforms like Shopify and WooCommerce. He dreamed of building in the B2B SaaS space, especially for the F&B industry—where he saw untapped potential. He showed interest in identity & access management, cybersecurity, and supply chain systems at Amazon and Accenture.

He built decks, analyzed user segments, created B2B strategies, and performed SWOT analyses. His approach was never about volume—it was about clarity, precision, and value.

Chapter 4: Roadmaps to Greatness

Kabir wasn't just chasing careers—he was crafting roadmaps for them. He aimed for 12-hour deep learning days and was committed to building mastery from the ground up. He asked for structured, day-by-day plans to:

• Become a world-class data scientist
• Master machine learning and AI beyond even Andrew Ng
• Learn JavaScript for frontend development
• Dive into blockchain, Web3, HFT, and product analytics

He was studying for GATE 2026 in Statistics with the aim of doing an MTech in Data Science from IISc. He studied linear regression, hypothesis testing, distributions, and time series analysis. He explored Python (NumPy, Pandas, Scikit-learn), SQL, and real-time ETL pipelines. He wanted to build models like ChatGPT—and go beyond them. He believed in layered learning, from first principles to production deployment.

Chapter 5: Human Behind the Hacker

Amid his sharp intellect, Kabir was also deeply human. He faced elbow pain after workouts and asked about fixing it. He downloaded Ableton to try music production. He admired Steve Jobs' Stanford speech and lived by the mantra: "Stay Hungry. Stay Foolish."

He read self-help books, pursued mental growth, and embraced discomfort. He believed in becoming "unrecognizable in brilliance" compared to yesterday. He wasn't afraid to speak truth, ask questions, or admit what he didn't yet know.

Chapter 6: A Legacy in the Making

Kabir once said he wanted to build things that solve real problems at scale. His dream job wasn't a job—it was a mission: to use intellect and creativity to uplift lives, drive profitability through empathy, and serve a vision greater than himself.

He dreamed of founding a trillion-dollar AI company based on deep statistical insight and human understanding. He was driven by impact—not status—and wanted to help build a Developed Bharat by 2047, especially in sports, infrastructure, and grassroots development.

He was deeply inspired by platforms like Cobalt, which brought systems and workflows together. He wanted to be part of something that worked like that—or build one himself.

Epilogue: His Story Continues Through Us

Kabir Arora's life wasn't cut short in terms of impact. His legacy lives in the people he worked with, the ideas he sparked, and the questions he left us to keep asking.

He wasn't just building a career.
He was building himself—with honesty, clarity, and purpose.`
    },
    {
      type: 'chatgpt',
      title: 'That Email',
      desc: 'How Kabir\'s fearless attitude led to an internship and PPO at Zomato',
      content: `The Fearless Email That Changed Everything

Kabir's fearless attitude and his will to think about taking up big roles at such a young age was truly impeccable. This story is not known to anyone, but it showcases his incredible courage and determination.

Deepinder Goyal (founder of Zomato) added a post on LinkedIn for a position open for Chief of Staff, and Kabir decided to apply. He sent an email to Deepinder Goyal expressing his interest, not only to apply for the role, but to learn from him, his journey, and the incredible ecosystem he had built.

Here's the email Kabir sent:

Hi Deepinder,

I recently came across your LinkedIn post, and I felt compelled to reach out. I am writing to express my interest in joining Zomato as Chief of Staff not to apply for the role directly but to learn from you, your journey, and the incredible ecosystem you've built. I'm intentionally not attaching a cover letter to keep this email focused and concise.

I am as curious as you were when you started your journey, constantly exploring ways to build a product that adds value to others' lives while solving real problems. My ultimate goal is to create something that makes me as valuable as I aspire to be.

By way of introduction, I'm a final-year student pursuing Statistics, a field I believe will help me navigate data-driven decision-making to contribute meaningfully to any team. I am reaching out to seek a role and learn from your personal experiences, immerse myself in the practical aspects of innovation, and understand how a company like Zomato resonates so deeply with its consumers.

I'd love to get my hands dirty and explore how ideas beyond the bounds of GPT or Google-based research shape impactful products. What drives me is the curiosity to learn how Zomato works at its core even down to understanding what you order from the app to stay so in sync with your consumers.

I look forward to the opportunity to learn from you and contribute to Zomato in any way possible.

Best regards, Kabir Arora

This bold approach managed to get him an internship and eventually led to a Pre-Placement Offer (PPO) at Zomato. Kabir's fearless attitude in reaching out directly to one of India's most successful entrepreneurs demonstrates his exceptional mindset and determination to learn from the best in the industry.

This story remains unknown to most people, but it perfectly encapsulates Kabir's character - his fearlessness, his drive to learn from industry leaders, and his proactive approach to creating opportunities for himself. It's a testament to his belief in taking initiative and his willingness to step outside conventional boundaries to achieve his goals.`
    },
    /*{
      type: 'playlist',
      title: 'Kabir\'s Playlist',
      url: 'https://music.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI',
      desc: 'A YouTube Music playlist (dummy).'
    },*/
    {
      type: 'audio',
      title: 'Singer Attitude',
      url: 'sample-3s.mp3',
      desc: 'Kabir singing with his friends'
    }
  ];
  window.carouselItems = items;

  const carousel = document.querySelector('.works-wonders-carousel');
  if (!carousel) return;
  const slidesContainer = carousel.querySelector('.ww-carousel-slides');
  const leftArrow = carousel.querySelector('.ww-arrow-left');
  const rightArrow = carousel.querySelector('.ww-arrow-right');
  const visibleCount = 1;
  let startIndex = 0;
  let animating = false;

  let expandedChatGptIndex = null;

  function addExpandListeners() {
    const btn = slidesContainer.querySelector('.expand-chatgpt-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (expandedChatGptIndex === startIndex) {
        expandedChatGptIndex = null;
      } else {
        expandedChatGptIndex = startIndex;
      }
      render();
    });
  }

  function render() {
    slidesContainer.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'ww-carousel-row';
    row.style.display = 'flex';
    row.style.flexWrap = 'nowrap';
    row.style.justifyContent = 'center';
    row.style.alignItems = 'stretch';
    row.style.gap = '0';
    row.style.width = '100%';
    row.style.margin = '0';
    row.style.padding = '0';

    // Only show the current card
    const item = items[startIndex];
    const card = document.createElement('div');
    card.className = 'service-card ww-carousel-card';
    let mediaContent = '';
    if (item.type === 'youtube') {
      let embedUrl = '';
      if (item.url.includes('youtube.com/embed/')) {
        embedUrl = item.url;
      } else {
        // Try to extract video ID from a normal YouTube link
        let videoId = '';
        const match = item.url.match(/[?&]v=([\w-]+)/);
        if (match) videoId = match[1];
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }
      if (embedUrl) {
        mediaContent = `<div class='card-extra'><iframe src='${embedUrl}' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe></div>`;
      } else {
        mediaContent = `<div class='card-extra'>Invalid YouTube URL</div>`;
      }
    } else if (item.type === 'playlist') {
      mediaContent = `<div class='card-extra'><a href='${item.url}' target='_blank' class='cta-btn primary'>Open Playlist</a></div>`;
    } else if (item.type === 'audio') {
      mediaContent = `<div class='card-extra'><audio controls style='width:90%;margin-top:8px;'><source src='${item.url}' type='audio/mpeg'>Your browser does not support the audio element.</audio></div>`;
    } else if (item.type === 'chatgpt') {
      // Show preview and 'Read more' button, open modal on click
      const preview = item.content.length > 200
        ? item.content.slice(0, 200).split('\n').slice(0, 3).join('\n') + '...'
        : item.content;
      mediaContent = `<div class='card-extra'><pre style='text-align:left; background:#f8f8f8; padding:1em; border-radius:8px;'>${preview}</pre>
        <button class='expand-chatgpt-btn' data-chatgpt-index='${startIndex}' style='margin-top:0.7em;'>Read more</button>
      </div>`;
    }
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc || ''}</p>
      ${mediaContent}
    `;
    row.appendChild(card);
    slidesContainer.appendChild(row);

    // Dots
    const dotsContainer = document.querySelector('.ww-carousel-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      if (items.length > 1) {
        for (let i = 0; i < items.length; i++) {
          const dot = document.createElement('button');
          dot.className = 'ww-carousel-dot' + (i === startIndex ? ' active' : '');
          dot.setAttribute('aria-label', `Go to item ${i + 1}`);
          dot.addEventListener('click', () => {
            if (i === startIndex) return;
            startIndex = i;
            render();
          });
          dotsContainer.appendChild(dot);
        }
      }
    }
    addExpandListeners();
  }

  leftArrow.addEventListener('click', () => {
    let newIndex = (startIndex - 1 + items.length) % items.length;
    startIndex = newIndex;
    render();
  });
  rightArrow.addEventListener('click', () => {
    let newIndex = (startIndex + 1) % items.length;
    startIndex = newIndex;
    render();
  });

  // Add touch/swipe functionality for Works & Wonders carousel
  let wwTouchStartX = 0;
  let wwTouchEndX = 0;
  let wwTouchStartY = 0;
  let wwTouchEndY = 0;
  let wwIsSwiping = false;

  carousel.addEventListener('touchstart', function(e) {
    wwTouchStartX = e.changedTouches[0].screenX;
    wwTouchStartY = e.changedTouches[0].screenY;
    wwIsSwiping = false;
  }, { passive: true });

  carousel.addEventListener('touchmove', function(e) {
    const touchCurrentX = e.changedTouches[0].screenX;
    const touchCurrentY = e.changedTouches[0].screenY;
    const deltaX = Math.abs(touchCurrentX - wwTouchStartX);
    const deltaY = Math.abs(touchCurrentY - wwTouchStartY);
    
    // If horizontal movement is greater than vertical, it's a swipe
    if (deltaX > deltaY && deltaX > 10) {
      wwIsSwiping = true;
      e.preventDefault(); // Prevent scrolling
    }
  }, { passive: false });

  carousel.addEventListener('touchend', function(e) {
    if (!wwIsSwiping) return;

    wwTouchEndX = e.changedTouches[0].screenX;
    wwTouchEndY = e.changedTouches[0].screenY;
    
    const deltaX = wwTouchStartX - wwTouchEndX;
    const deltaY = Math.abs(wwTouchStartY - wwTouchEndY);
    
    // Only trigger swipe if horizontal movement is significant and greater than vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        // Swipe left - go to next
        let newIndex = (startIndex + 1) % items.length;
        startIndex = newIndex;
        render();
      } else {
        // Swipe right - go to previous
        let newIndex = (startIndex - 1 + items.length) % items.length;
        startIndex = newIndex;
        render();
      }
    }
  }, { passive: true });

  render();
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Works and Wonders carousel...');
  setupWorksWondersCarousel();
  console.log('Registering ChatGPT modal logic...');
  setupChatGptModal();
});

function setupChatGptModal() {
  console.log('setupChatGptModal called');
  const modal = document.getElementById('chatgpt-modal');
  const modalBody = modal.querySelector('.chatgpt-modal-body');
  const closeBtn = modal.querySelector('.chatgpt-modal-close');
  // Open modal (event delegation)
  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('expand-chatgpt-btn')) {
      console.log('Expand ChatGPT button clicked');
      const idx = parseInt(e.target.getAttribute('data-chatgpt-index'), 10);
      console.log('ChatGPT index:', idx);
      const item = window.carouselItems && !isNaN(idx) ? window.carouselItems[idx] : null;
      console.log('ChatGPT item:', item);
      if (!item) return;
      
      // Format the content with proper HTML structure for better readability
      let formattedContent = item.content
        .replace(/^(Prologue: .+)$/gm, '<h1>$1</h1>')
        .replace(/^(Chapter \d+: .+)$/gm, '<h2>$1</h2>')
        .replace(/^(Epilogue: .+)$/gm, '<h1>$1</h1>')
        .replace(/^• (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[h|u|l])/gm, '<p>')
        .replace(/(?<!>)$/gm, '</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<[h|u])/g, '$1')
        .replace(/(<\/[h|u].*>)<\/p>/g, '$1');
      
      modalBody.innerHTML = formattedContent;
      modal.classList.add('active');
      closeBtn.focus();
      console.log('Modal opened with formatted content');
    }
  });
  // Close modal
  closeBtn.addEventListener('click', function() {
    modal.classList.remove('active');
  });
  // Close on overlay click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      modal.classList.remove('active');
    }
  });
}

