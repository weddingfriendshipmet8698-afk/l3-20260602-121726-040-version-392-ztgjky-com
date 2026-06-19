(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        clearInterval(timer);
        showSlide(i);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function applySearch(form) {
    var root = form.closest('main') || document;
    var list = root.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = form.querySelector('input[type="search"]');
    var query = input ? input.value.trim().toLowerCase() : '';
    Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
      card.classList.toggle('hidden-by-filter', query && text.indexOf(query) === -1);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applySearch(form);
    });
    var input = form.querySelector('input[type="search"]');
    if (input) {
      input.addEventListener('input', function () {
        applySearch(form);
      });
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-buttons]')).forEach(function (box) {
    var root = box.closest('main') || document;
    var list = root.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var buttons = Array.prototype.slice.call(box.querySelectorAll('button'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        Array.prototype.slice.call(list.querySelectorAll('.movie-card')).forEach(function (card) {
          var text = card.textContent + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-type');
          card.classList.toggle('hidden-by-filter', value !== '全部' && text.indexOf(value) === -1);
        });
      });
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var started = false;

  if (!video || !streamUrl) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });
}
