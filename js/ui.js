import * as el from './elements.js';
import { initializePlayer } from './timeline.js';

const LAST_URL_KEY = 'axinwave-lastVideoURL';
const LAST_TIME_KEY = 'axinwave-lastVideoTime';

let controlsTimer;
let iconTimer;

const hideControls = () => {
    if (el.mainVideo.paused || el.effectsPanel.classList.contains('show')) return;
    controlsTimer = setTimeout(() => {
        el.container.classList.remove("show-controls");
    }, 3000);
};

export const showCenterIcon = (iconClass) => {
    clearTimeout(iconTimer);
    el.centerIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    el.centerIcon.classList.add("show");
    iconTimer = setTimeout(() => {
        el.centerIcon.classList.remove("show");
    }, 800);
};

export const formatTime = time => {
    let seconds = Math.floor(time % 60),
        minutes = Math.floor(time / 60) % 60,
        hours = Math.floor(time / 3600);

    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    hours = hours < 10 ? `0${hours}` : hours;

    if (hours == 0) {
        return `${minutes}:${seconds}`
    }
    return `${hours}:${minutes}:${seconds}`;
};

const loadVideo = (src, isFromPersistence = false) => {
    el.mainVideo.src = src;

    if (!src.startsWith('blob:')) {
        localStorage.setItem(LAST_URL_KEY, src);
    } else {
        localStorage.removeItem(LAST_URL_KEY);
        localStorage.removeItem(LAST_TIME_KEY);
    }
    
    if (!isFromPersistence) {
        localStorage.setItem(LAST_TIME_KEY, '0');
    }

    initializePlayer();
    
    el.mainVideo.addEventListener('loadstart', () => {
        el.videoLoadMenu.classList.remove('show');
        el.container.classList.add("show-controls");
        hideControls();
    }, { once: true });

    // --- MODIFIED: Autoplay logic is now smarter ---
    el.mainVideo.addEventListener('canplay', () => {
        const playPromise = el.mainVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Autoplay was prevented. This is expected on first visit.
                // For restored sessions, we will try muted autoplay.
                if (error.name === 'NotAllowedError' && isFromPersistence) {
                    el.mainVideo.muted = true;
                    el.mainVideo.play();
                    
                    // Listen for the first user interaction to unmute.
                    const unmuteOnInteraction = () => {
                        el.mainVideo.muted = false;
                        // The 'volumechange' event in controls.js will handle the UI update.
                    };
                    document.addEventListener('click', unmuteOnInteraction, { once: true });
                    document.addEventListener('keydown', unmuteOnInteraction, { once: true });
                }
            });
        }
    }, { once: true });

    el.mainVideo.addEventListener('error', () => {
        alert("Failed to load video. Please check the URL or file.");
        localStorage.removeItem(LAST_URL_KEY);
        el.videoLoadMenu.classList.add('show');
    }, { once: true });
};

export function setupUIListeners() {
    const initializeSession = () => {
        const lastVideoURL = localStorage.getItem(LAST_URL_KEY);
        if (lastVideoURL) {
            loadVideo(lastVideoURL, true);
        } else {
            el.videoLoadMenu.classList.add("show");
        }
    };
    initializeSession();

    el.container.addEventListener("mousemove", () => {
        if (el.mainVideo.readyState === 0) return;
        el.container.classList.add("show-controls");
        clearTimeout(controlsTimer);
        hideControls();
    });

    el.speedBtn.addEventListener("click", () => el.speedOptions.classList.toggle("show"));
    
    document.addEventListener("click", e => {
        if (e.target.tagName !== "SPAN" || e.target.className !== "material-symbols-rounded") {
            el.speedOptions.classList.remove("show");
        }
    });

    el.openEffectsPanelBtn.addEventListener('click', () => el.effectsPanel.classList.toggle('show'));
    el.closeEffectsPanelBtn.addEventListener('click', () => el.effectsPanel.classList.remove('show'));
    el.closeMenuBtn.addEventListener('click', () => el.videoLoadMenu.classList.remove('show'));

    el.loadUrlBtn.addEventListener('click', () => {
        const url = el.urlInput.value.trim();
        if (url) {
            loadVideo(url, false);
        }
    });

    el.browseFileBtn.addEventListener('click', () => el.fileInput.click());
    el.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            loadVideo(fileURL, false);
        }
    });
}