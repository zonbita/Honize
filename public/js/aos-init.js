(function () {
  function initAos() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 450,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      delay: 0,
      disable: function () {
        return (
          window.__TMV_DISABLE_AOS__ === true ||
          window.__DEMO_DISABLE_AOS__ === true ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );
      },
    });
  }

  function scheduleInit() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initAos, { timeout: 800 });
    } else {
      setTimeout(initAos, 0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit);
  } else {
    scheduleInit();
  }
})();
