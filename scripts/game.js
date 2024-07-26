class Game {
    constructor() {
        this.isRunning = false;
        this.score = 0;
        this.circleSize = 280;
        this.baseShrinkSpeed = 4;
        this.shrinkSpeed = this.baseShrinkSpeed;
        this.shakeThreshold = 25;
        this.TIME_WINDOW_SIZE = 150;
        this.isInTimeWindow = false;
        this.isFeverMode = false;
        this.currentCycleScoreChanged = false;
        this.animationId = null;
        this.lastTimestamp = 0;
        this.FRAME_DURATION = 1000 / 60;
        this.moleShakeCount = 0;

        this.elements = {
            gameArea: document.getElementById('gameArea'),
            circle: document.getElementById('circle'),
            timeWindow: document.getElementById('timeWindow'),
            feedback: document.getElementById('feedback'),
            actionButton: document.getElementById('actionButton'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            feverModeDisplay: document.getElementById('feverMode'),
            feverCountdown: document.getElementById('feverCountdown'),
            mole: document.getElementById('mole')
        };

        this.shakeDetector = new ShakeDetector(this.shakeThreshold, () => this.handleShake());
        this.accelerometerChart = new AccelerometerChart('accelerationChart', 'accelerationDisplay', this.shakeThreshold);
    }

    init() {
        this.updateCircleSize();
        this.updateMoleHeight();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.score = 0;
        this.updateScore();
        this.elements.actionButton.style.opacity = '0';
        this.elements.actionButton.style.visibility = 'hidden';
        this.elements.actionButton.style.pointerEvents = 'none';
        this.requestMotionPermission();
        this.startShrinking();
        this.updateMoleHeight();
        this.updateCircleSize();
    }

    requestMotionPermission() {
        if (typeof DeviceMotionEvent?.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', (event) => this.handleMotion(event));
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('devicemotion', (event) => this.handleMotion(event));
        }
    }

    handleMotion(event) {
        if (!this.isRunning) return;
        let acceleration = event.accelerationIncludingGravity;
        let acc = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
        
        this.accelerometerChart.update(acc);
        this.shakeDetector.update(acc);
    }

    handleShake() {
        if (!this.isRunning) return;
        if (this.isFeverMode) {
            this.updateScore(1);
            utils.vibrateDevice();
        } else {
            this.checkShakeTiming();
        }
    }

    startShrinking() {
        this.circleSize = 280;
        this.updateCircleSize();
        this.currentCycleScoreChanged = false;
        this.isInTimeWindow = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.lastTimestamp = 0;
        this.animationId = requestAnimationFrame((timestamp) => this.animateCircle(timestamp));
    }

    animateCircle(timestamp) {
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const elapsed = timestamp - this.lastTimestamp;

        if (elapsed >= this.FRAME_DURATION) {
            if (!this.isFeverMode && this.isRunning) {
                this.circleSize -= this.shrinkSpeed;
                if (this.circleSize <= 0) {
                    if (!this.currentCycleScoreChanged) {
                        this.updateScore(-1);
                        this.showFeedback('rgba(244, 67, 54, 0.6)');
                        utils.vibrateDevice();
                    }
                    this.resetCircle();
                }
                this.updateCircleSize();
                this.checkCircleInTimeWindow();
            }
            this.lastTimestamp = timestamp;
        }

        this.animationId = requestAnimationFrame((timestamp) => this.animateCircle(timestamp));
    }

    resetCircle() {
        this.circleSize = 280;
        this.updateCircleSize();
        this.currentCycleScoreChanged = false;
        this.isInTimeWindow = false;
        this.updateShrinkSpeed();
    }

    updateCircleSize() {
        this.elements.circle.style.setProperty('--size', `${Math.max(0, this.circleSize)}px`);
        this.elements.timeWindow.style.width = `${this.TIME_WINDOW_SIZE}px`;
        this.elements.timeWindow.style.height = `${this.TIME_WINDOW_SIZE}px`;

        if (this.isRunning && this.circleSize <= this.TIME_WINDOW_SIZE) {
            this.elements.timeWindow.style.backgroundColor = 'rgba(76, 175, 80, 0.6)';
        } else {
            this.elements.timeWindow.style.backgroundColor = 'rgba(76, 175, 80, 0.4)';
        }
    }

    checkCircleInTimeWindow() {
        if (this.circleSize <= this.TIME_WINDOW_SIZE + 5 && !this.isInTimeWindow) {
            this.isInTimeWindow = true;
            utils.vibrateDevice();
        } else if (this.circleSize > this.TIME_WINDOW_SIZE + 5) {
            this.isInTimeWindow = false;
        }
    }

    checkShakeTiming() {
        if (this.isInTimeWindow && !this.currentCycleScoreChanged) {
            this.updateScore(1);
            this.showFeedback('rgba(76, 175, 80, 0.6)');
            this.currentCycleScoreChanged = true;
            this.resetCircle();
        } else if (!this.isInTimeWindow && !this.currentCycleScoreChanged) {
            this.updateScore(-1);
            this.showFeedback('rgba(244, 67, 54, 0.6)');
            this.currentCycleScoreChanged = true;
            this.resetCircle();
        }
    }

    showFeedback(color) {
        this.elements.feedback.style.backgroundColor = color;
        this.elements.feedback.style.opacity = 0.7;
        setTimeout(() => {
            this.elements.feedback.style.opacity = 0;
        }, 100);
    }

    updateScore(change = 0) {
        this.score = Math.max(0, this.score + change);
        this.elements.scoreDisplay.textContent = `Score: ${this.score}`;
        if (!this.isFeverMode) {
            this.updateShrinkSpeed();
        }

        this.updateMoleHeight();

        if (this.score >= 10 && !this.isFeverMode) {
            this.startFeverMode();
        }
    }

    updateShrinkSpeed() {
        this.shrinkSpeed = this.baseShrinkSpeed + (this.score * 0.4);
    }

    startFeverMode() {
        this.isFeverMode = true;
        this.elements.feverModeDisplay.style.opacity = 1;
        this.elements.circle.style.display = 'none';
        this.elements.timeWindow.style.display = 'none';
        
        let countdownTime = 10;
        this.elements.feverCountdown.textContent = countdownTime;
        this.elements.feverCountdown.style.display = 'block';
        
        this.feverCountdownInterval = setInterval(() => {
            countdownTime--;
            this.elements.feverCountdown.textContent = countdownTime;
            if (countdownTime <= 0) {
                clearInterval(this.feverCountdownInterval);
                this.endFeverMode();
            }
        }, 1000);
    }

    endFeverMode() {
        this.isFeverMode = false;
        this.elements.feverModeDisplay.style.opacity = 0;
        this.elements.feverCountdown.style.display = 'none';
        clearInterval(this.feverCountdownInterval);
        this.end(false);
    }

    updateMoleHeight() {
        const maxScore = 10;
        const visiblePercentage = Math.min(this.score / maxScore, 1);
        const translateY = 75 - (visiblePercentage * 75);
        const scaleX = 0.5 + (visiblePercentage * 1);
        this.elements.mole.style.transform = `translateY(${translateY}%) scaleX(${scaleX})`;
    }

    end(isEarlyEnd = false) {
        this.isRunning = false;
        this.isFeverMode = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('devicemotion', (event) => this.handleMotion(event));
        this.elements.actionButton.textContent = 'Play Again';
        this.elements.actionButton.style.opacity = '1';
        this.elements.actionButton.style.visibility = 'visible';
        this.elements.actionButton.style.pointerEvents = 'auto';
        this.elements.scoreDisplay.textContent = `${this.score} $DEEK`;
        this.elements.circle.style.display = 'block';
        this.elements.timeWindow.style.display = 'block';

        if (!isEarlyEnd) {
            setTimeout(() => this.startMoleShaking(), 1000); // Delay mole shaking and shrinking by 1 second
        }
    }

    startMoleShaking() {
        this.moleShakeCount = 0;
        this.shakeMole();
    }

    shakeMole() {
        const baseTransform = this.elements.mole.style.transform || `translateY(75%) scaleX(0.5)`;
        const rotateOrigin = 'bottom center';  // 設置旋轉的原點
    
        // 解析當前的 transform
        const translateY = baseTransform.match(/translateY\((.*?)\)/)?.[1] || '75%';
        const scaleX = baseTransform.match(/scaleX\((.*?)\)/)?.[1] || '0.5';
    
        const shakeAnimation = [
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(-3deg)`, transformOrigin: rotateOrigin },
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(0deg)`, transformOrigin: rotateOrigin },
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(3deg)`, transformOrigin: rotateOrigin },
            { transform: `translateY(${translateY}) scaleX(${scaleX}) rotate(0deg)`, transformOrigin: rotateOrigin }
        ];
    
        const shakeOptions = {
            duration: 500,
            iterations: 1,
            easing: 'ease-in-out'
        };
    
        const animation = this.elements.mole.animate(shakeAnimation, shakeOptions);
        
        animation.onfinish = () => {
            this.moleShakeCount++;
            if (this.moleShakeCount < 3) {
                setTimeout(() => this.shakeMole(), 500); // 0.5秒休息
            } else {
                setTimeout(() => this.startMoleShrinking(), 500); // 添加延遲
            }
        };
    }

    startMoleShrinking() {
        const initialScale = 0.5 + (Math.min(this.score / 10, 1) * 1);
        const initialTranslateY = 75 - (Math.min(this.score / 10, 1) * 75);
        const targetScale = 0.5;
        const targetTranslateY = 75;
        const duration = 2500; // 動畫持續時間（毫秒）
        let startTime;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            const easeProgress = this.easeOutCubic(progress);

            const currentScale = initialScale + (targetScale - initialScale) * easeProgress;
            const currentTranslateY = initialTranslateY + (targetTranslateY - initialTranslateY) * easeProgress;

            this.elements.mole.style.transform = `translateY(${currentTranslateY}%) scaleX(${currentScale})`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}