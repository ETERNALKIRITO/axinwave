import * as el from './elements.js';
import { formatTime } from './ui.js';

// --- NEW: Keys for localStorage ---
const LAST_TIME_KEY = 'axinwave-lastVideoTime';

export function initializePlayer() {
    if (el.mainVideo.readyState > 0 && !isNaN(el.mainVideo.duration)) {
        el.videoDuration.innerText = formatTime(el.mainVideo.duration);
        el.currentVidTime.innerText = formatTime(el.mainVideo.currentTime);
    } else {
        el.videoDuration.innerText = "--:--";
        el.currentVidTime.innerText = "--:--";
    }
}

const draggableProgressBar = e => {
    let timelineWidth = el.videoTimeline.clientWidth;
    el.progressBar.style.width = `${e.offsetX}px`;
    el.mainVideo.currentTime = (e.offsetX / timelineWidth) * el.mainVideo.duration;
    el.currentVidTime.innerText = formatTime(el.mainVideo.currentTime);
};

export function setupTimelineListeners() {
    initializePlayer();

    // --- MODIFIED: Restore playback time on video load ---
    el.mainVideo.addEventListener("loadedmetadata", () => {
        initializePlayer();
        const lastVideoTime = localStorage.getItem(LAST_TIME_KEY);
        // Only restore time if it's a valid number and the video is from a URL
        if (lastVideoTime && !isNaN(lastVideoTime) && !el.mainVideo.src.startsWith('blob:')) {
            el.mainVideo.currentTime = parseFloat(lastVideoTime);
        }
    });

    // --- MODIFIED: Save playback time periodically ---
    let lastSaveTime = 0;
    el.mainVideo.addEventListener("timeupdate", () => {
        if (!isNaN(el.mainVideo.duration)) {
            // Update UI
            let percent = (el.mainVideo.currentTime / el.mainVideo.duration) * 100;
            el.progressBar.style.width = `${percent}%`;
            el.currentVidTime.innerText = formatTime(el.mainVideo.currentTime);

            // Save time to localStorage every 3 seconds (throttling)
            const now = Date.now();
            if (!el.mainVideo.paused && !el.mainVideo.src.startsWith('blob:') && now - lastSaveTime > 3000) {
                localStorage.setItem(LAST_TIME_KEY, el.mainVideo.currentTime.toString());
                lastSaveTime = now;
            }
        }
    });

    el.videoTimeline.addEventListener("mousemove", e => {
        let timelineWidth = el.videoTimeline.clientWidth;
        let offsetX = e.offsetX;
        if (!isNaN(el.mainVideo.duration)) {
            let percent = Math.floor((offsetX / timelineWidth) * el.mainVideo.duration);
            const progressTime = el.videoTimeline.querySelector("span");
            offsetX = offsetX < 20 ? 20 : (offsetX > timelineWidth - 20) ? timelineWidth - 20 : offsetX;
            progressTime.style.left = `${offsetX}px`;
            progressTime.innerText = formatTime(percent);
        }
    });

    el.videoTimeline.addEventListener("click", e => {
        let timelineWidth = el.videoTimeline.clientWidth;
        el.mainVideo.currentTime = (e.offsetX / timelineWidth) * el.mainVideo.duration;
    });

    el.videoTimeline.addEventListener("mousedown", () => el.videoTimeline.addEventListener("mousemove", draggableProgressBar));
    document.addEventListener("mouseup", () => el.videoTimeline.removeEventListener("mousemove", draggableProgressBar));
}