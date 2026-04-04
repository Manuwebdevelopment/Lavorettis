/* ===================================================================
   LAVORETTI'S — Main JavaScript
   Tag Haus-style transitions: slideLeft, slideRight, fadeBottom
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar Scroll ---------- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ---------- Mobile Hamburger ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ================================================================
     SCROLL-TRIGGERED ANIMATIONS (Waypoints-style)
     Triggers .visible class on .anim elements when they enter viewport
     ================================================================ */
  const animEls = document.querySelectorAll('.anim');
  if (animEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -20px 0px'
    });

    animEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: no IntersectionObserver support — show everything
    animEls.forEach(el => el.classList.add('visible'));
  }

  // Failsafe: after 1.5s, force-reveal any elements still hidden
  // (handles cases where iOS doesn't trigger IntersectionObserver for on-screen elements)
  setTimeout(() => {
    document.querySelectorAll('.anim:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 1500);

  /* Also handle legacy .fade-in class */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  /* ---------- Hero Video Fallback ---------- */
  const heroVideo = document.querySelector('.hero-bg video');
  const heroFallback = document.querySelector('.hero-fallback-img');
  if (heroVideo && heroFallback) {
    // Hide fallback image when video can play
    heroVideo.addEventListener('canplay', () => {
      heroFallback.style.display = 'none';
    });
    // If video errors, hide it and show fallback
    heroVideo.addEventListener('error', () => {
      heroVideo.style.display = 'none';
      heroFallback.style.display = 'block';
    });
    // If no video source available, show fallback
    if (!heroVideo.querySelector('source') || !heroVideo.querySelector('source').src) {
      heroVideo.style.display = 'none';
    }
  }

  /* ---------- Swiper Initialization ---------- */
  const swiperEl = document.querySelector('.portfolio-swiper');
  if (swiperEl && typeof Swiper !== 'undefined') {
    const totalSlides = swiperEl.querySelectorAll('.swiper-slide').length;
    const paginationContainer = document.getElementById('portfolioPagination');

    const portfolioSwiper = new Swiper('.portfolio-swiper', {
      loop: true,
      spaceBetween: 30,
      grabCursor: true,
      speed: 800,
      effect: 'slide',
      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      },
      on: {
        init: function () {
          buildPagination(this, totalSlides, paginationContainer);
        },
        slideChange: function () {
          updatePagination(this, totalSlides, paginationContainer);
        }
      }
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => portfolioSwiper.slidePrev());
    if (nextBtn) nextBtn.addEventListener('click', () => portfolioSwiper.slideNext());
  }

  /* ---------- About Swiper Initialization ---------- */
  const aboutSwiperEl = document.querySelector('.about-swiper');
  if (aboutSwiperEl && typeof Swiper !== 'undefined') {
    const totalAboutSlides = aboutSwiperEl.querySelectorAll('.swiper-slide').length;
    const aboutPaginationContainer = document.getElementById('aboutPagination');

    const aboutSwiper = new Swiper('.about-swiper', {
      loop: true,
      spaceBetween: 20,
      grabCursor: true,
      speed: 800,
      effect: 'slide',
      slidesPerView: 1,
      breakpoints: {
        768: { slidesPerView: 2 }
      },
      on: {
        init: function () {
          buildPagination(this, totalAboutSlides, aboutPaginationContainer);
        },
        slideChange: function () {
          updatePagination(this, totalAboutSlides, aboutPaginationContainer);
        }
      }
    });

    const aboutPrevBtn = document.getElementById('aboutPrevBtn');
    const aboutNextBtn = document.getElementById('aboutNextBtn');
    if (aboutPrevBtn) aboutPrevBtn.addEventListener('click', () => aboutSwiper.slidePrev());
    if (aboutNextBtn) aboutNextBtn.addEventListener('click', () => aboutSwiper.slideNext());
  }

  function buildPagination(swiper, total, container) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.classList.add('page-num');
      btn.textContent = i + 1;
      if (i === swiper.realIndex) btn.classList.add('active');
      btn.addEventListener('click', () => swiper.slideToLoop(i));
      container.appendChild(btn);
    }
  }

  function updatePagination(swiper, total, container) {
    if (!container) return;
    const btns = container.querySelectorAll('.page-num');
    btns.forEach((btn, i) => {
      btn.classList.toggle('active', i === swiper.realIndex);
    });
  }

  /* ---------- Custom File Upload ---------- */
  const fileZone = document.getElementById('fileUploadZone');
  if (fileZone) {
    const fileInput = fileZone.querySelector('input[type="file"]');
    const label = fileZone.querySelector('span');
    if (fileInput && label) {
      fileInput.addEventListener('change', () => {
        const count = fileInput.files.length;
        if (count > 0) {
          label.textContent = `${count} file${count > 1 ? 's' : ''} selected`;
        } else {
          label.textContent = 'Upload Pictures of the Issue/Space';
        }
      });
    }
  }

  /* ---------- Contact Form — Captcha Validation ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const captchaInput = document.getElementById('captcha');
      if (!captchaInput) return;

      const answer = captchaInput.value.trim();
      if (answer !== '22') {
        alert('Incorrect answer. Please try the captcha again.');
        captchaInput.focus();
        return;
      }

      const required = contactForm.querySelectorAll('[required]');
      let allValid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          allValid = false;
          field.style.borderBottomColor = '#e74c3c';
          field.addEventListener('input', function handler() {
            field.style.borderBottomColor = '';
            field.removeEventListener('input', handler);
          });
        }
      });

      if (!allValid) {
        alert('Please fill in all required fields.');
        return;
      }

      alert('Thank you! Your message has been received. We\'ll get back to you within 24 hours.');
      contactForm.reset();
      const label = document.querySelector('#fileUploadZone span');
      if (label) label.textContent = 'Upload Pictures of the Issue/Space';
    });
  }

  /* ---------- Inner-page Nav State ---------- */
  const isHomePage = document.querySelector('.hero');
  if (!isHomePage && navbar) {
    navbar.classList.add('scrolled');
  }

});
