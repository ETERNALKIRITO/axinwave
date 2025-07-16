import { setupUIListeners } from './ui.js';
import { setupTimelineListeners } from './timeline.js';
import { setupControlsListeners } from './controls.js';
import { setupKeyboardShortcuts } from './keyboard.js';

// Initialize all the event listeners from the different modules
setupUIListeners();
setupTimelineListeners();
setupControlsListeners();
setupKeyboardShortcuts();