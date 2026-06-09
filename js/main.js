/**
 * Personal Website Scripts
 * Author: Haoting (Alexa) Yu
 * Version: 1.0
 */

// Honour the user's OS-level "reduce motion" setting throughout the site.
var PREFERS_REDUCED_MOTION = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Wait for DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
  // Scroll-reveal sections as they near the viewport (native IntersectionObserver).
  initReveal();

  // Initialize Bootstrap Tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Back-to-Top Button Functionality
  initBackToTopButton();

  // Close Navbar Collapse on Link Click (for mobile)
  setupNavbarBehavior();

  // Dark Mode Toggle
  setupDarkModeToggle();

  // Portfolio Projects Carousel Navigation
  setupProjectCarousel();

  // Preview modal (project reports & external sites)
  setupPreviewModal();

  // --- Enhancement layer ---
  initScrollProgress();      // top reading-progress bar
  initScrollSpy();           // highlight the nav item for the section in view
  initPortfolioFilter();     // filter portfolio cards by focus
  initCopyButtons();         // copy email / phone with toast feedback
  initPhotoLightbox();       // full-screen photography viewer
});

/**
 * Scroll-reveal using the native IntersectionObserver — accurate even as
 * lazy-loaded images shift the layout (unlike a cached-offset library), so
 * sections never reveal late. Falls back to fully-visible when IntersectionObserver
 * or reduced-motion isn't available; the <noscript> head rule covers JS-off.
 */
function initReveal() {
  // We're handling the reveal — cancel the head safety-net timer.
  if (window.__revealSafety) { clearTimeout(window.__revealSafety); window.__revealSafety = null; }

  var els = Array.prototype.slice.call(document.querySelectorAll('[data-aos]'));
  if (!els.length) return;
  if (PREFERS_REDUCED_MOTION || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-revealed'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    });
    // Positive bottom margin reveals each section a little BEFORE it scrolls
    // into view, so content is never blank when you reach it.
  }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });

  var vh = window.innerHeight || document.documentElement.clientHeight;
  els.forEach(function (el) {
    // Reveal anything already in view synchronously (no first-paint flash);
    // observe the rest to fade in as they scroll near the viewport.
    if (el.getBoundingClientRect().top < vh) {
      el.classList.add('is-revealed');
    } else {
      io.observe(el);
    }
  });
}

/**
 * Initializes back-to-top button behavior
 */
function initBackToTopButton() {
  const backToTopButton = document.getElementById('backToTop');
  let ticking = false;

  // Show/hide button based on scroll position (rAF-throttled to avoid layout thrash)
  function update() {
    ticking = false;
    // Class-based reveal so the button can fade in/out (see #backToTop CSS).
    backToTopButton.classList.toggle('is-visible', window.pageYOffset > 300);
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  // Smooth scroll to top when clicked
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Sets up navbar behavior for mobile responsiveness
 */
function setupNavbarBehavior() {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.getElementById('navbarNav');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Only collapse when the hamburger menu is actually open (mobile). Testing
      // computed display was TRUE on desktop too (navbar-expand-lg pins it flex),
      // which double-instanced Collapse and could flicker the desktop bar.
      if (navbarCollapse.classList.contains('show')) {
        var inst = bootstrap.Collapse.getInstance(navbarCollapse)
          || new bootstrap.Collapse(navbarCollapse, { toggle: false });
        inst.hide();
      }
    });
  });
}

/**
 * Sets up dark mode toggle functionality
 */
function setupDarkModeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

  // Keep the browser UI colour (address bar / status bar) in sync with the theme.
  function setThemeColorMeta(isDark) {
    var meta = document.getElementById('theme-color-meta');
    if (meta) meta.setAttribute('content', isDark ? '#121212' : '#faf7f3');
  }

  // Apply a theme everywhere. Skill-pill colours are handled purely by the
  // [data-theme="dark"] CSS rules — no fragile inline-style bookkeeping needed.
  function applyTheme(theme, persist) {
    var isDark = theme === 'dark';
    document.body.setAttribute('data-theme', theme);
    themeToggle.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    setThemeColorMeta(isDark);
    if (persist) localStorage.setItem('theme', theme);
  }

  // Resolve the starting theme: an explicit choice wins; otherwise fall back to
  // whatever the anti-FOUC head script already applied (which respects the OS).
  var resolved = currentTheme || document.body.getAttribute('data-theme') || 'light';
  applyTheme(resolved, false);

  // Toggle theme on click (this becomes an explicit, persisted choice).
  function toggleTheme() {
    var next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  }
  themeToggle.addEventListener('click', toggleTheme);
  // The toggle is a role="button" span — make it keyboard-operable (Enter / Space).
  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      toggleTheme();
    }
  });

  // If the visitor hasn't made an explicit choice, follow live OS theme changes.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function (e) {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light', false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }
}

/**
 * Sets up project carousel navigation
 */
function setupProjectCarousel() {
  const portfolioLeftBtn = document.getElementById('portfolioLeftBtn');
  const portfolioRightBtn = document.getElementById('portfolioRightBtn');
  const portfolioCarousel = document.getElementById('portfolioCarousel');
  
  if (portfolioLeftBtn && portfolioRightBtn && portfolioCarousel) {
    portfolioLeftBtn.addEventListener('click', () => scrollCarousel(portfolioCarousel, 'left'));
    portfolioRightBtn.addEventListener('click', () => scrollCarousel(portfolioCarousel, 'right'));

    // Disable the arrows at the scroll extremes and toggle the edge "more →" fade.
    let ticking = false;
    function updateArrows() {
      ticking = false;
      var max = portfolioCarousel.scrollWidth - portfolioCarousel.clientWidth;
      var x = portfolioCarousel.scrollLeft;
      portfolioLeftBtn.disabled = x <= 1;
      portfolioRightBtn.disabled = x >= max - 1;
      var container = portfolioCarousel.parentElement;
      container.classList.toggle('at-start', x <= 1);
      container.classList.toggle('at-end', x >= max - 1);
    }
    portfolioCarousel.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateArrows); }
    }, { passive: true });
    window.addEventListener('resize', updateArrows);
    // Re-evaluate after the portfolio filter reflows the visible cards.
    portfolioCarousel.addEventListener('cards:filtered', updateArrows);
    updateArrows();

    // Keyboard support: the region is focusable (role="region" tabindex="0");
    // Arrow keys page through the cards.
    portfolioCarousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollCarousel(portfolioCarousel, 'right'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); scrollCarousel(portfolioCarousel, 'left'); }
    });

    setupCarouselTouchSupport(portfolioCarousel);
  }
}

/**
 * Scrolls carousel in the specified direction
 * @param {HTMLElement} carousel - The carousel element to scroll
 * @param {string} direction - Direction to scroll ('left' or 'right')
 */
function scrollCarousel(carousel, direction) {
  const refCard = carousel.querySelector('.project-card:not(.is-hidden)') || carousel.querySelector('.project-card');
  const cardWidth = refCard ? refCard.offsetWidth : 0;
  const scrollAmount = direction === 'left' ? -cardWidth - 16 : cardWidth + 16;
  carousel.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}

/**
 * Sets up touch support for carousels on mobile devices
 * @param {HTMLElement} carousel - The carousel element
 */
function setupCarouselTouchSupport(carousel) {
  let touchStartX = 0;
  let touchEndX = 0;
  
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(carousel);
  }, { passive: true });
  
  function handleSwipe(carousel) {
    const swipeDistance = touchEndX - touchStartX;
    const threshold = 50; // Minimum swipe distance
    
    if (swipeDistance > threshold) {
      // Swiped right
      scrollCarousel(carousel, 'left');
    } else if (swipeDistance < -threshold) {
      // Swiped left
      scrollCarousel(carousel, 'right');
    }
  }
}

/**
 * Sets up preview modal for online profiles
 */
function setupPreviewModal() {
  var previewModalEl = document.getElementById('previewModal');
  
  // Set iframe src when modal is shown
  previewModalEl.addEventListener('show.bs.modal', function (event) {
    var button = event.relatedTarget;
    var url = button.getAttribute('data-url');
    var title = button.getAttribute('data-title');
    var offset = button.getAttribute('data-offset') || 0;
    var modalTitle = previewModalEl.querySelector('.modal-title');
    
    modalTitle.textContent = title;
    
    var modalBody = previewModalEl.querySelector('.modal-body');
    // Clear previous content
    modalBody.innerHTML = '';

    if (url.trim().toLowerCase().endsWith('.md')) {
      // Fetch and convert markdown to HTML
      fetch(url)
        .then(response => response.text())
        .then(md => {
          var htmlContent = marked.parse(md);
          // Wrap the converted HTML in an article element using the local GitHub markdown CSS
          modalBody.innerHTML = '<article id="markdownContent" class="markdown-body markdown-preview">' + htmlContent + '</article>';
          // If offset is provided, scroll the div
          if (offset > 0) {
            document.getElementById('markdownContent').scrollTop = parseInt(offset);
          }
        })
        .catch(err => {
          modalBody.innerHTML = '<p>Error loading content.</p>';
          console.error('Error loading markdown:', err);
        });
    } else if (/wixsite\.com/i.test(url)) {
      // Wix sends X-Frame-Options, so an iframe preview renders blank — show a
      // graceful "open in new tab" card instead of a broken empty frame.
      modalBody.innerHTML =
        '<div class="preview-fallback">' +
          '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>' +
          '<p>This site is best viewed in its own tab.</p>' +
          '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary">' +
            'Open ' + (title || 'site') + ' <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>' +
        '</div>';
    } else {
      // Load via iframe for other embeddable content (height handled by CSS).
      var previewFrame = document.createElement('iframe');
      previewFrame.id = 'previewFrame';
      previewFrame.title = title || 'Preview';
      previewFrame.src = url;
      previewFrame.width = '100%';
      previewFrame.style.border = 'none';
      previewFrame.onload = function() {
        try {
          if (offset > 0) previewFrame.contentWindow.scrollTo(0, parseInt(offset));
        } catch (e) { /* cross-origin scroll blocked — ignore */ }
      };
      modalBody.appendChild(previewFrame);
    }
  });
  
  // Clear iframe src when modal is hidden
  previewModalEl.addEventListener('hidden.bs.modal', function () {
    // Clear modal body content to stop any continuing processes
    var modalBody = previewModalEl.querySelector('.modal-body');
    modalBody.innerHTML = '';
  });
}

/* ==================================================================
   ENHANCEMENT LAYER
   ================================================================== */

/**
 * Thin reading-progress bar that fills as the page is scrolled.
 * Uses requestAnimationFrame to avoid layout thrash on scroll.
 */
function initScrollProgress() {
  var bar = document.getElementById('scrollProgressBar');
  if (!bar) return;
  var ticking = false;
  function update() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/**
 * Scroll-spy: highlights the navbar link whose section is currently in view,
 * and exposes it to assistive tech via aria-current.
 */
function initScrollSpy() {
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.navbar-nav .nav-link[href^="#"]')
  );
  if (!links.length) return;

  // Find the nav link that owns a given <section> (its href targets an id inside it).
  function linkForSection(section) {
    for (var i = 0; i < links.length; i++) {
      var target = document.getElementById(links[i].getAttribute('href').slice(1));
      if (target && target.closest('section') === section) return links[i];
    }
    return null;
  }
  // Track EVERY scrollable section (in document order), each paired with its nav link
  // or null. Including the unlinked hero section (which has no nav entry) stops the
  // spy from mis-attributing it to the previous linked section.
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section[id]'))
    .map(function (s) { return { section: s, link: linkForSection(s) }; });
  if (!sections.length) return;

  var navbar = document.querySelector('.navbar');
  var ticking = false;

  function update() {
    ticking = false;
    var pos = window.scrollY + (navbar ? navbar.offsetHeight : 70) + 40;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].section.getBoundingClientRect().top + window.scrollY <= pos) current = sections[i];
    }
    // At the very bottom, snap to the last section that actually has a nav link.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      for (var j = sections.length - 1; j >= 0; j--) { if (sections[j].link) { current = sections[j]; break; } }
    }
    // Highlight the current section's link; if the current section is unlinked
    // (Profiles/Resume), no link is marked active rather than a stale one.
    links.forEach(function (l) {
      var on = !!(current && current.link === l);
      l.classList.toggle('active', on);
      if (on) { l.setAttribute('aria-current', 'page'); }
      else { l.removeAttribute('aria-current'); }
    });
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/**
 * Filters portfolio cards by focus area. A chip matches a card when any of the
 * chip's tokens appears in the card's data-tags (space-separated).
 */
function initPortfolioFilter() {
  var bar = document.getElementById('portfolioFilters');
  var carousel = document.getElementById('portfolioCarousel');
  if (!bar || !carousel) return;

  var chips = Array.prototype.slice.call(bar.querySelectorAll('.filter-chip'));
  var cards = Array.prototype.slice.call(carousel.querySelectorAll('.project-card'));

  // These are toggle buttons in a group — express selected state via aria-pressed.
  chips.forEach(function (c) {
    c.setAttribute('aria-pressed', c.classList.contains('is-active') ? 'true' : 'false');
  });

  bar.addEventListener('click', function (e) {
    var chip = e.target.closest('.filter-chip');
    if (!chip) return;

    chips.forEach(function (c) {
      var on = c === chip;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    var filter = chip.getAttribute('data-filter');
    var tokens = filter.split(' ');
    cards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '').split(' ');
      var show = filter === 'all' || tokens.some(function (t) { return tags.indexOf(t) !== -1; });
      card.classList.toggle('is-hidden', !show);
    });

    // Reset scroll so freshly-filtered cards start from the left.
    carousel.scrollTo({ left: 0, behavior: PREFERS_REDUCED_MOTION ? 'auto' : 'smooth' });
  });
}

/**
 * Copy-to-clipboard for contact details, with a transient toast + button state.
 */
function initCopyButtons() {
  var toast = document.getElementById('copyToast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 1800);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) { /* clipboard unavailable — fail silently */ }
  }

  document.querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var icon = btn.querySelector('i');
      var prevIcon = icon ? icon.className : null;

      function onCopied() {
        btn.classList.add('is-copied');
        if (icon) icon.className = 'fas fa-check';
        showToast('Copied ' + text);
        setTimeout(function () {
          btn.classList.remove('is-copied');
          if (icon && prevIcon) icon.className = prevIcon;
        }, 1500);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onCopied).catch(function () {
          fallbackCopy(text);
          onCopied();
        });
      } else {
        fallbackCopy(text);
        onCopied();
      }
    });
  });
}

/**
 * Minimal, accessible full-screen lightbox shared by every gallery on the page.
 * Each `.lb-gallery` is an independent set of `.lb-item` figures (the artwork
 * strip and the photography wall are separate galleries, so they navigate on
 * their own). Supports ← → navigation, Esc / backdrop-click to close, focus
 * restoration, neighbour preloading, and body scroll-lock. No dependencies.
 */
function initPhotoLightbox() {
  var box = document.getElementById('lightbox');
  var galleries = Array.prototype.slice.call(document.querySelectorAll('.lb-gallery'));
  if (!box || !galleries.length) return;

  var imgEl = document.getElementById('lightboxImg');
  var capEl = document.getElementById('lightboxCap');
  var countEl = document.getElementById('lightboxCount');
  var btnClose = box.querySelector('.lightbox__close');
  var btnPrev = box.querySelector('.lightbox__prev');
  var btnNext = box.querySelector('.lightbox__next');
  var items = [];          // the currently-open gallery's items
  var current = 0;
  var lastFocused = null;

  function show(i) {
    current = (i + items.length) % items.length;
    var it = items[current];
    imgEl.src = it.full;
    imgEl.alt = it.alt;
    capEl.textContent = it.caption;
    countEl.textContent = (current + 1) + ' / ' + items.length;
    // Preload the neighbours so arrow navigation feels instant.
    [current + 1, current - 1].forEach(function (n) {
      var pre = new Image();
      pre.src = items[(n + items.length) % items.length].full;
    });
  }

  function open(galleryItems, i) {
    items = galleryItems;
    lastFocused = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    box.hidden = true;
    document.body.style.overflow = '';
    imgEl.removeAttribute('src');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  galleries.forEach(function (gallery) {
    var figures = Array.prototype.slice.call(gallery.querySelectorAll('.lb-item'));
    var galleryItems = figures.map(function (fig) {
      var img = fig.querySelector('img');
      return {
        full: fig.getAttribute('data-full'),
        caption: fig.getAttribute('data-caption') || '',
        alt: img ? img.getAttribute('alt') : ''
      };
    });
    figures.forEach(function (fig, i) {
      var btn = fig.querySelector('.photo-btn');
      if (btn) btn.addEventListener('click', function () { open(galleryItems, i); });
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', function () { show(current - 1); });
  btnNext.addEventListener('click', function () { show(current + 1); });

  // Click on the backdrop or the stage padding (not the image) closes.
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('lightbox__stage')) close();
  });

  // Keyboard: Esc closes, arrows navigate, Tab is kept within the controls.
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    else if (e.key === 'Tab') {
      var f = [btnClose, btnPrev, btnNext];
      if (f.indexOf(document.activeElement) === -1) { e.preventDefault(); btnClose.focus(); }
    }
  });
} 