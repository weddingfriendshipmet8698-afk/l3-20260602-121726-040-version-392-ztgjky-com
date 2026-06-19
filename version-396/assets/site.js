(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', nav.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        card.classList.toggle('is-filtered', keyword && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener('input', apply);
    apply();
  }

  function setupSort() {
    var select = document.querySelector('[data-sort-select]');
    var grid = document.querySelector('[data-sortable-grid]');
    if (!select || !grid) {
      return;
    }
    var original = Array.prototype.slice.call(grid.children);

    function titleOf(node) {
      return normalize(node.dataset.title);
    }

    function yearOf(node) {
      var year = parseInt(node.dataset.year || '0', 10);
      return isNaN(year) ? 0 : year;
    }

    function render(items) {
      items.forEach(function (item) {
        grid.appendChild(item);
      });
    }

    select.addEventListener('change', function () {
      var items = Array.prototype.slice.call(grid.children);
      if (select.value === 'rank-default') {
        render(original);
        return;
      }
      if (select.value === 'year-asc') {
        items.sort(function (a, b) {
          return yearOf(a) - yearOf(b) || titleOf(a).localeCompare(titleOf(b), 'zh-Hans-CN');
        });
      } else if (select.value === 'title-asc') {
        items.sort(function (a, b) {
          return titleOf(a).localeCompare(titleOf(b), 'zh-Hans-CN');
        });
      } else {
        items.sort(function (a, b) {
          return yearOf(b) - yearOf(a) || titleOf(a).localeCompare(titleOf(b), 'zh-Hans-CN');
        });
      }
      render(items);
    });
  }

  function setupImageFallback() {
    Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
      });
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-play-trigger]');
    if (!video || !button) {
      return;
    }
    var loaded = false;

    function start() {
      var stream = video.getAttribute('data-hls');
      if (!stream) {
        return;
      }
      button.classList.add('is-hidden');
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        start();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSort();
    setupImageFallback();
    setupPlayer();
  });
})();
