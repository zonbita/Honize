(function () {
  if (typeof AOS === 'undefined') return;

  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    delay: 0,
  });

  window.addEventListener('load', function () {
    AOS.refresh();
  });
})();
