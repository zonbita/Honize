(function () {
  var root = document.querySelector('.project-swiper');
  var filtersEl = document.getElementById('project-filters');
  if (!root || typeof Swiper === 'undefined') return;

  var swiper = null;
  var activeFilter = 'all';

  function countVisible() {
    return root.querySelectorAll('.swiper-slide:not(.swiper-slide-hidden)').length;
  }

  function applyVisibility() {
    root.querySelectorAll('.swiper-slide').forEach(function (slide) {
      var match = activeFilter === 'all' || slide.getAttribute('data-category') === activeFilter;
      slide.classList.toggle('swiper-slide-hidden', !match);
    });
  }

  function destroySwiper() {
    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }
  }

  function initSwiper() {
    destroySwiper();
    applyVisibility();

    var visible = countVisible();
    if (!visible) return;

    swiper = new Swiper(root, {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      watchSlidesProgress: true,
      loop: visible >= 4,
      speed: 650,
      slideToClickedSlide: true,
      resistanceRatio: 0.85,
      autoplay:
        visible >= 2
          ? {
              delay: 3200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : false,
      coverflowEffect: {
        rotate: 48,
        stretch: -36,
        depth: 220,
        modifier: 1.1,
        slideShadows: true,
      },
      pagination: {
        el: root.querySelector('.project-swiper-pagination'),
        clickable: true,
        dynamicBullets: visible > 10,
      },
      breakpoints: {
        0: {
          coverflowEffect: { rotate: 32, stretch: -20, depth: 140, modifier: 1 },
        },
        640: {
          coverflowEffect: { rotate: 40, stretch: -28, depth: 180, modifier: 1.05 },
        },
        1024: {
          coverflowEffect: { rotate: 48, stretch: -36, depth: 220, modifier: 1.1 },
        },
      },
    });
  }

  if (filtersEl) {
    filtersEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.getAttribute('data-filter') || 'all';
      filtersEl.querySelectorAll('.project-pill').forEach(function (pill) {
        pill.classList.toggle('project-pill-active', pill === btn);
      });
      initSwiper();
    });
  }

  initSwiper();

  root.addEventListener('click', function (e) {
    var link = e.target.closest('.project-slide-link');
    var slide = e.target.closest('.swiper-slide');
    if (!link || !slide || slide.classList.contains('swiper-slide-hidden')) return;
    if (!slide.classList.contains('swiper-slide-active')) {
      e.preventDefault();
    }
  });

  window.addEventListener('resize', function () {
    if (swiper) swiper.update();
  });
})();
