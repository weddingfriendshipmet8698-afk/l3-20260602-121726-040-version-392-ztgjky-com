(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navLinks = document.querySelector('[data-nav-links]');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let activeIndex = 0;

        const setSlide = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                setSlide(activeIndex + 1);
            }, 5200);
        }
    }

    const normalize = function (value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const filterInput = document.querySelector('[data-filter-input]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));

    if (filterInput && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery) {
            filterInput.value = initialQuery;
        }

        const applyFilters = function () {
            const query = normalize(filterInput.value);
            const year = yearFilter ? normalize(yearFilter.value) : '';
            const type = typeFilter ? normalize(typeFilter.value) : '';

            cards.forEach(function (card) {
                const text = normalize(card.getAttribute('data-search'));
                const cardYear = normalize(card.getAttribute('data-year'));
                const cardType = normalize(card.getAttribute('data-type'));
                const queryMatched = !query || text.indexOf(query) !== -1;
                const yearMatched = !year || cardYear === year;
                const typeMatched = !type || cardType === type;

                card.classList.toggle('hidden-by-filter', !(queryMatched && yearMatched && typeMatched));
            });
        };

        filterInput.addEventListener('input', applyFilters);

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }

        applyFilters();
    }
}());

function initMoviePlayer(videoId, buttonId, sourceUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);

    if (!video || !button || !sourceUrl) {
        return;
    }

    let hlsInstance = null;
    let attached = false;

    const attachSource = function () {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        attached = true;
    };

    const startPlayback = function () {
        attachSource();
        button.classList.add('is-hidden');
        video.classList.add('is-active');

        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    };

    button.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
            hlsInstance.stopLoad();
        }
    });
}
