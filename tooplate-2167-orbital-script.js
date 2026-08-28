/*
    Lapoworld Orbital Theme & Subpage Animations
    Adapted for Technical Repair Services
*/

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================
  // 1. ORBITAL RING LOGIC (Index Page Only)
  // ==========================================
  var ring = document.getElementById('ring');
  if (ring) {
    var panels = ring.querySelectorAll('.panel');
    var count = panels.length;
    var spacingLevels = [0.74, 0.92, 1.08];
    var spacingIndex = 1;

    function baseRadius() {
      var raw = getComputedStyle(document.documentElement).getPropertyValue('--ring-radius');
      return parseFloat(raw) || 360;
    }
    function effectiveRadius() { return baseRadius() * spacingLevels[spacingIndex]; }

    function positionPanels() {
      var r = effectiveRadius();
      panels.forEach(function (panel, i) {
        var angle = (360 / count) * i;
        var tilt = Math.sin((i / count) * Math.PI * 2) * 8;
        panel.style.setProperty('--ry', angle + 'deg');
        panel.style.setProperty('--tz', r + 'px');
        panel.style.setProperty('--rz', tilt.toFixed(2) + 'deg');
        panel.style.setProperty('--i', i);
      });
    }
    positionPanels();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(positionPanels, 200);
    });

    var spacingSteps = document.querySelectorAll('.spacing-step');
    function setSpacing(idx) {
      spacingIndex = idx;
      var r = effectiveRadius();
      ring.querySelectorAll('.panel').forEach(function (p) { p.style.setProperty('--tz', r + 'px'); });
      spacingSteps.forEach(function (b) { b.classList.toggle('is-active', parseInt(b.getAttribute('data-space'), 10) === idx); });
      if (navigator.vibrate) navigator.vibrate(10); 
    }
    spacingSteps.forEach(function (b) {
      b.addEventListener('click', function () { setSpacing(parseInt(b.getAttribute('data-space'), 10)); });
    });
  }

  // ==========================================
  // 2. PARALLAX & DRAG STAGE (Index Page Only)
  // ==========================================
  var stage = document.querySelector('.stage');
  var parallax = document.querySelector('.parallax');
  var rotation = 0;
  var velocity = 0;
  var baseDrift = reduceMotion ? 0 : 0.12;   
  var friction = 0.94;
  var MAX_VELOCITY = 7;
  var DRAG_SENS = 0.32;
  var WHEEL_SENS = 0.05;
  var dragging = false;
  var lastX = 0;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  var rangeY = 28, rangeX = 30, biasX = 10;
  
  if (!reduceMotion && parallax) {
    window.addEventListener('mousemove', function (e) {
      var mx = (e.clientX / window.innerWidth) - 0.5;
      var my = (e.clientY / window.innerHeight) - 0.5;
      targetY = mx * rangeY;
      targetX = (-my * rangeX) + biasX;
    });
  }

  if (stage) {
    stage.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; velocity = 0; stage.classList.add('dragging');
    });
    
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      var step = dx * DRAG_SENS; rotation += step;
      velocity = clamp(step, -MAX_VELOCITY, MAX_VELOCITY);
    });
    
    function endDrag() {
      if (!dragging) return;
      dragging = false; stage.classList.remove('dragging');
    }
    
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    stage.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        velocity = clamp(velocity + e.deltaX * WHEEL_SENS, -MAX_VELOCITY, MAX_VELOCITY);
      }
    }, { passive: false });
  }

  function frame() {
    if (ring) {
      if (!dragging) {
        rotation += baseDrift + velocity; velocity *= friction;
        if (Math.abs(velocity) < 0.0015) velocity = 0;
      }
      ring.style.transform = 'rotateY(' + rotation.toFixed(3) + 'deg)';
    }

    if (!reduceMotion && parallax) {
      currentX += (targetX - currentX) * 0.06; currentY += (targetY - currentY) * 0.06;
      parallax.style.transform = 'rotateX(' + currentX.toFixed(2) + 'deg) rotateY(' + currentY.toFixed(2) + 'deg)';
    }
    
    if(ring || parallax) {
      requestAnimationFrame(frame);
    }
  }
  if(ring || parallax) { frame(); }

  // ==========================================
  // 3. SCROLL REVEAL & TREE ANIMATION
  // ==========================================
  var revealEls = document.querySelectorAll('.reveal');
  var treeContainer = document.querySelector('.tree-container');
  var treeFill = document.querySelector('.tree-trunk-fill');
  var branches = document.querySelectorAll('.tree-branch');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }
  setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('visible'); }); }, 3000);

  if (treeContainer && treeFill) {
    window.addEventListener('scroll', function() {
      var rect = treeContainer.getBoundingClientRect();
      var viewHeight = window.innerHeight;
      
      var scrollProgress = (viewHeight * 0.8 - rect.top) / (rect.height);
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));
      treeFill.style.height = (scrollProgress * 100) + '%';
      
      branches.forEach(function(branch) {
         var bRect = branch.getBoundingClientRect();
         if (bRect.top < viewHeight * 0.85) {
             branch.classList.add('visible');
         }
      });
    }, { passive: true });
    window.dispatchEvent(new Event('scroll'));
  }

  // ==========================================
  // 4. NAVIGATION & MOBILE MENU
  // ==========================================
  var toggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        // This ensures external/page links (like services.html) load normally!
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          var targetSection = document.querySelector(targetId);
          if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ==========================================
  // 5. HERO UI CONTROLS (Index Page Only)
  // ==========================================
  var switchBtn = document.getElementById('visualsSwitch');
  if (switchBtn) {
    switchBtn.addEventListener('click', function () {
      var on = switchBtn.getAttribute('aria-checked') !== 'true';
      switchBtn.setAttribute('aria-checked', on ? 'true' : 'false');
      document.body.classList.toggle('visuals-on', on);
      if (navigator.vibrate) navigator.vibrate(15); 
    });
  }

  var zoomSwitch = document.getElementById('zoomSwitch');
  var ringTilt = document.querySelector('.ring-tilt');
  if (zoomSwitch && ringTilt) {
    zoomSwitch.addEventListener('click', function () {
      var on = zoomSwitch.getAttribute('aria-checked') !== 'true';
      zoomSwitch.setAttribute('aria-checked', on ? 'true' : 'false');
      ringTilt.style.setProperty('--zoom', on ? '1.24' : '1');
      if (navigator.vibrate) navigator.vibrate(20); 
    });
  }

  // ==========================================
  // 6. SUBPAGE LOGIC (FAQS & GSAP INIT)
  // ==========================================

  // FAQ Accordion Toggle
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    item.addEventListener('click', function() {
      var isActive = this.classList.contains('active');
      
      // Close all others
      faqItems.forEach(function(el) {
        el.classList.remove('active');
        var ans = el.querySelector('.faq-answer');
        if(ans) ans.style.display = 'none';
      });
      
      // Open clicked
      if(!isActive) {
        this.classList.add('active');
        var ans = this.querySelector('.faq-answer');
        if(ans) ans.style.display = 'block';
      }
    });
  });

  // GSAP & ScrollTrigger Initialization
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Fade up animation triggered by scroll
    gsap.utils.toArray('.gsap-fade-up').forEach(function(elem) {
      gsap.fromTo(elem, 
        { y: 50, opacity: 0 }, 
        {
          y: 0, 
          opacity: 1, 
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Staggered list animations (for Testimonials, FAQs, Lists)
    gsap.utils.toArray('.gsap-stagger-list').forEach(function(list) {
      var items = list.querySelectorAll('li, .testimonial-card, .faq-item');
      if(items.length > 0) {
        gsap.fromTo(items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: list,
              start: "top 85%"
            }
          }
        );
      }
    });
  }

})();
