export const container = document.querySelector(".container");
export const mainVideo = container.querySelector("video");
export const videoTimeline = container.querySelector(".video-timeline");
export const progressBar = container.querySelector(".progress-bar");

// --- UPDATED SELECTORS ---
export const volumeBtn = container.querySelector(".volume");
export const volumeSlider = container.querySelector(".volume-slider");
export const loopBtn = container.querySelector(".loop");
export const skipBackward = container.querySelector(".skip-backward");
export const skipForward = container.querySelector(".skip-forward");
export const playPauseBtn = container.querySelector(".play-pause");
export const speedBtn = container.querySelector(".playback-speed");
export const pipBtn = container.querySelector(".pic-in-pic");
export const fullScreenBtn = container.querySelector(".fullscreen");
// --- END UPDATED SELECTORS ---

export const currentVidTime = container.querySelector(".current-time");
export const videoDuration = container.querySelector(".video-duration");
export const speedOptions = container.querySelector(".speed-options");
export const centerIcon = container.querySelector(".center-icon");
export const videoLoadMenu = container.querySelector(".video-load-menu");
export const closeMenuBtn = videoLoadMenu.querySelector(".close-menu");
export const urlInput = videoLoadMenu.querySelector("#video-url");
export const loadUrlBtn = videoLoadMenu.querySelector(".load-url-btn");
export const browseFileBtn = videoLoadMenu.querySelector(".browse-file-btn");
export const fileInput = videoLoadMenu.querySelector(".file-input");

// --- NEW SELECTORS for dynamic tooltips ---
export const playPauseTooltip = playPauseBtn.querySelector(".tooltip-text");
export const volumeTooltip = volumeBtn.closest('.tooltip-container').querySelector(".tooltip-text");
export const fullscreenTooltip = fullScreenBtn.querySelector(".tooltip-text");

// --- NEW: Effects Panel Selectors ---
export const effectsPanel = container.querySelector(".effects-panel");
export const openEffectsPanelBtn = container.querySelector(".open-effects-panel");
export const closeEffectsPanelBtn = effectsPanel.querySelector(".close-panel");
export const filterSliders = effectsPanel.querySelectorAll(".filter-row input[type='range']");
export const resetFiltersBtn = effectsPanel.querySelector("#reset-filters-btn");
export const flipHorizontalBtn = effectsPanel.querySelector(".flip-horizontal-btn");
export const flipVerticalBtn = effectsPanel.querySelector(".flip-vertical-btn");
export const screenshotBtn = effectsPanel.querySelector(".screenshot-btn");