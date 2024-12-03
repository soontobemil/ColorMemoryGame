class ColorMemoryGame {
    constructor() {
        this.colors = ['red', 'blue', 'green', 'yellow'];
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.isPlaying = false;
        this.audioContext = null;

        this.colorBtns = document.querySelectorAll('.color-btn');
        this.startBtn = document.getElementById('start-btn');
        this.scoreElement = document.getElementById('score');
        this.messageElement = document.getElementById('message');

        this.bindEvents();
        this.sounds = {
            red: 261.63,    // C4
            blue: 329.63,   // E4
            green: 392.00,  // G4
            yellow: 523.25, // C5
            wrong: 100      // Low frequency for wrong answer
        };
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(frequency, duration = 0.2) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            this.initAudio();
            this.startGame();
        });
        this.colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isPlaying) {
                    const color = btn.dataset.color;
                    this.handlePlayerInput(color);
                }
            });
        });
    }

    startGame() {
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.isPlaying = true;
        this.scoreElement.textContent = this.score;
        this.messageElement.textContent = '';
        this.startBtn.textContent = 'Playing...';
        this.startBtn.disabled = true;
        this.addToSequence();
    }

    addToSequence() {
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.sequence.push(randomColor);
        this.playerSequence = [];
        
        setTimeout(() => this.playSequence(), 1000);
    }

    async playSequence() {
        this.isPlaying = false;
        for (let color of this.sequence) {
            await this.highlightColor(color);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        this.isPlaying = true;
        this.messageElement.textContent = 'Your turn!';
    }

    async highlightColor(color) {
        const btn = document.querySelector(`[data-color="${color}"]`);
        btn.classList.add('active');
        this.playSound(this.sounds[color]);
        await new Promise(resolve => setTimeout(resolve, 400));
        btn.classList.remove('active');
    }

    async handlePlayerInput(color) {
        const btn = document.querySelector(`[data-color="${color}"]`);
        btn.classList.add('active');
        this.playSound(this.sounds[color]);
        setTimeout(() => btn.classList.remove('active'), 200);

        this.playerSequence.push(color);
        
        if (this.playerSequence[this.playerSequence.length - 1] !== this.sequence[this.playerSequence.length - 1]) {
            this.gameOver();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.score++;
            this.scoreElement.textContent = this.score;
            this.messageElement.textContent = 'Correct! Watch the next sequence...';
            this.isPlaying = false;
            setTimeout(() => this.addToSequence(), 1000);
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.playSound(this.sounds.wrong, 0.5);
        document.body.classList.add('wrong');
        setTimeout(() => document.body.classList.remove('wrong'), 400);
        
        this.messageElement.textContent = `Game Over! Final Score: ${this.score}`;
        this.startBtn.textContent = 'Play Again';
        this.startBtn.disabled = false;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new ColorMemoryGame();
});
