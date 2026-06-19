(function (global) {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-target]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function start() {
      timer = global.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        global.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-target")) || 0);
        restart();
      });
    });

    root.addEventListener("mouseenter", function () {
      if (timer) {
        global.clearInterval(timer);
      }
    });

    root.addEventListener("mouseleave", restart);
    start();
  }

  function initFilters() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));
    if (!items.length) {
      return;
    }
    var keywordInput = document.querySelector("[data-filter-keyword]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var status = document.querySelector("[data-filter-status]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(global.location.search);
    var initialQuery = params.get("q") || "";

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalized(keywordInput ? keywordInput.value : "");
      var category = normalized(categorySelect ? categorySelect.value : "");
      var year = normalized(yearSelect ? yearSelect.value : "");
      var visible = 0;

      items.forEach(function (item) {
        var pool = [
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-tags"),
          item.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var itemCategory = normalized(item.getAttribute("data-category"));
        var itemYear = normalized(item.getAttribute("data-year"));
        var matched = true;

        if (keyword && pool.indexOf(keyword) === -1) {
          matched = false;
        }
        if (category && itemCategory !== category) {
          matched = false;
        }
        if (year && itemYear !== year) {
          matched = false;
        }

        item.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible > 0 ? "筛选结果" : "暂无匹配结果";
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keywordInput, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function mountPlayer(source) {
    ready(function () {
      var shell = document.querySelector("[data-player]");
      if (!shell) {
        return;
      }
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      var started = false;
      var hls = null;

      function reveal() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        video.setAttribute("controls", "controls");
      }

      function playVideo() {
        video.play().catch(function () {});
      }

      function begin() {
        reveal();
        if (started) {
          playVideo();
          return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.load();
          playVideo();
          return;
        }

        if (global.Hls && global.Hls.isSupported()) {
          hls = new global.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(global.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }

        video.src = source;
        video.load();
        playVideo();
      }

      if (cover) {
        cover.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      global.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  global.StaticCinema = {
    mountPlayer: mountPlayer
  };
}(window));
