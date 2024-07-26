import { updateCircleSize, showFeedback, updateScore, startFeverMode, endFeverMode, startMoleShrinking } from './ui.js';
import { handleMotion, requestMotionPermission } from './accelerometer.js';

let tg = window.Telegram.WebApp;
let isGameRunning = false;
let circleSize = 280;
let baseShrinkSpeed = 4;
let shrinkSpeed = baseShrinkSpeed;
let shakeThreshold = 25;
let isInTimeWindow = false;
let isFeverMode = false;
let currentCycleScoreChanged = false;
let animationId;
let lastTimestamp = 0;
const FRAME_DURATION = 1000 / 60;
const TIME_WINDOW_SIZE = 150;

export function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    updateScore(0, true);
    document.getElementById('actionButton').style.opacity = '0';
    document.getElementById('actionButton').style.visibility = 'hidden';
    document.getElementById('actionButton').style.pointerEvents = 'none';
    requestMotionPermission();
    startShrinking();
}

export function handleActionButton() {
    if (!isGameRunning) {
        const mole = document.getElementById('mole');
        mole.style.transform = 'translateY(75%) scaleX(0.5)';
        startGame();
    }
}

function startShrinking() {
    circleSize = 280;
    updateCircleSize(circleSize);
    currentCycleScoreChanged = false;
    isInTimeWindow = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    lastTimestamp = 0;
    animationId = requestAnimationFrame(animateCircle);
}

function animateCircle(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const elapsed = timestamp - lastTimestamp;

    if (elapsed >= FRAME_DURATION) {
        if (!isFeverMode && isGameRunning) {
            circleSize -= shrinkSpeed;
            if (circleSize <= 0) {
                if (!currentCycleScoreChanged) {
                    updateScore(-1);
                    showFeedback('rgba(244, 67, 54, 0.6)');
                    vibrateDevice();
                }
                resetCircle();
            }
            updateCircleSize(circleSize);
            checkCircleInTimeWindow();
        }
        lastTimestamp = timestamp;
    }

    animationId = requestAnimationFrame(animateCircle);
}

function resetCircle() {
    circleSize = 280;
    updateCircleSize(circleSize);
    currentCycleScoreChanged = false;
    isInTimeWindow = false;
    updateShrinkSpeed();
}

function checkCircleInTimeWindow() {
    if (circleSize <= TIME_WINDOW_SIZE + 5 && !isInTimeWindow) {
        isInTimeWindow = true;
        vibrateDevice();
    } else if (circleSize > TIME_WINDOW_SIZE + 5) {
        isInTimeWindow = false;
    }
}

export function checkShakeTiming() {
    if (isInTimeWindow && !currentCycleScoreChanged) {
        updateScore(1);
        showFeedback('rgba(76, 175, 80, 0.6)');
        currentCycleScoreChanged = true;
        resetCircle();
    } else if (!isInTimeWindow && !currentCycleScoreChanged) {
        updateScore(-1);
        showFeedback('rgba(244, 67, 54, 0.6)');
        currentCycleScoreChanged = true;
        resetCircle();
    }
}

function updateShrinkSpeed() {
    shrinkSpeed = baseShrinkSpeed + (getScore() * 0.4);
}

function vibrateDevice() {
    tg.HapticFeedback.impactOccurred('heavy');
}

export function endGame(isEarlyEnd = false) {
    isGameRunning = false;
    isFeverMode = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    window.removeEventListener('devicemotion', handleMotion);
    const actionButton = document.getElementById('actionButton');
    actionButton.textContent = 'Play Again';
    actionButton.style.opacity = '1';
    actionButton.style.visibility = 'visible';
    actionButton.style.pointerEvents = 'auto';
    document.getElementById('scoreDisplay').textContent = `${getScore()} $DEEK`;
    document.getElementById('circle').style.display = 'block';
    document.getElementById('timeWindow').style.display = 'block';

    if (!isEarlyEnd) {
        setTimeout(startMoleShrinking, 3000);
    }
}

export { isGameRunning, isFeverMode };