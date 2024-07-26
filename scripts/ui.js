console.log('ui.js is being executed');

let score = 0;

export function init() {
    console.log('ui.js: init function called');
    updateCircleSize(280);
    updateMoleHeight();
}

export function updateCircleSize(size) {
    const circle = document.getElementById('circle');
    circle.style.setProperty('--size', `${Math.max(0, size)}px`);

    const timeWindow = document.getElementById('timeWindow');
    timeWindow.style.width = `${150}px`;
    timeWindow.style.height = `${150}px`;

    if (size <= 150) {
        timeWindow.style.backgroundColor = 'rgba(76, 175, 80, 0.6)';
    } else {
        timeWindow.style.backgroundColor = 'rgba(76, 175, 80, 0.4)';
    }
}

export function showFeedback(color) {
    const feedback = document.getElementById('feedback');
    feedback.style.backgroundColor = color;
    feedback.style.opacity = 0.7;
    setTimeout(() => {
        feedback.style.opacity = 0;
    }, 100);
}

export function updateScore(change = 0, reset = false) {
    if (reset) {
        score = 0;
    } else {
        score = Math.max(0, score + change);
    }
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
    updateMoleHeight();

    if (score >= 10 && !isFeverMode) {
        startFeverMode();
    }
}

export function updateMoleHeight() {
    const mole = document.getElementById('mole');
    const maxScore = 10;
    const visiblePercentage = Math.min(score / maxScore, 1);
    const translateY = 75 - (visiblePercentage * 75);
    const scaleX = 0.5 + (visiblePercentage * 0.8);
    mole.style.transform = `translateY(${translateY}%) scaleX(${scaleX})`;
}

export function startFeverMode() {
    const feverModeDisplay = document.getElementById('feverMode');
    const circle = document.getElementById('circle');
    const timeWindow = document.getElementById('timeWindow');
    const feverCountdown = document.getElementById('feverCountdown');

    feverModeDisplay.style.opacity = 1;
    circle.style.display = 'none';
    timeWindow.style.display = 'none';
    
    let countdownTime = 10;
    feverCountdown.textContent = countdownTime;
    feverCountdown.style.display = 'block';
    
    const feverCountdownInterval = setInterval(() => {
        countdownTime--;
        feverCountdown.textContent = countdownTime;
        if (countdownTime <= 0) {
            clearInterval(feverCountdownInterval);
            endFeverMode();
        }
    }, 1000);
}

export function endFeverMode() {
    const feverModeDisplay = document.getElementById('feverMode');
    const feverCountdown = document.getElementById('feverCountdown');

    feverModeDisplay.style.opacity = 0;
    feverCountdown.style.display = 'none';
    endGame(false);
}

export function startMoleShrinking() {
    const mole = document.getElementById('mole');
    let currentScale = 0.5 + (Math.min(score / 10, 1) * 0.8);
    let currentTranslateY = 75 - (Math.min(score / 10, 1) * 75);

    const shrinkInterval = setInterval(() => {
        currentScale = Math.max(0.5, currentScale - 0.02);
        currentTranslateY = Math.min(75, currentTranslateY + 2);

        mole.style.transform = `translateY(${currentTranslateY}%) scaleX(${currentScale})`;

        if (currentScale <= 0.5 && currentTranslateY >= 75) {
            clearInterval(shrinkInterval);
        }
    }, 50);
}

export function getScore() {
    console.log('ui.js: getScore function called, returning', score);
    return score;
}

console.log('ui.js: All functions exported');
