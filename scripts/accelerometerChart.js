class AccelerometerChart {
    constructor(canvasId, displayId, threshold) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.display = document.getElementById(displayId);
        this.threshold = threshold;
        this.accelerationData = Array(50).fill(0);
        this.maxAcceleration = 50;
    }

    update(acceleration) {
        this.display.textContent = `Acc: ${acceleration.toFixed(2)} | Threshold: ${this.threshold}`;
        
        this.accelerationData.push(acceleration);
        this.accelerationData.shift();

        this.maxAcceleration = Math.max(this.maxAcceleration, ...this.accelerationData, this.threshold + 10);
        
        this.draw();
    }

    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw background grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < this.maxAcceleration; i += 10) {
            const y = height - (i / this.maxAcceleration * height);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Draw acceleration line
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.accelerationData.length; i++) {
            const x = i * (width / this.accelerationData.length);
            const y = height - (this.accelerationData[i] / this.maxAcceleration * height);
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        // Draw threshold line
        const thresholdY = height - (this.threshold / this.maxAcceleration * height);
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(0, thresholdY);
        this.ctx.lineTo(width, thresholdY);
        this.ctx.stroke();

        // Add labels
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`${this.maxAcceleration.toFixed(0)}`, 5, 15);
        this.ctx.fillText('0', 5, height - 5);
        this.ctx.fillStyle = 'red';
        this.ctx.fillText(`${this.threshold.toFixed(0)}`, 5, thresholdY - 5);
    }

    setThreshold(newThreshold) {
        this.threshold = newThreshold;
    }
}