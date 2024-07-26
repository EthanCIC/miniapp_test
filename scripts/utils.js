const utils = {
    vibrateDevice: function() {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        } else if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    },

    lerp: function(start, end, t) {
        return start * (1 - t) + end * t;
    },

    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};