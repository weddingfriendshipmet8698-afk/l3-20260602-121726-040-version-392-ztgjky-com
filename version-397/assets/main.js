(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var filterRow = document.querySelector('[data-filter-row]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var activeFilter = 'all';

    function applyFilter() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var type = card.getAttribute('data-type') || '';
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchFilter = activeFilter === 'all' || type.indexOf(activeFilter) !== -1 || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle('hidden-card', !(matchQuery && matchFilter));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
        }
        searchInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    if (filterRow) {
        filterRow.addEventListener('click', function (event) {
            var button = event.target.closest('[data-filter]');
            if (!button) {
                return;
            }
            activeFilter = button.getAttribute('data-filter') || 'all';
            Array.prototype.slice.call(filterRow.querySelectorAll('[data-filter]')).forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilter();
        });
    }
})();
