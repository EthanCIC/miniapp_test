import { startGame, handleActionButton } from './game.js';
import { init, updateMoleHeight } from './ui.js';
import { enableDevMode } from '../../accelerometer.js';

document.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('actionButton').addEventListener('click', handleActionButton);
    document.getElementById('mole').style.display = 'block';
    
    // 啟用開發者模式（顯示加速度圖表）
    // 如果不需要顯示加速度圖表，請註釋掉下面這行
    enableDevMode();
});

// 導出需要在其他模塊中使用的函數
export { updateMoleHeight };