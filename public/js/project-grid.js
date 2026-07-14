(function () {
  var grid = document.getElementById('project-grid');
  var loadMoreBtn = document.getElementById('project-load-more');
  if (!grid) return;

  var pageSize = 12;
  var visibleCount = pageSize;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card'));

  function updateGrid() {
    cards.forEach(function (card, index) {
      card.classList.toggle('project-card-hidden', index >= visibleCount);
    });

    if (loadMoreBtn) {
      loadMoreBtn.classList.toggle('hidden', visibleCount >= cards.length);
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      visibleCount = Math.min(visibleCount + pageSize, cards.length);
      updateGrid();
      if (typeof AOS !== 'undefined') AOS.refresh();
    });
  }

  updateGrid();
})();
