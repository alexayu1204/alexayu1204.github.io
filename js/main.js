/**
 * Personal Website Scripts
 * Author: Haoting (Alexa) Yu
 * Version: 1.0
 */

// Wait for DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS (Animate on Scroll)
  AOS.init({
    duration: 700,
    easing: 'ease-in-out',
    once: true
  });

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

  // Preview Modal for Online Profiles
  setupPreviewModal();

  // Handle device orientation change for better mobile experience
  window.addEventListener('orientationchange', function() {
    // Force AOS refresh
    setTimeout(function() {
      AOS.refresh();
    }, 300);
  });
});

/**
 * Initializes back-to-top button behavior
 */
function initBackToTopButton() {
  const backToTopButton = document.getElementById('backToTop');
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    backToTopButton.style.display = window.pageYOffset > 300 ? 'block' : 'none';
  });
  
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
      if (window.getComputedStyle(navbarCollapse).display !== 'none') {
        new bootstrap.Collapse(navbarCollapse).toggle();
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
  
  // Function to update skills items in dark mode
  function updateSkillsStyles(isDark) {
    const skillItems = document.querySelectorAll('.skills ul li');
    skillItems.forEach(item => {
      if (isDark) {
        item.style.backgroundColor = '#2c2c2c';
        item.style.color = '#e0e0e0';
        item.style.border = '1px solid #3d3d3d';
      } else {
        item.style.backgroundColor = '';
        item.style.color = '';
        item.style.border = '';
      }
    });
  }
  
  // Create or update dark mode override stylesheet
  function updateDarkModeStyles(isDark) {
    let styleElement = document.getElementById('dark-mode-skills-override');
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dark-mode-skills-override';
      document.head.appendChild(styleElement);
    }
    
    if (isDark) {
      styleElement.textContent = `
        [data-theme="dark"] .skills ul li {
          background-color: #2c2c2c !important;
          background: #2c2c2c !important;
          color: #e0e0e0 !important;
          border: 1px solid #3d3d3d !important;
        }
        [data-theme="dark"] .skills ul li:hover {
          background: var(--primary-color) !important;
          color: #fff !important;
        }
      `;
    } else {
      styleElement.textContent = '';
    }
  }
  
  // Set initial theme based on localStorage
  if (currentTheme) {
    document.body.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      updateSkillsStyles(true);
      updateDarkModeStyles(true);
    }
  }
  
  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    let theme = document.body.getAttribute('data-theme');
    if (theme === 'light') {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      updateSkillsStyles(true);
      updateDarkModeStyles(true);
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      updateSkillsStyles(false);
      updateDarkModeStyles(false);
    }
  });
}

/**
 * Sets up project carousel navigation
 */
function setupProjectCarousel() {
  const portfolioLeftBtn = document.getElementById('portfolioLeftBtn');
  const portfolioRightBtn = document.getElementById('portfolioRightBtn');
  const portfolioCarousel = document.getElementById('portfolioCarousel');
  
  if (portfolioLeftBtn && portfolioRightBtn && portfolioCarousel) {
    // Add click event listeners for navigation buttons
    portfolioLeftBtn.addEventListener('click', () => scrollCarousel(portfolioCarousel, 'left'));
    portfolioRightBtn.addEventListener('click', () => scrollCarousel(portfolioCarousel, 'right'));
    
    // Add touch swipe support for mobile
    setupCarouselTouchSupport(portfolioCarousel);
  }
}

/**
 * Scrolls carousel in the specified direction
 * @param {HTMLElement} carousel - The carousel element to scroll
 * @param {string} direction - Direction to scroll ('left' or 'right')
 */
function scrollCarousel(carousel, direction) {
  const cardWidth = carousel.querySelector('.project-card').offsetWidth;
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
          modalBody.innerHTML = '<article id="markdownContent" class="markdown-body" style="overflow:auto; max-height:600px; padding: 1rem; border-radius: 4px; background: #ffffff;">' + htmlContent + '</article>';
          // If offset is provided, scroll the div
          if (offset > 0) {
            document.getElementById('markdownContent').scrollTop = parseInt(offset);
          }
        })
        .catch(err => {
          modalBody.innerHTML = '<p>Error loading content.</p>';
          console.error('Error loading markdown:', err);
        });
    } else {
      // Fallback: load via iframe for non-markdown content
      var previewFrame = document.createElement('iframe');
      previewFrame.id = 'previewFrame';
      previewFrame.src = url;
      previewFrame.width = '100%';
      previewFrame.height = '600px';
      previewFrame.style.border = 'none';
      
      // Add load event to handle scrolling to offset
      previewFrame.onload = function() {
        try {
          if (offset > 0) {
            previewFrame.contentWindow.scrollTo(0, parseInt(offset));
          }
        } catch (e) {
          // Handle cross-origin policy issues silently
          console.log("Could not scroll iframe due to cross-origin policy");
        }
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