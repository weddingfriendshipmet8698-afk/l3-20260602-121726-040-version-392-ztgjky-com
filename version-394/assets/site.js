(function () {
  var menuButton = document.querySelector('.menu-button');
  var nav = document.querySelector('.site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearSelect = document.querySelector('[data-year-select]');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var noMatch = document.querySelector('[data-no-match]');

  function filterItems() {
    if (!items.length) {
      return;
    }
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    items.forEach(function (item) {
      var haystack = [
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-category'),
        item.textContent
      ].join(' ').toLowerCase();
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !year || item.getAttribute('data-year') === year;
      var show = matchesKeyword && matchesYear;
      item.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (noMatch) {
      noMatch.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', filterItems);
  }
})();
