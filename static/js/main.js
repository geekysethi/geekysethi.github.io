// Main JavaScript file - optimized for performance
(function() {
  'use strict';

  // Lazy loading implementation for images
  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }

  // Performance optimization: Request Animation Frame for smooth scrolling
  function smoothScrollTo(element, duration = 500) {
    const targetPosition = element.offsetTop - 70; // Account for fixed navbar
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }

  // Optimize anchor link scrolling
  function initSmoothScrolling() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          smoothScrollTo(target);
        }
      });
    });
  }

  // Preload critical images
  function preloadCriticalImages() {
    const criticalImages = [
      '/static/img/ashish.jpg',
      '/static/img/lightmetrics.png'
    ];
    
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Add loading states for dynamic content
  function showLoading(element) {
    element.innerHTML = '<div class="loading">Loading...</div>';
  }

  function hideLoading(element) {
    const loading = element.querySelector('.loading');
    if (loading) loading.remove();
  }

  // Enhanced content loading with error handling
  function loadContent() {
    const contentMap = {
      "#about": "templates/about.html",
      "#experience": "templates/experience.html", 
      "#education": "templates/education.html",
      "#contact": "templates/contact.html"
    };

    Object.entries(contentMap).forEach(([selector, url]) => {
      const element = document.querySelector(selector);
      if (element) {
        showLoading(element);
        
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
          })
          .then(html => {
            hideLoading(element);
            element.innerHTML = html;
            
            // Initialize lazy loading for any new images
            initLazyLoading();
          })
          .catch(error => {
            console.error(`Error loading ${url}:`, error);
            hideLoading(element);
            element.innerHTML = '<p>Content could not be loaded. Please try again later.</p>';
          });
      }
    });
  }

  // Initialize everything when DOM is ready
  function init() {
    preloadCriticalImages();
    initLazyLoading();
    initSmoothScrolling();
    loadContent();
  }

  // Use modern event handling
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Add performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log(`Page load time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
    });
  }

})();