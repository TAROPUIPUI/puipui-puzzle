class PuiPuiBlockGame {
    constructor() {
        this.stage = 1;
        this.timer = 60;
        this.blocks = [];
        this.blockTypes = ['heart', 'triangle', 'circle'];
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7'];
        this.goalBlocks = 10;
        this.gameBoard = document.getElementById('game-board');
        this.timerDisplay = document.getElementById('timer');
        this.timerBar = document.getElementById('timer-bar');
        this.stageDisplay = document.getElementById('stage-number');
        this.goalDisplay = document.getElementById('goal-blocks');
        this.house = document.getElementById('house');
        this.startBtn = document.getElementById('start-btn');
        this.timerInterval = null;
        this.titleScreen = document.getElementById('title-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.backgroundMusic = document.getElementById('background-music');

        this.initializeEventListeners();
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetGame();
        this.startGameBtn.addEventListener('click', () => this.startGameFromTitleScreen());
    }

    resetGame() {
        this.stage = 1;
        this.stageDisplay.textContent = this.stage;
        this.updateHouse();
        this.startBtn.disabled = false;
    }

    initializeEventListeners() {
        ['click', 'touchstart', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                // No-op, removed hint-related code
            });
        });
    }

    startGameFromTitleScreen() {
        this.titleScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.startGame();
        this.playBackgroundMusic();
    }

    startGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.initializeBoard();
        this.startTimer();
        this.startBtn.disabled = true;
    }

    initializeBoard() {
        this.gameBoard.innerHTML = '';
        this.blocks = [];

        for (let i = 0; i < 64; i++) {
            const block = document.createElement('div');
            block.classList.add('block');
            block.dataset.index = i;
            
            const color = this.getRandomColor();
            const blockType = this.getRandomBlockType();
            
            block.style.backgroundColor = color;
            block.classList.add(`block-${blockType}`);
            
            block.addEventListener('click', (e) => this.handleBlockClick(e.target));
            this.gameBoard.appendChild(block);
            this.blocks.push(block);
        }

        if (!this.checkForPossibleMoves()) {
            this.rearrangeBlocks();
        }

        this.goalBlocks = 10 + (this.stage * 2);
        this.goalDisplay.textContent = this.goalBlocks;
    }
    
    getRandomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    getRandomBlockType() {
        return this.blockTypes[Math.floor(Math.random() * this.blockTypes.length)];
    }

    checkForPossibleMoves() {
        for (let i = 0; i < this.blocks.length; i++) {
            if (!this.blocks[i].classList.contains('cleared')) {
                const block = this.blocks[i];
                const connectedBlocks = this.findConnectedBlocks(block);
                if (connectedBlocks.length >= 3) {
                    return true;
                }
            }
        }
        return false;
    }

    rearrangeBlocks() {
        this.blocks.forEach(block => {
            if (!block.classList.contains('cleared')) {
                const color = this.getRandomColor();
                const blockType = this.getRandomBlockType();
                
                block.style.backgroundColor = color;
                block.className = 'block'; 
                block.classList.add(`block-${blockType}`);
            }
        });

        this.blocks.forEach(block => {
            block.addEventListener('click', (e) => this.handleBlockClick(e.target));
        });

        if (!this.checkForPossibleMoves()) {
            this.rearrangeBlocks();
        }
    }

    handleBlockClick(block) {
        if (block.classList.contains('cleared')) return;

        const connectedBlocks = this.findConnectedBlocks(block);
        
        if (connectedBlocks.length >= 3) {
            connectedBlocks.forEach(b => {
                if (!b.classList.contains('cleared')) {
                    b.classList.add('cleared');
                    this.goalBlocks--;
                }
            });

            this.goalDisplay.textContent = this.goalBlocks;

            if (this.goalBlocks <= 0) {
                this.stageComplete();
            } else {
                if (!this.checkForPossibleMoves()) {
                    this.rearrangeBlocks();
                }
            }
        }
    }

    findConnectedBlocks(startBlock, connectedBlocks = [], checked = new Set()) {
        const index = parseInt(startBlock.dataset.index);
        const color = startBlock.style.backgroundColor;
        const blockType = Array.from(startBlock.classList)
            .find(cls => cls.startsWith('block-'))
            .replace('block-', '');

        if (checked.has(index)) return connectedBlocks;
        
        checked.add(index);
        connectedBlocks.push(startBlock);
        
        const adjacentIndices = [
            index + 1, index - 1, 
            index + 8, index - 8
        ];

        adjacentIndices.forEach(adj => {
            const adjBlock = this.blocks[adj];
            if (adjBlock && 
                adjBlock.style.backgroundColor === color && 
                adjBlock.classList.contains(`block-${blockType}`) &&
                !checked.has(adj) &&
                !adjBlock.classList.contains('cleared')) {
                this.findConnectedBlocks(adjBlock, connectedBlocks, checked);
            }
        });

        return connectedBlocks;
    }

    startTimer() {
        this.timer = 60;
        this.timerBar.style.width = '100%';
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.timerDisplay.textContent = this.timer;
            this.timerBar.style.width = `${(this.timer / 60) * 100}%`;

            if (this.timer <= 0) {
                clearInterval(this.timerInterval);
                this.gameOver();
            }
        }, 1000);
    }

    stageComplete() {
        this.stage++;
        this.stageDisplay.textContent = this.stage;
        this.updateHouse();

        if (this.stage > 100) {
            alert('おめでとう！全てのステージをクリア！');
            return;
        }

        this.startGame();
        if (this.stage > 1) {
            this.playStageCompleteSfx();
        }
    }

    updateHouse() {
        const houseStage = Math.min(this.stage, 5);
        this.house.className = `stage-${houseStage}`;
    }

    playStageCompleteSfx() {
        console.log('Stage Complete!');
    }

    playBackgroundMusic() {
        if (!this.musicStarted) {
            this.backgroundMusic.play().catch(error => {
                console.error('Error playing music:', error);
            });
            this.musicStarted = true;
        }
    }

    gameOver() {
        alert('タイムアップ！');
        this.startBtn.disabled = false;
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        this.musicStarted = false;
        this.titleScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
    }
}

const game = new PuiPuiBlockGame();