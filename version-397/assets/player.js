(function () {
    function init(videoId, sourceUrl, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hlsInstance = null;

        if (!video || !button || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            video.setAttribute('data-ready', '1');
        }

        function startPlay() {
            attachSource();
            button.classList.add('hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('hidden');
                });
            }
        }

        button.addEventListener('click', startPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlay();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.MoviePlayer = {
        init: init
    };
})();
