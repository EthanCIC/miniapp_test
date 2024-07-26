console.log('main.js is being executed');

import { startGame, handleActionButton } from './game.js';
import { init, updateMoleHeight } from './ui.js';
import { enableDevMode, requestMotionPermission } from './accelerometer.js';

console.log('main.js: All imports completed');

document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js: DOM fully loaded');
    init();
    console.log('main.js: Game initialized');
    const actionButton = document.getElementById('actionButton');
    actionButton.addEventListener('click', () => {
        console.log('main.js: Action button clicked');
        handleActionButton();
    });
    document.getElementById('mole').style.display = 'block';
    
    enableDevMode();
    console.log('main.js: Dev mode enabled');
});

console.log('main.js: DOMContentLoaded event listener set up');