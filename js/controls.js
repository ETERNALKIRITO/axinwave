import * as el from './elements.js';
import { showCenterIcon } from './ui.js';

let audioCtx;
let gainNode;

function setupAudioContext() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(el.mainVideo);
        gainNode = audioCtx.createGain();
        source.connect(gainNode).connect(audioCtx.destination);
        // Sync gain node with initial video volume
        gainNode.gain.value = el.volumeSlider.value;
    } catch (e) {
        console.error("Web Audio API setup failed:", e);
        alert("Your browser does not support the audio booster feature.");
    }
}

// --- Effects Panel Logic (no changes) ---
const defaultFilters = {
    blur: 0, brightness: 100, contrast: 100, grayscale: 0,
    rotation: 0, inversion: 0, saturation: 100, sepia: 0
};

function applyFilters() {
    const filterFunctions = [];
    const currentFilters = {};
    el.filterSliders.forEach(slider => {
        currentFilters[slider.name] = parseFloat(slider.value);
    });

    if (currentFilters.blur > 0) filterFunctions.push(`blur(${currentFilters.blur}px)`);
    if (currentFilters.brightness !== 100) filterFunctions.push(`brightness(${currentFilters.brightness}%)`);
    if (currentFilters.contrast !== 100) filterFunctions.push(`contrast(${currentFilters.contrast}%)`);
    if (currentFilters.grayscale > 0) filterFunctions.push(`grayscale(${currentFilters.grayscale}%)`);
    if (currentFilters.rotation > 0) filterFunctions.push(`hue-rotate(${currentFilters.rotation}deg)`);
    if (currentFilters.inversion > 0) filterFunctions.push(`invert(${currentFilters.inversion}%)`);
    if (currentFilters.saturation !== 100) filterFunctions.push(`saturate(${currentFilters.saturation}%)`);
    if (currentFilters.sepia > 0) filterFunctions.push(`sepia(${currentFilters.sepia}%)`);

    el.mainVideo.style.filter = filterFunctions.length > 0 ? filterFunctions.join(' ') : 'none';
}

function updateValueDisplay(slider) {
    const displaySpan = slider.nextElementSibling;
    if (displaySpan && displaySpan.classList.contains('value-display')) {
        displaySpan.textContent = slider.value;
    }
}

function resetAllFilters() {
    el.filterSliders.forEach(slider => {
        slider.value = defaultFilters[slider.name];
        updateValueDisplay(slider);
    });
    applyFilters();
}

function formatTimeForFilename(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor(totalSeconds % 3600 / 60);
    const s = Math.floor(totalSeconds % 3600 % 60);
    const hStr = h > 0 ? `${h}h` : '';
    const mStr = (m > 0 || h > 0) ? `${h > 0 && m < 10 ? '0' : ''}${m}m` : '0m';
    const sStr = `${s < 10 ? '0' : ''}${s}s`;
    return `${hStr}${mStr}${sStr}`;
}

function takeScreenshot() {
    const canvas = document.createElement('canvas');
    canvas.width = el.mainVideo.videoWidth;
    canvas.height = el.mainVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    const isFlippedH = el.mainVideo.classList.contains('flipped-horizontal');
    const isFlippedV = el.mainVideo.classList.contains('flipped-vertical');
    ctx.save();
    const scaleH = isFlippedH ? -1 : 1;
    const scaleV = isFlippedV ? -1 : 1;
    const transX = isFlippedH ? -canvas.width : 0;
    const transY = isFlippedV ? -canvas.height : 0;
    ctx.translate(transX, transY);
    ctx.scale(scaleH, scaleV);
    ctx.filter = el.mainVideo.style.filter;
    ctx.drawImage(el.mainVideo, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    const timestamp = formatTimeForFilename(el.mainVideo.currentTime);
    const filename = `Screenshot-[${timestamp}].png`;
    canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

export function setupControlsListeners() {
    const togglePlayPause = () => {
        if (!audioCtx) setupAudioContext();
        const isPaused = el.mainVideo.paused;
        el.mainVideo[isPaused ? "play" : "pause"]();
        showCenterIcon(isPaused ? "fa-play" : "fa-pause");
    };
    el.playPauseBtn.addEventListener("click", togglePlayPause);
    el.mainVideo.addEventListener("click", togglePlayPause);
    
    el.mainVideo.addEventListener("play", () => {
        el.playPauseBtn.querySelector("i").className = "fas fa-pause";
        el.playPauseTooltip.textContent = "Pause (k)";
    });
    el.mainVideo.addEventListener("pause", () => {
        el.playPauseBtn.querySelector("i").className = "fas fa-play";
        el.playPauseTooltip.textContent = "Play (k)";
    });
    
    // This function now *only* sets the audio level. The UI is updated by the new event listener.
    function setVolume(value) {
        if (!audioCtx) setupAudioContext();
        
        // Always unmute the video element itself if we are setting volume > 0.
        if (value > 0 && el.mainVideo.muted) {
            el.mainVideo.muted = false;
        }
        
        // Mute the video element if volume is set to 0.
        if (value == 0) {
            el.mainVideo.muted = true;
        }

        if (gainNode) {
            gainNode.gain.value = value;
        }
    }

    el.volumeSlider.addEventListener("input", e => setVolume(e.target.value));

    el.volumeBtn.addEventListener("click", () => {
        if (!audioCtx) setupAudioContext();
        // Toggle muted state directly on the video element
        el.mainVideo.muted = !el.mainVideo.muted;
    });
    
    // --- NEW: This listener keeps the UI (icon, slider) in sync with the video's actual state ---
    el.mainVideo.addEventListener("volumechange", () => {
        const { volume, muted } = el.mainVideo;
        const volumeIcon = el.volumeBtn.querySelector("i");
        if (muted || volume === 0) {
            volumeIcon.className = "fa-solid fa-volume-xmark";
            el.volumeTooltip.textContent = "Unmute (m)";
            el.volumeSlider.value = 0;
        } else {
            volumeIcon.className = "fa-solid fa-volume-high";
            el.volumeTooltip.textContent = "Mute (m)";
            // Sync slider with the gain node's value if it exists, otherwise the video's volume
            el.volumeSlider.value = gainNode ? gainNode.gain.value : volume;
        }
    });

    el.speedOptions.querySelectorAll("li").forEach(option => {
        option.addEventListener("click", () => {
            el.mainVideo.playbackRate = option.dataset.speed;
            el.speedOptions.querySelector(".active").classList.remove("active");
            option.classList.add("active");
        });
    });

    el.skipBackward.addEventListener("click", () => el.mainVideo.currentTime -= 5);
    el.skipForward.addEventListener("click", () => el.mainVideo.currentTime += 10);
    
    el.pipBtn.addEventListener("click", () => el.mainVideo.requestPictureInPicture());
    
    el.fullScreenBtn.addEventListener("click", () => {
        el.container.classList.toggle("fullscreen");
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            el.container.requestFullscreen();
        }
    });

    document.addEventListener("fullscreenchange", () => {
        const icon = el.fullScreenBtn.querySelector("i");
        if (document.fullscreenElement) {
            icon.className = "fa-solid fa-compress";
            el.fullscreenTooltip.textContent = "Exit Fullscreen (f)";
        } else {
            icon.className = "fa-solid fa-expand";
            el.fullscreenTooltip.textContent = "Fullscreen (f)";
        }
    });

    el.loopBtn.addEventListener("click", () => {
        el.loopBtn.classList.toggle("active");
        el.mainVideo.loop = el.loopBtn.classList.contains("active");
    });

    el.volumeSlider.value = 1;

    el.filterSliders.forEach(slider => {
        slider.addEventListener('input', () => {
            updateValueDisplay(slider);
            applyFilters();
        });
    });

    el.resetFiltersBtn.addEventListener('click', resetAllFilters);
    el.flipHorizontalBtn.addEventListener('click', () => el.mainVideo.classList.toggle('flipped-horizontal'));
    el.flipVerticalBtn.addEventListener('click', () => el.mainVideo.classList.toggle('flipped-vertical'));
    el.screenshotBtn.addEventListener('click', takeScreenshot);
}