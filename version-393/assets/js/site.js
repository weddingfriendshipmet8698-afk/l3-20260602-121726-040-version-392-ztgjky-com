(function () {
    const navToggle = document.querySelector('[data-mobile-toggle]');
    const nav = document.querySelector('[data-nav]');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.visibility = 'hidden';
            const parent = image.closest('.poster-frame, .detail-poster, .rank-cover, .side-link, .hero-poster');
            if (parent) {
                parent.classList.add('cover-waiting');
            }
        }, { once: true });
    });

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    const heroSearchForm = document.querySelector('[data-hero-search]');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = heroSearchForm.querySelector('input');
            const query = input ? input.value.trim() : '';
            window.location.href = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
        });
    }

    const filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
        const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
        const keywordInput = filterForm.querySelector('[name="keyword"]');
        const yearSelect = filterForm.querySelector('[name="year"]');
        const typeSelect = filterForm.querySelector('[name="type"]');
        const countBox = document.querySelector('[data-filter-count]');

        function applyFilter() {
            const keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
            const year = yearSelect && yearSelect.value;
            const type = typeSelect && typeSelect.value;
            let visible = 0;

            cards.forEach(function (card) {
                const text = (card.dataset.search || '').toLowerCase();
                const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchesYear = !year || card.dataset.year === year;
                const matchesType = !type || card.dataset.type === type;
                const show = matchesKeyword && matchesYear && matchesType;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (countBox) {
                countBox.textContent = String(visible);
            }
        }

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });
        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }

    const searchPage = document.querySelector('[data-search-page]');
    if (searchPage && window.MOVIE_SEARCH_DATA) {
        const input = searchPage.querySelector('[name="keyword"]');
        const typeSelect = searchPage.querySelector('[name="type"]');
        const regionSelect = searchPage.querySelector('[name="region"]');
        const resultBox = document.querySelector('[data-search-results]');
        const statusBox = document.querySelector('[data-search-status]');
        const params = new URLSearchParams(window.location.search);

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function renderResults() {
            const keyword = (input && input.value || '').trim().toLowerCase();
            const type = typeSelect && typeSelect.value;
            const region = regionSelect && regionSelect.value;
            const matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                const text = movie.search.toLowerCase();
                const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchesType = !type || movie.type === type;
                const matchesRegion = !region || movie.region.indexOf(region) !== -1;
                return matchesKeyword && matchesType && matchesRegion;
            }).slice(0, 80);

            if (statusBox) {
                statusBox.textContent = matches.length ? '找到 ' + matches.length + ' 个相关结果' : '未找到相关结果';
            }

            if (!resultBox) {
                return;
            }

            if (!matches.length) {
                resultBox.innerHTML = '<div class="search-empty">请更换关键词、类型或地区后再次搜索。</div>';
                return;
            }

            resultBox.innerHTML = matches.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '    <a class="poster-frame" href="' + movie.url + '">',
                    '        <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">',
                    '        <span class="badge">' + escapeHtml(movie.year) + '</span>',
                    '    </a>',
                    '    <div class="card-body">',
                    '        <h3 class="card-title"><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '        <div class="meta-row">',
                    '            <span class="meta-pill">' + escapeHtml(movie.region) + '</span>',
                    '            <span class="meta-pill">' + escapeHtml(movie.type) + '</span>',
                    '        </div>',
                    '        <p class="card-desc">' + escapeHtml(movie.line) + '</p>',
                    '    </div>',
                    '</article>'
                ].join('\n');
            }).join('\n');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        searchPage.addEventListener('submit', function (event) {
            event.preventDefault();
            renderResults();
        });
        [input, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', renderResults);
                control.addEventListener('change', renderResults);
            }
        });
        renderResults();
    }
})();
