(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Active nav state */
  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page.indexOf('.') === -1) { page = 'index.html'; }
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    var target = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (target === page) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  /* Accessible mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var setOpen = function (open, returnFocus) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open && returnFocus) { toggle.focus(); }
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    });

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') { return; }
      if (nav.contains(event.target) || toggle.contains(event.target)) { return; }
      setOpen(false, true);
    });
  }

  /* Smooth scroll for on-page anchors */
  document.querySelectorAll('a[href*="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var url;
      try { url = new URL(link.href, window.location.href); } catch (e) { return; }
      if (url.pathname !== window.location.pathname || !url.hash || url.hash === '#') { return; }
      var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) { return; }
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
      target.focus({ preventScroll: true });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', url.hash);
      }
    });
  });

  /* Scroll reveal */
  var revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length && !reduceMotion && 'IntersectionObserver' in window) {
    root.classList.add('reveal-ready');
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  }

  /* Sticky mobile call bar, shown once the hero or page header is scrolled past */
  var bar = document.getElementById('callbar');
  if (bar) {
    var trigger = document.querySelector('[data-callbar-trigger]');
    if (trigger && 'IntersectionObserver' in window) {
      var barObserver = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        var pastTrigger = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        bar.classList.toggle('is-visible', pastTrigger);
      });
      barObserver.observe(trigger);
    } else {
      var onScroll = function () {
        bar.classList.toggle('is-visible', window.scrollY > 400);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
})();
