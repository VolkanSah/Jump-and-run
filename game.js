// ====================
// Asset Loader
// ====================
const Assets = {
  images: {},
  load: function() {
    const toLoad = {
      player: 'https://volkansah.github.io/Jump-and-run/sprites/player.webp',
      coin: 'https://volkansah.github.io/Jump-and-run/sprites/coin.webp',
      enemy: 'https://volkansah.github.io/Jump-and-run/sprites/enemy.webp',
      boss: 'https://volkansah.github.io/Jump-and-run/sprites/boss.webp'
    };

    return Promise.all(
      Object.entries(toLoad).map(([name, url]) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            this.images[name] = img;
            resolve();
          };
        });
      })
    );
  }
};

// ====================
// Boss System
// ====================
class Boss {
  constructor(level) {
    this.level = level;
    this.width = 60 + level * 10;
    this.height = 60 + level * 10;
    this.x = Game.canvas.width;
    this.y = 50;
    this.speed = 2 - (level * 0.1);
    this.health = 3 + level * 2;
    this.color = `hsl(${level * 30}, 70%, 50%)`;
  }

  update() {
    this.x -= this.speed;
    
    // Sinus-Bewegung für Boss
    this.y += Math.sin(Date.now() / 300 + this.level) * 2;

    // Kollision mit Spieler
    if (Game.checkCollision(this, Game.player)) {
      Game.handlePlayerHit();
    }
  }

  draw() {
    // Boss-Bild
    Game.ctx.drawImage(
      Assets.images.boss,
      this.x,
      this.y,
      this.width,
      this.height
    );

    // Farbige Umrandung
    Game.ctx.strokeStyle = this.color;
    Game.ctx.lineWidth = 3;
    Game.ctx.strokeRect(
      this.x,
      this.y,
      this.width,
      this.height
    );

    // Gesundheitsbalken
    Game.ctx.fillStyle = 'red';
    Game.ctx.fillRect(
      this.x,
      this.y - 10,
      this.width,
      5
    );
    Game.ctx.fillStyle = 'lime';
    Game.ctx.fillRect(
      this.x,
      this.y - 10,
      (this.width * this.health) / (3 + this.level * 2),
      5
    );
  }
}

// ====================
// Modifiziertes Game-Objekt
// ====================
const Game = {
  // ... [vorheriger Code bleibt] ...

  // Neue Eigenschaften
  bosses: [],
  currentBoss: null,
  nextBossThreshold: 500,

  spawnCoin() {
    // Reduzierte Spawn-Rate (nur 50% Chance)
    if (Math.random() < 0.5) {
      this.coins.push({
        x: Math.random() * (this.canvas.width - 20),
        y: Math.random() * (this.canvas.height - 100),
        width: 25,  // Größere Münzen
        height: 25,
        collected: false,
        animationFrame: 0
      });
    }
  },

  checkBossSpawn() {
    if (this.state.score >= this.nextBossThreshold) {
      const bossLevel = Math.floor(this.state.score / 500);
      this.currentBoss = new Boss(bossLevel);
      this.bosses.push(this.currentBoss);
      this.nextBossThreshold += 500;
    }
  },

  updateBosses() {
    this.bosses.forEach(boss => boss.update());
    
    // Boss-Kollision mit Projektilen (Beispiel)
    this.bosses.forEach((boss, bossIndex) => {
      this.bullets.forEach((bullet, bulletIndex) => {
        if (this.checkCollision(bullet, boss)) {
          boss.health--;
          this.bullets.splice(bulletIndex, 1);
          if (boss.health <= 0) {
            this.bosses.splice(bossIndex, 1);
            this.state.score += 200; // Extra-Punkte für Boss
          }
        }
      });
    });
  },

  // Modifizierte Draw-Funktionen mit Bildern
  drawPlayer() {
    this.ctx.drawImage(
      Assets.images.player,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    // Invulnerability-Effekt
    if (this.player.isInvulnerable) {
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(
        Assets.images.player,
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height
      );
      this.ctx.globalAlpha = 1.0;
    }
  },

  drawCoins() {
    this.coins.forEach(coin => {
      if (!coin.collected) {
        // Animierte Münzen
        coin.animationFrame = (coin.animationFrame + 0.1) % 8;
        
        this.ctx.drawImage(
          Assets.images.coin,
          Math.floor(coin.animationFrame) * 32, // Sprite-Sheet X
          0, // Sprite-Sheet Y
          32,
          32,
          coin.x,
          coin.y,
          coin.width,
          coin.height
        );
      }
    });
  },

  drawEnemies() {
    this.enemies.forEach(enemy => {
      this.ctx.drawImage(
        Assets.images.enemy,
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height
      );
    });
  },

  // Modifizierter Game Loop
  gameLoop() {
    this.update();
    this.checkBossSpawn();
    this.draw();
    
    // Boss zeichnen
    this.bosses.forEach(boss => boss.draw());

    if (!this.state.gameOver) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
};

// Spielstart mit Asset-Loading
Assets.load().then(() => {
  Game.init();
  document.getElementById('loadingScreen').style.display = 'none';
});
