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

  /* ---------- Hero Height Fix (iOS Safari 100vh bug) ---------- */
  const heroEl = document.querySelector('.hero');
  function fixHeroHeight() {
    if (heroEl) heroEl.style.minHeight = window.innerHeight + 'px';
  }
  fixHeroHeight();
  window.addEventListener('resize', fixHeroHeight, { passive: true });

  /* ================================================================
     SCROLL-TRIGGERED ANIMATIONS
     Uses getBoundingClientRect + scroll event — 100% iOS Safari safe.
     IntersectionObserver is unreliable on iOS Safari in many cases.
     ================================================================ */
  const animEls = document.querySelectorAll('.anim');

  function checkAnimations() {
    const vh = window.innerHeight;
    let allDone = true;
    animEls.forEach(el => {
      if (!el.classList.contains('visible')) {
        allDone = false;
        const rect = el.getBoundingClientRect();
        // Trigger when element is 60px from the bottom of the viewport
        if (rect.top < vh - 60 && rect.bottom > 0) {
          el.classList.add('visible');
        }
      }
    });
    // Remove listener once all are visible (performance)
    if (allDone && animEls.length > 0) {
      window.removeEventListener('scroll', checkAnimations);
    }
  }

  if (animEls.length > 0) {
    window.addEventListener('scroll', checkAnimations, { passive: true });
    window.addEventListener('touchmove', checkAnimations, { passive: true });
    // Check immediately for elements already in view on load
    setTimeout(checkAnimations, 150);
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
        const files = Array.from(fileInput.files);

        const maxFiles = 5;
        const maxFileSize = 5 * 1024 * 1024;
        const maxTotalSize = 15 * 1024 * 1024;

        if (files.length > maxFiles) {
          alert('You can upload a maximum of 5 images.');
          fileInput.value = '';
          label.textContent = 'Upload Pictures of the Issue/Space';
          return;
        }

        const oversizedFile = files.find(
          (file) => file.size > maxFileSize
        );

        if (oversizedFile) {
          alert('Each image must be 5 MB or smaller.');
          fileInput.value = '';
          label.textContent = 'Upload Pictures of the Issue/Space';
          return;
        }

        const totalSize = files.reduce(
          (total, file) => total + file.size,
          0
        );

        if (totalSize > maxTotalSize) {
          alert('The total size of all images must be 15 MB or less.');
          fileInput.value = '';
          label.textContent = 'Upload Pictures of the Issue/Space';
          return;
        }

        if (files.length > 0) {
          label.textContent =
            `${files.length} file${files.length > 1 ? 's' : ''} selected`;
        } else {
          label.textContent =
            'Upload Pictures of the Issue/Space';
        }
      });
    }
  }

     /* ---------- Contact Form — Safari-safe Submission ---------- */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const captchaInput = document.getElementById('captcha');
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const fileInput = contactForm.querySelector('input[type="file"]');

      if (!captchaInput || !submitButton) return;

      /*
      | Validate captcha
      */

      if (captchaInput.value.trim() !== '22') {
        alert('Incorrect answer. Please try the captcha again.');
        captchaInput.focus();
        return;
      }

      /*
      | Validate required fields
      */

      const requiredFields = contactForm.querySelectorAll('[required]');
      let allValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          allValid = false;
          field.style.borderBottomColor = '#e74c3c';

          field.addEventListener(
            'input',
            function handler() {
              field.style.borderBottomColor = '';
              field.removeEventListener('input', handler);
            }
          );
        }
      });

      if (!allValid) {
        alert('Please fill in all required fields.');
        return;
      }

      /*
      | Validate email
      */

      const emailInput = contactForm.querySelector('input[name="email"]');

      if (emailInput && !emailInput.checkValidity()) {
        alert('Please enter a valid email address.');
        emailInput.focus();
        return;
      }

      /*
      | File limits
      */

      const files = fileInput
        ? Array.from(fileInput.files)
        : [];

      const maxFiles = 5;
      const maxFileSize = 5 * 1024 * 1024;
      const maxTotalSize = 15 * 1024 * 1024;

      if (files.length > maxFiles) {
        alert('You can upload a maximum of 5 images.');
        return;
      }

      const oversizedFile = files.find(
        (file) => file.size > maxFileSize
      );

      if (oversizedFile) {
        alert('Each image must be 5 MB or smaller.');
        return;
      }

      const totalSize = files.reduce(
        (total, file) => total + file.size,
        0
      );

      if (totalSize > maxTotalSize) {
        alert('The total size of all images must be 15 MB or less.');
        return;
      }

      /*
      | Build multipart form manually
      |
      | We deliberately do NOT use:
      |
      | new FormData(contactForm)
      |
      | for the files.
      |
      | Safari 26.5.x has a WebKit issue affecting disk-backed
      | File objects in multipart requests. Reading each file into
      | memory first avoids the zero-byte POST problem.
      */

      const formData = new FormData();

      formData.append(
        'name',
        contactForm.querySelector('[name="name"]').value.trim()
      );

      formData.append(
        'email',
        contactForm.querySelector('[name="email"]').value.trim()
      );

      formData.append(
        'phone',
        contactForm.querySelector('[name="phone"]').value.trim()
      );

      formData.append(
        'location',
        contactForm.querySelector('[name="location"]').value.trim()
      );

      formData.append(
        'message',
        contactForm.querySelector('[name="message"]').value.trim()
      );

      formData.append(
        'captcha',
        captchaInput.value.trim()
      );

      const honeypot = contactForm.querySelector('[name="website"]');

      formData.append(
        'website',
        honeypot ? honeypot.value : ''
      );

      /*
      | Convert uploaded files to memory-backed Blobs
      */

      try {
        for (const file of files) {
          const buffer = await file.arrayBuffer();

          const memoryBlob = new Blob(
            [buffer],
            {
              type: file.type || 'application/octet-stream'
            }
          );

          formData.append(
            'propertyImages[]',
            memoryBlob,
            file.name
          );
        }
      } catch (error) {
        console.error('File preparation error:', error);

        alert(
          'One of the selected images could not be prepared for upload.'
        );

        return;
      }

      /*
      | Submit
      */

      const originalButtonText = submitButton.textContent;

      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      try {
        const response = await fetch('send-quote.php', {
          method: 'POST',
          body: formData
        });

        let data;

        try {
          data = await response.json();
        } catch {
          throw new Error(
            'The server returned an unexpected response.'
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            'We could not send your request.'
          );
        }

        alert(data.message);

        contactForm.reset();

        const uploadLabel = document.querySelector(
          '#fileUploadZone span'
        );

        if (uploadLabel) {
          uploadLabel.textContent =
            'Upload Pictures of the Issue/Space';
        }

      } catch (error) {
        console.error('Quote form error:', error);

        alert(
          error.message ||
          'We could not send your request right now. Please try again.'
        );

      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }

  /* ---------- Inner-page Nav State ---------- */
  const isHomePage = document.querySelector('.hero');
  if (!isHomePage && navbar) {
    navbar.classList.add('scrolled');
  }

});
