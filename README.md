# Haoting (Alexa) Yu - Personal Website

A responsive personal website built with HTML, CSS, and JavaScript. The website showcases my professional experience, skills, education, and portfolio of projects.

## Code Structure and Architecture

The website follows a modular, component-based architecture with clear separation of concerns:

```
alexayu1204.github.io/
├── index.html              # Single-page site: SEO/OG/Twitter/JSON-LD head, 9 sections, modals, image lightbox
├── style/
│   ├── main.css            # Layered stylesheet: base → v2 enhancement → v3 → visual (v4) → art + lightbox (v5)
│   └── github-markdown.css # Styling for the in-page markdown report previews
├── js/
│   └── main.js             # Vanilla JS: theme, scroll-spy, carousel, portfolio filters, copy buttons, lightbox
├── assets/
│   ├── favicon.svg · apple-touch-icon.png · icon-192.png · icon-512.png   # Icon / PWA set
│   ├── og-image.png        # 1200×630 social share card (rendered from _og_template.html)
│   ├── _og_template.html   # Source template for og-image.png
│   ├── art/                # "Art" section: inbox-* (Inbox Archive) + studio-* (Other work), full + -thumb pairs
│   ├── photography/        # Editorial photo wall, full + -thumb pairs
│   ├── img/                # Misc content images (wechat_qr.jpg)
│   └── projects/           # Portfolio covers (ph-*.svg via _gen_placeholders.py), report PDFs/MD, 2 real JPGs
├── favicon.ico             # Legacy multi-size favicon
├── site.webmanifest        # PWA manifest
├── robots.txt · sitemap.xml # SEO
├── Resume.pdf              # Downloadable résumé
└── README.md

Internal-only (kept out of the repo via .gitignore): photograph/ (source HEIC/PNG originals),
.omc/ and .claude/ (agent tooling state), docs/ (working notes), .playwright-mcp/.
```

### HTML Structure

The HTML is organized into semantic sections for better accessibility and SEO:

```html
<body data-theme="light">
    <!-- Fixed Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light">...</nav>
    
    <div class="main-container">
        <!-- Header Section -->
        <section class="header" id="header">...</section>
        
        <!-- Content Sections (About, Work, Education, etc.) -->
        <section class="info-card" data-aos="fade-up" id="about">...</section>
        <section class="info-card" data-aos="fade-up" id="work">...</section>
        <!-- More sections... -->
    </div>
    
    <!-- Modals for additional content -->
    <div class="modal fade" id="resumeModal">...</div>
    
    <!-- Scripts -->
    <script src="..."></script>
</body>
```

### CSS Architecture

The CSS uses CSS variables for theming and follows a component-based approach:

```css
/* Theme variables for light/dark mode */
:root {
  --bg-color: #f8f9fa;
  --text-color: #343a40;
  --primary-color: #ff7f00; /* Orange theme color */
  /* More variables... */
}

[data-theme="dark"] {
  --bg-color: #121212;
  --text-color: #e0e0e0;
  --primary-color: #ff9933; /* Muted burnt orange for dark mode */
  /* Dark theme variables... */
}

/* Component styling with consistent patterns */
.info-card {
  background: var(--card-bg);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 25px;
  margin-bottom: 25px;
  border-radius: 10px;
  transition: background-color 0.3s, box-shadow 0.3s;
  position: relative;
}
```

### JavaScript Implementation

JavaScript is organized into modular functions with clear responsibilities:

```javascript
// Event delegation pattern when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initBackToTopButton();
  setupNavbarBehavior();
  setupDarkModeToggle();
  setupProjectCarousel();
  setupPreviewModal();
});

// Modular functions with clear purposes
function setupDarkModeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
  
  // Set initial theme based on localStorage
  if (currentTheme) {
    document.body.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
  
  // Toggle theme on click with localStorage persistence
  themeToggle.addEventListener('click', () => {
    // Theme toggle implementation...
  });
}
```

### Key Implementation Features

1. **Responsive Design Approach**:
   - Uses Bootstrap grid system as a foundation
   - Implements custom media queries for fine-tuned control
   - Mobile-first approach with progressive enhancement

2. **Dark Mode Implementation**:
   - CSS variables for color theming
   - Theme persistence via localStorage
   - Accessible toggle with ARIA attributes

3. **Performance Optimizations**:
   - Lazy-loaded images
   - External CSS and JS for better caching
   - Touch event optimization with passive listeners
   - Conditional loading of modal content

4. **Animation System**:
   - AOS (Animate On Scroll) for scroll-triggered animations
   - CSS transitions for interactive elements
   - Optimized for reduced motion when needed

5. **Interactive Components**:
   - Custom carousel implementation with touch support
   - Modal content with dynamic loading
   - Markdown rendering for project documentation

## Website Features

### Navigation
- Fixed navigation bar with smooth scrolling to different sections
- Mobile-responsive collapsible menu
- Quick access to resume view and download
- Dark mode toggle for improved reading experience

### Header Section
- Professional introduction with name, title, and social links
- Clean, centered design for immediate visual impact
- Animated entrance for key elements

### About Me
- Brief professional summary
- Clean card-based design with subtle hover effects

### Research Projects
- Accordion-based layout for academic publications
- Publication-type pills (Poster, Paper, Workshop Paper) and status badges (Accepted, Under Review)
- Publication venue and research focus for each entry

### Work Experience
- Accordion-based layout for each position
- Chronologically organized work history
- Detailed descriptions of responsibilities and achievements

### Education
- Accordion-based layout for educational background
- Details about degrees, honors, and relevant coursework

### Technical Skills
- Visual representation of skills with interactive elements
- Categorized skills with emphasis on core competencies

### Project Experience
- Accordion interface for detailed project descriptions
- Chronological organization with date ranges
- Focus on technical implementations and outcomes

### Portfolio
- Carousel-based layout for easier browsing
- Interactive project cards with images and descriptions
- Links to GitHub repositories and live demos
- Mobile-optimized touch controls for swiping

### Art (section "08 · Art")
- **Featured artwork** — *Inbox Archive: Learning to Sound Like Myself*, selected for *The Mosaic of Becoming* (Nunnery Gallery, London): a full-width installation banner, a concise artist statement with an expandable full statement, and a width-filling grid of the five email pages
- **Other work** — a grid of mixed-media pieces (Chinese ink-and-brush painting, a small abstract, stitched mixed media)
- **Photography** — an editorial masonry wall (a few frames hand-drawn on)
- A minimal, accessible full-screen **lightbox** (← → / Esc / backdrop to close, focus restore, scroll-lock) shared by three independent galleries that navigate separately
- The résumé is reachable from the navbar CV icon, the hero "Download CV", and the résumé modal — there is no separate Online-Profiles or Resume section

### Contact
- An interactive grid with copy-to-clipboard buttons and toast feedback: email, UK phone, **London** location, LinkedIn, GitHub, and a WeChat QR modal

### Footer
- Copyright information
- Clean, minimal design

### Back-to-Top Button
- Appears when scrolling down the page
- Smooth scroll animation to the top
- Improves navigation on longer pages

## Technical Features

### Responsive Design
- Bootstrap-based grid system
- Mobile-first approach
- Adapts to different screen sizes and orientations
- Touch-optimized interactions for mobile devices

### Animations
- AOS (Animate On Scroll) library integration
- Subtle fade-in effects for content sections
- Smooth transitions between states

### Dark Mode
- User preference-based theme selection
- Persistent theme selection using localStorage
- Complete color scheme adjustment

### Interactive Components
- Carousel navigation for portfolio items
- Touch-friendly swipe gestures for mobile
- Modal windows for expanded content
- Enhanced iframe previews with scrolling control

## Technologies Used
- HTML5 for structure, with `Person` JSON-LD structured data and Open Graph / Twitter meta
- CSS3 with custom properties (theming), `backdrop-filter` glass, gradients and `prefers-reduced-motion` support
- Vanilla JavaScript for interactivity (IntersectionObserver scroll-spy, rAF-throttled scroll UI, Clipboard API, a dependency-free image lightbox)
- Bootstrap 5 framework for responsive layout
- Font Awesome for icons
- Google Fonts — **Fraunces** (display serif), **Roboto** (body), and **Ma Shan Zheng** (the 于昊廷 calligraphy name)
- AOS library for scroll animations

## Recent Updates

### Art section, hero & portfolio refresh (June 2026)
- **"Art" section** (renamed from "Studio"): the featured *Inbox Archive* became a full-width installation banner + tightened statement + a width-filling page grid; an **"Other work"** grid (Chinese painting, abstract, stitched mixed media) was added; image frames unified
- **Hero**: name set surname-first as "Yu, Haoting (Alexa)" with the Chinese calligraphy name **于昊廷** (Ma Shan Zheng) beneath; the decorative scroll-down cue was removed
- **Research & portfolio**: the *Botto* paper was promoted to **Accepted** (now 2 accepted · 1 under review); added **Neural Illumination** ([neuron-art](https://github.com/jerryzhao173985/neuron-art)) — an in-browser neural network rendered as algorithmic art — to Project Experience and the Portfolio carousel
- **Contact**: simplified to a single UK phone; location updated to London
- **Housekeeping**: Big Ben photo re-encoded sharper; all imagery optimised & EXIF-normalised; internal tooling/notes and source originals kept out of the repo via `.gitignore`

### Curation, Deslop & Studio (June 2026)
- **Deslop pass** (content-first, "carefully curated by a human"): removed decoration that didn't earn its place — the at-a-glance stats strip, an ethos band, a 2016/2025 dateline, the auto-rotating hero role line (now a static "Researcher · Poet · Photographer"), and the standalone Online-Profiles and Resume sections; About became a two-column layout; the rejected "where mathematics meets art" phrasing was removed everywhere (meta, OG image, manifest)
- **Studio section**: a featured mixed-media artwork (*Inbox Archive: Learning to Sound Like Myself*, exhibited in *The Mosaic of Becoming*) with an artist statement, plus an editorial photography masonry wall — both served by a new dependency-free full-screen lightbox
- **Performance**: real photographs and artwork ship as optimized, EXIF-stripped JPEGs (~3 MB total, lazy-loaded); source originals are kept out of the repo via `.gitignore`

### Experience & Polish Overhaul (June 2026)
- **Discoverability & sharing**: added a full SEO head — meta description, canonical, Open Graph + Twitter cards with a generated 1200×630 share image, and `Person` JSON-LD structured data; plus an SVG monogram favicon, `favicon.ico`, and an Apple touch icon
- **Redesigned hero**: animated aurora + grid backdrop, a monogram, clear call-to-action buttons, and an expanded social row (now including GitHub & LinkedIn) — *the rotating role line and "at a glance" stats strip introduced here were later removed in the deslop pass*
- **Smarter navigation**: a top reading-progress bar and scroll-spy that highlights the current section in the navbar (`aria-current`), an accessibility skip-link, and a brand mark that returns to the top
- **Interaction**: portfolio cards are now filterable by focus (AI/ML, NLP, Vision, Generative, Creative, Data) and the Technical Skills list is grouped into labelled categories; the Contact section became an interactive grid with copy-to-clipboard buttons and toast feedback
- **Theming**: theme is applied before first paint (no dark-mode flash), respects the OS `prefers-color-scheme`, keeps the browser `theme-color` in sync, and follows live system changes until the visitor makes an explicit choice
- **Resilience & a11y**: replaced all external `dummyimage.com`/broken image links with themed local SVG covers (works offline), honoured `prefers-reduced-motion` throughout, added visible keyboard focus styles, and a richer three-part footer

### Research & Portfolio Refresh (June 2026)
- Added a **Research Projects** section — three 2026 publications with type pills and Accepted / Under Review badges — plus a dedicated "Research" nav entry
- Added two flagship projects to Project Experience and the Portfolio carousel: **VERITAS**, a multi-agent LLM courtroom, and **Hidden Connections**, a semantic constellation of survey responses
- Added the **MRes in Creative Computing (UAL, 2025–2026)** to Education and the **Shanghai BaiLiYuan Data Analyst** role to Work Experience
- Refreshed About Me and corrected all experience/education dates to match the latest résumé
- Expanded Technical Skills and fixed copy-pasted project metrics
- Replaced `Resume.pdf` with the latest résumé; footer copyright bumped to 2026

### Color Scheme Update (July 2024)
- Changed website theme from blue to warm orange
- Implemented a vibrant orange (#ff7f00) for light mode
- Added a muted burnt orange (#ff9933) for dark mode
- Enhanced contrast and readability for dark mode elements
- Improved accessibility with better color ratios
- Implemented dark mode styling for accordion components
- Ensured consistent visual experience across all UI elements

### Dark Mode Enhancement (August 2024)
- Fixed dark mode styling for accordion content in Work Experience and Project Experience sections
- Restored accordion button expanded state to standard Bootstrap blue (#0d6efd) for better visual consistency
- Enhanced skills list item styling in dark mode with improved contrast and readability
  ```css
  /* Dark mode override for skills items */
  [data-theme="dark"] .skills ul li {
    background: #2c2c2c; /* Darker background for dark mode */
    color: #e0e0e0; /* Light text color for contrast */
    border: 1px solid #3d3d3d; /* Subtle border for definition */
  }
  ```
- Applied a simplified CSS approach for dark mode theming with targeted rules
- Added subtle border and shadow effects to improve content separation in dark mode
- Fixed text contrast issues with muted text elements in dark mode
- Optimized CSS selector specificity to reduce style conflicts and improve performance

### Project Documentation Enhancement (August 2024)
- Improved Markdown rendering in preview modals with enhanced styling
- Added GitHub-style alert boxes for technical notes, warnings, and tips
- Implemented tabular data display for technical specifications
- Enhanced code blocks with syntax highlighting and descriptive comments
- Added visual elements (emojis, separators) to improve document structure
- Optimized for both light and dark mode reading experiences

### Content Updates (August 2024)
- Added YOLOv9 Rock Detection project showcasing AI model fine-tuning
- Enhanced project portfolio organization with consistent formatting
- Updated project descriptions for clarity and technical accuracy
- Improved visual consistency across all portfolio items

### Code Structure Improvements (July 2024)
- Restructured codebase for better maintainability
- Separated HTML, CSS, and JavaScript into dedicated files
- Implemented modular JavaScript functions
- Added comprehensive documentation
- Improved CSS organization with clear sectioning

### Portfolio Enhancement (June 2024)
- Transformed portfolio section to use a carousel layout for better mobile experience
- Implemented touch-friendly swipe gestures for mobile navigation
- Added navigation buttons for left/right scrolling
- Removed the self-referential personal website card
- Improved the preview functionality for external websites with proper offset scrolling
- Enhanced mobile responsiveness across different devices, especially for iOS Safari
- Added custom placeholder images for all projects
- Optimized carousel performance and animations
- Improved overall mobile navigation and interaction experience

## Setup and Deployment
This website is deployed using GitHub Pages and can be accessed at [alexayu1204.github.io](https://alexayu1204.github.io/).

## License
© 2026 Haoting (Alexa) Yu. All rights reserved. 