import * as el from './elements.js';
import { showCenterIcon } from './ui.js';

export function setupKeyboardShortcuts() {
    document.addEventListener("keydown", e => {
        const isInputActive = document.activeElement.tagName === "INPUT";
        
        if (e.key === "Escape") {
            if (el.videoLoadMenu.classList.contains("show")) {
                el.videoLoadMenu.classList.remove("show");
                return;
            }
            if (el.effectsPanel.classList.contains("show")) {
                el.effectsPanel.classList.remove("show");
                return;
            }
        }
        
        if ((el.videoLoadMenu.classList.contains("show") || el.effectsPanel.classList.contains("show")) && e.key !== "Escape") {
            if (document.activeElement === el.urlInput) return;
            if (e.key.toLowerCase() === 'e' || (e.key === '/' && (e.ctrlKey || e.metaKey))) {
                // Allow shortcut to proceed to toggle the menu
            } else {
                return; 
            }
        }

        switch (e.key.toLowerCase()) {
            case "/":
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    // MODIFIED: Allow toggling the load menu at any time.
                    el.videoLoadMenu.classList.toggle("show");
                    
                    // If the menu is now open, pause the video and focus the input.
                    if (el.videoLoadMenu.classList.contains("show")) {
                        el.mainVideo.pause();
                        el.urlInput.focus();
                    }
                }
                break;
            case " ": case "k":
                if (!isInputActive) {
                    e.preventDefault();
                    el.playPauseBtn.click();
                }
                break;
            case "f":
                el.fullScreenBtn.click();
                break;
            case "m":
                el.volumeBtn.click();
                break;
            case "l":
                 el.loopBtn.click();
                 break;
            case "arrowleft":
                el.mainVideo.currentTime -= 5;
                showCenterIcon('fa-backward');
                break;
            case "arrowright":
                el.mainVideo.currentTime += 10;
                showCenterIcon('fa-forward');
                break;
            case "arrowup":
                e.preventDefault();
                el.volumeSlider.value = Math.min(parseFloat(el.volumeSlider.value) + 0.1, el.volumeSlider.max);
                el.volumeSlider.dispatchEvent(new Event('input')); 
                break;
            case "arrowdown":
                e.preventDefault();
                el.volumeSlider.value = Math.max(parseFloat(el.volumeSlider.value) - 0.1, 0);
                el.volumeSlider.dispatchEvent(new Event('input'));
                break;
            case "e":
                e.preventDefault();
                el.effectsPanel.classList.toggle('show');
                break;
            case "h":
                if (!isInputActive) el.flipHorizontalBtn.click();
                break;
            case "v":
                if (!isInputActive) el.flipVerticalBtn.click();
                break;
            case "s":
                if (!isInputActive) {
                    e.preventDefault();
                    el.screenshotBtn.click();
                }
                break;
        }
    });
}