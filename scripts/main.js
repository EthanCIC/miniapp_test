document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();

    const actionButton = document.getElementById('actionButton');
    actionButton.addEventListener('click', () => {
        if (game.isRunning) {
            // 提前結束遊戲的邏輯（目前不啟用，但保留以備將來使用）
            // game.end(true);
        } else {
            game.start();
        }
    });

    // Dev mode toggle (you can add a button in HTML to toggle this)
    window.toggleDevMode = () => {
        const accelerationMonitor = document.getElementById('accelerationMonitor');
        accelerationMonitor.style.display = accelerationMonitor.style.display === 'none' ? 'block' : 'none';
    };
});