(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      if (slides.length < 2) {
        return;
      }
      var index = slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      });
      if (index < 0) {
        index = 0;
      }
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var scopeId = panel.getAttribute("data-filter-scope");
      var scope = document.getElementById(scopeId);
      if (!scope) {
        return;
      }
      var textInput = panel.querySelector("[data-text-filter]");
      var typeSelect = panel.querySelector("[data-type-filter]");
      var yearSelect = panel.querySelector("[data-year-filter]");
      var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-filter-item"));
      function apply() {
        var text = normalize(textInput && textInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        items.forEach(function (item) {
          var haystack = normalize(item.getAttribute("data-title") + " " + item.getAttribute("data-keywords"));
          var itemType = normalize(item.getAttribute("data-type"));
          var itemYear = normalize(item.getAttribute("data-year"));
          var visible = (!text || haystack.indexOf(text) !== -1) && (!type || itemType.indexOf(type) !== -1) && (!year || itemYear.indexOf(year) !== -1);
          item.classList.toggle("is-hidden", !visible);
        });
      }
      [textInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function safe(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function setupSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.getElementById("site-search-input");
    var results = document.querySelector("[data-search-results]");
    var data = window.SEARCH_DATA || [];
    if (!form || !input || !results || !data.length) {
      return;
    }
    function card(movie) {
      return '<article class="movie-card">' +
        '<a href="' + safe(movie.url) + '" class="movie-card-link">' +
        '<span class="movie-cover"><img src="' + safe(movie.cover) + '" alt="' + safe(movie.title) + '" loading="lazy"><span class="movie-cover-mask"></span><span class="movie-play">▶</span><span class="movie-badge">' + safe(movie.region) + '</span></span>' +
        '<span class="movie-body"><strong>' + safe(movie.title) + '</strong><span class="movie-line">' + safe(movie.oneLine) + '</span><span class="movie-meta">' + safe(movie.type) + ' · ' + safe(movie.year) + ' · ' + safe(movie.genre) + '</span></span>' +
        '</a></article>';
    }
    function render() {
      var q = normalize(input.value);
      var list = data.filter(function (movie) {
        if (!q) {
          return true;
        }
        return normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags).indexOf(q) !== -1;
      }).slice(0, 96);
      results.innerHTML = list.map(card).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener("input", render);
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      if (!video || !overlay) {
        return;
      }
      var src = video.getAttribute("data-src");
      var attached = false;
      var hls = null;
      function attach() {
        if (attached || !src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        attached = true;
      }
      function play() {
        attach();
        video.controls = true;
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }
      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          player.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupPlayers();
  });
})();
