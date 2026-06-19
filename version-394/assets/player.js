(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-url]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var url = player.getAttribute('data-video-url');
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      if (!video || !url) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;

      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      var playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          playVideo();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
