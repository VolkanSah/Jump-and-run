// ================
// Initialisierung
// ================
const Game = {
  canvas: document.getElementById('gameCanvas'),
  ctx: null,
  keys: { right: false, left: false, up: false },
  state: {
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    muted: false
  },
  
  init() {
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 400;
    
    // Event Listeners
    document.addEventListener('keydown', (e) => this.handleKey(e, true));
    document.addEventListener('keyup', (e) => this.handleKey(e, false));
    document.getElementById('muteButton').addEventListener('click', () => this.toggleMute());
    
    // Start Game
    this.spawnInitialEntities();
    requestAnimationFrame(() => this.gameLoop());
  },

  // ================
  // Spieler
  // ================
  player: {
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    speed: 5,
    jumpForce: -12,
    gravity: 0.5,
    velocityY: 0,
    isJumping: false,
    isInvulnerable: false,
    facing: 'right',

    reset() {
      this.x = 50;
      this.y = 200;
      this.velocityY = 0;
      this.isJumping = false;
    }
  },

  // ================
  // Entities
  // ================
  platforms: [
    { x: 0, y: 350, width: 800, height: 50, moving: false },
    { x: 300, y: 250, width: 200, height: 20, moving: true, direction: 1, speed: 1 }
  ],
  
  coins: [],
  enemies: [],
  powerUps: [],

  // ================
  // Kernfunktionen
  // ================
  handleKey(e, isPressed) {
    const keyMap = {
      'ArrowRight': 'right',
      'ArrowLeft': 'left',
      ' ': 'up',
      'ArrowUp': 'up'
    };
    
    if (keyMap[e.key]) this.keys[keyMap[e.key]] = isPressed;
  },

  toggleMute() {
    this.state.muted = !this.state.muted;
    document.getElementById('muteButton').textContent = this.state.muted ? '🔇' : '🔊';
  },

  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  },

  // ================
  // Spawn System
  // ================
  spawnCoin() {
    this.coins.push({
      x: Math.random() * (this.canvas.width - 20),
      y: Math.random() * (this.canvas.height - 100),
      width: 15,
      height: 15,
      collected: false
    });
  },

  spawnEnemy() {
    this.enemies.push({
      x: this.canvas.width,
      y: Math.random() * (this.canvas.height - 100),
      width: 20,
      height: 20,
      speed: 2 + Math.random() * 2
    });
  },

  spawnInitialEntities() {
    for (let i = 0; i < 5; i++) this.spawnCoin();
    for (let i = 0; i < 3; i++) this.spawnEnemy();
  },

  // ================
  // Update System
  // ================
  update() {
    if (this.state.gameOver) return;

    this.updatePlatforms();
    this.updatePlayer();
    this.updateEntities();
    this.handleLevelProgression();
  },

  updatePlatforms() {
    this.platforms.forEach(p => {
      if (p.moving) {
        p.x += p.speed * p.direction;
        if (p.x <= 0 || p.x + p.width >= this.canvas.width) {
          p.direction *= -1;
        }
      }
    });
  },

  updatePlayer() {
    // Horizontal movement
    if (this.keys.right) this.player.x += this.player.speed;
    if (this.keys.left) this.player.x -= this.player.speed;

    // Apply gravity
    this.player.velocityY += this.player.gravity;
    this.player.y += this.player.velocityY;

    // Collision detection
    let onPlatform = false;
    this.platforms.forEach(p => {
      if (this.checkCollision(this.player, p)) {
        if (this.player.velocityY > 0) {
          this.player.y = p.y - this.player.height;
          this.player.velocityY = 0;
          this.player.isJumping = false;
          onPlatform = true;
        }
      }
    });

    // Jump
    if (this.keys.up && !this.player.isJumping && onPlatform) {
      this.player.velocityY = this.player.jumpForce;
      this.player.isJumping = true;
    }

    // Boundaries
    this.player.x = Math.max(0, Math.min(this.player.x, this.canvas.width - this.player.width));
  },

  updateEntities() {
    // Coins
    this.coins.forEach(coin => {
      if (!coin.collected && this.checkCollision(this.player, coin)) {
        coin.collected = true;
        this.state.score += 10;
        document.getElementById('scoreValue').textContent = this.state.score;
      }
    });

    // Enemies
    this.enemies.forEach(enemy => {
      enemy.x -= enemy.speed;
      if (this.checkCollision(this.player, enemy) && !this.player.isInvulnerable) {
        this.handlePlayerHit();
      }
    });
  },

  handlePlayerHit() {
    this.state.lives--;
    document.getElementById('livesValue').textContent = this.state.lives;
    
    this.player.isInvulnerable = true;
    setTimeout(() => {
      this.player.isInvulnerable = false;
    }, 2000);

    if (this.state.lives <= 0) {
      this.state.gameOver = true;
      this.player.reset();
    }
  },

  handleLevelProgression() {
    if (this.state.score >= this.state.level * 100) {
      this.state.level++;
      document.getElementById('levelValue').textContent = this.state.level;
      this.player.speed += 0.5;
      this.spawnEnemy();
    }
  },

  // ================
  // Render System
  // ================
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawPlatforms();
    this.drawCoins();
    this.drawEnemies();
    this.drawPlayer();
    
    if (this.state.gameOver) {
      this.drawGameOver();
    }
  },

  drawPlatforms() {
    this.ctx.fillStyle = '#4CAF50';
    this.platforms.forEach(p => {
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    });
  },

  drawPlayer() {
    this.ctx.fillStyle = this.player.isInvulnerable ? '#FFD700' : '#FF0000';
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );
  },

  drawCoins() {
    this.ctx.fillStyle = '#FFD700';
    this.coins.forEach(coin => {
      if (!coin.collected) {
        this.ctx.beginPath();
        this.ctx.arc(
          coin.x + coin.width/2,
          coin.y + coin.height/2,
          coin.width/2,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      }
    });
  },

  drawEnemies() {
    this.ctx.fillStyle = '#FF4444';
    this.enemies.forEach(enemy => {
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
  },

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.state.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
  },

  // ================
  // Game Loop
  // ================
  gameLoop() {
    this.update();
    this.draw();
    if (!this.state.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
};

// Spiel starten
Game.init();
