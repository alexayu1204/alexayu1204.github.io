# Haoting (Alexa) Yu - Personal Website

A responsive personal website built with HTML, CSS, and JavaScript. The website showcases my professional experience, skills, education, and portfolio of projects.

## Code Structure and Architecture

The website follows a modular, component-based architecture with clear separation of concerns:

```
alexayu1204.github.io/
├── index.html            # Main HTML structure
├── style/
│   ├── main.css          # Custom CSS styles
│   └── github-markdown.css # Markdown styling for project documentation
├── js/
│   └── main.js           # JavaScript functionality
├── assets/               # Project images and documents
│   └── projects/         # Project-specific assets
└── Resume.pdf            # Downloadable resume
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
  --primary-color: #d35400; /* Muted burnt orange for dark mode */
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

### Online Profiles
- Links to professional platforms (LinkedIn, GitHub)
- Preview functionality for external portfolio sites
- WeChat QR code for direct connection

### Resume Section
- Options to view or download the full resume
- Modal-based preview of the resume PDF

### Contact Section
- Comprehensive contact information
- Professional email and phone details
- Geographical location information

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
- HTML5 for structure
- CSS3 with custom variables for styling
- JavaScript for interactivity
- Bootstrap 5 framework for responsive layout
- Font Awesome for icons
- Google Fonts for typography
- AOS library for scroll animations

## Recent Updates

### Color Scheme Update (July 2024)
- Changed website theme from blue to warm orange
- Implemented a vibrant orange (#ff7f00) for light mode
- Added a muted burnt orange (#d35400) for dark mode
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
© 2025 Haoting (Alexa) Yu. All rights reserved. 