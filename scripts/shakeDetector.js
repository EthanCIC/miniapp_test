class ShakeDetector {
    constructor(threshold, onShake) {
        this.threshold = threshold;
        this.onShake = onShake;
        this.isAboveThreshold = false;
        this.shakeStartTime = 0;
    }

    update(acceleration) {
        if (!this.isAboveThreshold && acceleration > this.threshold) {
            this.isAboveThreshold = true;
            this.shakeStartTime = Date.now();
        } else if (this.isAboveThreshold && acceleration <= this.threshold) {
            this.isAboveThreshold = false;
            this.onShake();
        }
    }

    setThreshold(newThreshold) {
        this.threshold = newThreshold;
    }
}