# Build Specification: Premium Service Website (Tag Haus Architecture)

## 1. Project Architecture & Data Binding
- **Tech Stack:** Use a component-based static site generator (e.g., Astro, Next.js static export, or vanilla HTML/JS with template literals) optimized for standard Hostinger deployment.
- **Data Source:** All text content, links, and image paths MUST be dynamically mapped from `/src/data/content.json`. Do not hardcode copy into the components.

## 2. Global Styling & Theming
Implement the following design tokens using standard CSS variables or Tailwind config:
- **Typography:** - Headings (`h1` to `h6`): 'Montserrat', sans-serif. Font-weight: 600. Letter-spacing: -0.02em.
  - Body: 'Inter', sans-serif. Font-weight: 400. Line-height: 1.6.
- **Color Palette:**
  - `--bg-primary`: #FFFFFF
  - `--bg-secondary`: #F9F9F9
  - `--text-main`: #1A1A1A
  - `--text-muted`: #666666
  - `--accent`: #000000 (Use for buttons, hover states, and dark sections)
  - `--border-light`: #EAEAEA
- **Animations:** Implement standard fade-in-up animations for elements as they enter the viewport using the `IntersectionObserver` API. Elements should translate Y from `20px` to `0` and fade opacity from `0` to `1` over `0.6s` with an ease-out curve.

## 3. Component Specifications

### A. Navigation Bar (`<Header />`)
- **Initial State:** Transparent background, text/logo color set to white. Position: fixed, top 0, z-index: 50. Padding: `1.5rem 2rem`.
- **Scrolled State:** When `window.scrollY > 50px`, transition background to `--bg-primary` (white), text/logo to `--text-main` (black), and apply a subtle box-shadow (`0 4px 12px rgba(0,0,0,0.05)`). Reduce padding to `1rem 2rem` for a sleek feel.
- **Links:** Uppercase, 14px, 500 weight, 0.05em letter spacing.

### B. Hero Section (`<Hero />`)
- **Layout:** `min-height: 100vh`, `display: flex`, `align-items: center`, `justify-content: center`, text-aligned center.
- **Background:** Render an `<img>` tag covering the full section (`object-fit: cover`) using the static image path from the JSON. 
- **Overlay:** Apply a pseudo-element (`::after`) over the image with `background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));` to ensure the white text pops perfectly.
- **Content:** Headline (`clamp(3rem, 6vw, 5.5rem)`), subheading (`1.25rem`, max-width: 800px), and a solid black CTA button with white text and a padding of `1rem 2.5rem`.

### C. Intro / About Section (`<Intro />`)
- **Layout:** Generous top/bottom padding (`6rem`). Max-width container (`1200px`).
- **Typography:** The main heading should be large and bold, followed by the sub-heading in a lighter weight. Paragraphs should have a `margin-bottom` of `1.5rem` and use `--text-muted` for elegant readability.

### D. Services Grid (`<Services />`)
- **Layout:** CSS Grid. Desktop: 4 columns (`grid-template-columns: repeat(4, 1fr)`). Tablet: 2 columns. Mobile: 1 column. Gap: `2rem`.
- **Cards:** White background, 1px solid `--border-light`, padding `2.5rem 2rem`. 
- **Interactions:** On hover, transition `transform: translateY(-8px)` and apply `box-shadow: 0 15px 30px rgba(0,0,0,0.08)`.
- **Icons:** Render the SVG icons from the JSON paths above the card titles.

### E. Portfolio Carousel (`<Portfolio />`)
- **Integration:** Initialize `Swiper.js`.
- **Config:** `loop: true`, `spaceBetween: 30`, `grabCursor: true`.
- **Responsive:** 1 slide (mobile), 2 slides (tablet), 3 slides (desktop).
- **Controls:** Custom styled navigation arrows placed outside the image bounds. Numeric pagination (1, 2, 3...) styled as clickable text elements beneath the slider, turning bold when active.

### F. Contact Section & Form (`<Contact />`)
- **Layout:** Two columns on desktop. Left column: Text and direct contact details. Right column: The form. Background should be `--bg-secondary`.
- **Form UI:** Inputs and textareas should have a transparent background, a solid `1px` border bottom (`--border-light`), and no side/top borders. Focus states should transition the bottom border to `--accent` (black).
- **Custom File Upload:** Hide the default `<input type="file" multiple>`. Create a custom `<label>` styled as a drag-and-drop zone (dashed border, `2rem` padding, centered text). Use JS to update the label text to show the number of files selected.
- **Captcha Validation:** Implement an `<input>` for the math question. Intercept the form `submit` event via JS. If the input value !== the `expectedAnswer` in the JSON, prevent submission, alert the user, and focus the input.

### G. Footer (`<Footer />`)
- **Layout:** Simple, centered content. Solid black background (`--text-main`) with white text. Minimal padding (`3rem`).