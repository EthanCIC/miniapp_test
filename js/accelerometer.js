import { checkShakeTiming } from './game.js';

let isAboveThreshold = false;
let shakeStartTime = 0;
let accelerationWindow = [];
const CHART_POINTS = 50;
let accelerationData = Array(CHART_POINTS).fill(0);
let maxAcceleration = 50;
let shakeThreshold = 25;
let isCheckingShakeTiming = false;

export function requestMotionPermission() {
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('devicemotion', handleMotion);
    }
}

export function handleMotion(event) {
    let acceleration = event.accelerationIncludingGravity;
    let acc = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
    
    updateAccelerationDisplay(acc);
    
    if (!isAboveThreshold && acc > shakeThreshold) {
        isAboveThreshold = true;
        shakeStartTime = Date.now();
    } else if (isAboveThreshold && acc <= shakeThreshold) {
        isAboveThreshold = false;
        handleShake();
    }
}

function handleShake() {
    if (isFeverMode) {
        updateScore(1);
        vibrateDevice();
    } else if (!isCheckingShakeTiming) {
        isCheckingShakeTiming = true;
        setTimeout(() => {
            checkShakeTiming();
            isCheckingShakeTiming = false;
        }, 0);
    }
}

function updateAccelerationDisplay(acc) {
    const accelerationDisplay = document.getElementById('accelerationDisplay');
    if (accelerationDisplay) {
        accelerationDisplay.textContent = `Acc: ${acc.toFixed(2)} | Threshold: ${shakeThreshold}`;
    }
    
    accelerationData.push(acc);
    accelerationData.shift();

    maxAcceleration = Math.max(maxAcceleration, ...accelerationData, shakeThreshold + 10);
    
    drawAccelerationChart();
}

function drawAccelerationChart() {
    const accelerationChart = document.getElementById('accelerationChart');
    const ctx = accelerationChart.getContext('2d');
    const width = accelerationChart.width;
    const height = accelerationChart.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < maxAcceleration; i += 10) {
        const y = height - (i / maxAcceleration * height);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw acceleration line
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    for (let i = 0; i < CHART_POINTS; i++) {
        const x = i * (width / CHART_POINTS);
        const y = height - (accelerationData[i] / maxAcceleration * height);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw threshold line
    const thresholdY = height - (shakeThreshold / maxAcceleration * height);
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`${maxAcceleration.toFixed(0)}`, 5, 15);
    ctx.fillText('0', 5, height - 5);
    ctx.fillStyle = 'red';
    ctx.fillText(`${shakeThreshold.toFixed(0)}`, 5, thresholdY - 5);
}

export function enableDevMode() {
    document.getElementById('accelerationMonitor').style.display = 'block';
}