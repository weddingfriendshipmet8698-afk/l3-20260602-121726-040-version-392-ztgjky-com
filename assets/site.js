(function () {
    const qs = (selector, root) => (root || document).querySelector(selector);
    const qsa = (selector, root) => Array.from((root || document).querySelectorAll(selector));

    function text(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMenu() {
        const button = qs('[data-menu-toggle]');
        const nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        const slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        const slides = qsa('[data-hero-slide]', slider);
        const dots = qsa('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        const grid = qs('[data-filter-grid]');
        if (!grid) {
            return;
        }
        const cards = qsa('.movie-card', grid);
        const searchInput = qs('[data-search-input]');
        const regionFilter = qs('[data-region-filter]');
        const typeFilter = qs('[data-type-filter]');
        const yearFilter = qs('[data-year-filter]');

        function apply() {
            const keyword = text(searchInput && searchInput.value);
            const region = text(regionFilter && regionFilter.value);
            const type = text(typeFilter && typeFilter.value);
            const year = text(yearFilter && yearFilter.value);
            cards.forEach(function (card) {
                const haystack = text([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                const matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!region || text(card.dataset.region).indexOf(region) !== -1) &&
                    (!type || text(card.dataset.type).indexOf(type) !== -1) &&
                    (!year || text(card.dataset.year).indexOf(year) !== -1);
                card.classList.toggle('is-hidden', !matched);
            });
        }

        [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q && searchInput) {
            searchInput.value = q;
            apply();
        }
    }

    function initPlayers() {
        qsa('.player-shell').forEach(function (shell) {
            const video = qs('video', shell);
            const button = qs('.play-button', shell);
            const status = qs('.player-status', shell);
            const stream = shell.getAttribute('data-stream');
            if (!video || !button || !stream) {
                return;
            }

            function prepare() {
                if (video.dataset.ready === '1') {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    shell.hlsInstance = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
                video.dataset.ready = '1';
            }

            function play() {
                prepare();
                if (status) {
                    status.textContent = '播放准备中';
                }
                video.play().then(function () {
                    shell.classList.add('is-playing');
                }).catch(function () {
                    if (status) {
                        status.textContent = '请再次点击播放';
                    }
                });
            }

            button.addEventListener('click', play);
            shell.addEventListener('click', function (event) {
                if (event.target === video || shell.classList.contains('is-playing')) {
                    return;
                }
                play();
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
