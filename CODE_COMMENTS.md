# script.js: Full Code Documentation & Comments

---

## Table of Contents
- [Top-Level Event Listeners & Logic](#top-level-event-listeners--logic)
- [Function: updateFadeDuration](#function-updatefadeduration)
- [Function: revealOnScroll](#function-revealonscroll)
- [Function: updateSectionFades](#function-updatesectionfades)
- [Function: setupCarousel](#function-setupcarousel)
  - [Inner Function: renderSlides](#inner-function-renderslides)
  - [Inner Function: updateCarousel](#inner-function-updatecarousel)
  - [Inner Function: goToIndex](#inner-function-gotoindex)
  - [Inner Function: startAutoScroll](#inner-function-startautoscroll)
  - [Inner Function: stopAutoScroll](#inner-function-stopautoscroll)
- [Function: setupHeroSlideshow](#function-setupheroslideshow)
  - [Inner Functions: showSlide, goTo, next, startTimer, stopTimer, restartTimer](#inner-functions-showSlide-goto-next-starttimer-stoptimer-restarttimer)
- [Function: setupHeroPhotoCarousel](#function-setupherophotocarousel)
  - [Inner Functions: showPhoto, nextRandomPhoto, startPhotoTimer, stopPhotoTimer](#inner-functions-showphoto-nextrandomphoto-startphototimer-stopphototimer)
- [Function: createScatteredBackgroundPhotos](#function-createscatteredbackgroundphotos)

---

## Top-Level Event Listeners & Logic

- **Smooth Scroll for Navigation:**
  - Adds click listeners to all `.nav-links a` elements. If the link is an anchor (`#`), it prevents default and smoothly scrolls to the target section.
- **Sticky Header Shadow:**
  - Adds/removes the `scrolled` class to the navbar when the page is scrolled more than 30px.
- **Dynamic Animation Speed:**
  - Listens to scroll events and adjusts the CSS variable `--fade-duration` based on scroll velocity for smooth fade-in animations.
- **Fade-In on Scroll:**
  - Reveals elements with `.fade-in` class when they enter the viewport. Also triggers service cards to become visible when the services section is near the center of the viewport.
- **Contact Form Demo:**
  - Prevents the default form submission and shows an alert instead.
- **Section Fade:**
  - Continuously updates the opacity of sections with `.fade-section` based on their distance from the viewport center.

---

## Function: updateFadeDuration
**Purpose:** Dynamically sets the fade animation duration based on scroll speed for a more natural feel.
**Location:** Lines 30-44

**How it works:**
- Measures scroll velocity and maps it to a duration between 0.2s (fast) and 1.2s (slow).
- Updates the CSS variable `--fade-duration` accordingly.

---

## Function: revealOnScroll
**Purpose:** Reveals elements with the `.fade-in` class as they enter the viewport, and triggers service cards to become visible when the services section is near the center.
**Location:** Lines 50-89

**How it works:**
- For each `.fade-in` element, checks if it's in the viewport and toggles the `visible` class.
- For the services section, checks if it's near the center of the viewport and toggles `visible` on all `.service-card` elements.

---

## Function: updateSectionFades
**Purpose:** Fades sections in/out based on their distance from the viewport center for a dynamic, immersive effect.
**Location:** Lines 90-106

**How it works:**
- For each `.fade-section`, calculates its center and distance from the viewport center.
- Sets the `--section-fade` CSS variable to fade the section (down to 0.6 opacity at the edge).
- Uses `requestAnimationFrame` for smooth, continuous updates.

---

## Function: setupCarousel
**Purpose:** Implements the main stories carousel, including rendering, navigation, auto-scroll, and card expansion/hover logic.
**Location:** Lines 107-411

### Stories Array Structure
- Each story is an object with fields: `title`, `author`, `link`, `short`, `full`, and optionally `audio` or `image`.
- Example:
  ```js
  {
    title: 'Unforgettable Road Trip',
    author: 'Simran Kaur',
    link: 'story3.html',
    short: 'We set out with no plan...'
    full: 'We set out with no plan, but Kabir’s sense of adventure...'
    audio: 'sample-3s.mp3' // Optional
    image: 'tlka.jpg' // Optional
  }
  ```

### Main Logic
- Renders 5 cards at a time (edge, side, center, side, edge) in a circular fashion.
- Handles dot navigation, auto-scroll, and smooth transitions.
- Expands the center card on hover and shows more text/audio/image if present.

#### Inner Function: renderSlides
**Purpose:** Renders the visible carousel cards, animates transitions, and manages the center card's expanded state and text clamping.
**Location:** Lines 211-363
- Animates out old cards, then renders new ones for the current index and its neighbors.
- For the center card, shows the full story, audio/image, and clamps text to a set number of lines (more lines when hovered).
- Uses a binary search to fit as much text as possible in the allowed space, and appends a "Read more" link if truncated.
- Ensures vertical alignment and flex layout for the center card.

#### Inner Function: updateCarousel
**Purpose:** Updates the carousel to a new index, animating the direction and updating dot states.
**Location:** Lines 364-371

#### Inner Function: goToIndex
**Purpose:** Navigates to a specific carousel index.
**Location:** Lines 372-376

#### Inner Function: startAutoScroll
**Purpose:** Starts the auto-scroll timer for the carousel.
**Location:** Lines 377-384

#### Inner Function: stopAutoScroll
**Purpose:** Stops the auto-scroll timer.
**Location:** Lines 385-389

- **Hover Logic:**
  - Adds/removes the `card-hovered` class to the center card on mouseover/mouseout, expanding the card and showing more text/audio/image.

---

## Function: setupHeroSlideshow
**Purpose:** Implements the hero section slideshow with dot navigation and auto-advance.
**Location:** Lines 412-467

### Inner Functions
- **showSlide:** Shows the slide at a given index, updating active classes.
- **goTo:** Navigates to a specific slide and restarts the timer.
- **next:** Advances to the next slide.
- **startTimer/stopTimer/restartTimer:** Manage the auto-advance timer.
- **Pause on Hover:** Pauses the slideshow when the user hovers over the hero section.

---

## Function: setupHeroPhotoCarousel
**Purpose:** Rotates through memorial photos in the hero section, picking a random photo every 5.5 seconds.
**Location:** Lines 468-514

### Inner Functions
- **showPhoto:** Shows the photo at a given index.
- **nextRandomPhoto:** Picks a random photo different from the current one.
- **startPhotoTimer/stopPhotoTimer:** Manage the photo rotation timer.
- **Pause on Hover:** Pauses the photo rotation when the user hovers over the photo area.

---

## Function: createScatteredBackgroundPhotos
**Purpose:** Dynamically places and rotates a grid of faded background photos in the hero section for a decorative effect.
**Location:** Lines 515-575

**How it works:**
- Only runs on desktop (window width >= 900px).
- Randomly places 13-16 images from the set of kabir1.jpg, kabir2.jpg, kabir3.jpg, kabir4.jpg in a grid, with random size, position, and rotation for a natural look.
- Re-runs on window resize for responsiveness.

---

# End of script.js Documentation 