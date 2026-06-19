(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    }

    var filterForm = document.querySelector("[data-filter-form]");
    var filterList = document.querySelector("[data-filter-list]");
    if (filterForm && filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var incoming = params.get("q");
      if (incoming && filterForm.elements.keyword) {
        filterForm.elements.keyword.value = incoming;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function runFilter() {
        var keyword = normalize(filterForm.elements.keyword && filterForm.elements.keyword.value);
        var category = normalize(filterForm.elements.category && filterForm.elements.category.value);
        var year = normalize(filterForm.elements.year && filterForm.elements.year.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre
          ].join(" "));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedCategory = !category || normalize(card.dataset.category) === category;
          var matchedYear = !year || normalize(card.dataset.year) === year;
          card.classList.toggle("is-hidden", !(matchedKeyword && matchedCategory && matchedYear));
        });
      }

      filterForm.addEventListener("input", runFilter);
      filterForm.addEventListener("change", runFilter);
      filterForm.addEventListener("reset", function () {
        window.setTimeout(runFilter, 0);
      });
      runFilter();
    }
  });

  window.initializeMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
      return;
    }

    var hlsInstance = null;

    function tryPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    function bindSource() {
      if (video.dataset.bound === "1") {
        return;
      }
      video.dataset.bound = "1";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", tryPlay, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, tryPlay);
      } else {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", tryPlay, { once: true });
      }
    }

    function startPlayback() {
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      bindSource();
      if (video.dataset.bound === "1" && video.readyState > 0) {
        tryPlay();
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.dataset.bound !== "1") {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
