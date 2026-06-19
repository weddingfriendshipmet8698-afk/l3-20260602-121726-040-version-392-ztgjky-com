import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    const status = shell.querySelector('[data-video-status]');
    const source = shell.dataset.hlsSource;
    let initialized = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function initialize() {
        if (!video || !source || initialized) {
            return;
        }

        initialized = true;
        setStatus('正在连接高清线路');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('线路已就绪');
            }, { once: true });
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 60
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('线路已就绪');
            });
            hls.on(Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    setStatus('线路暂时繁忙');
                }
            });
        } else {
            video.src = source;
            setStatus('使用浏览器原生播放');
        }
    }

    function play() {
        initialize();
        shell.classList.add('is-playing');
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                setStatus('请再次点击播放');
                shell.classList.remove('is-playing');
            });
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }
}

document.querySelectorAll('[data-hls-source]').forEach(setupPlayer);
