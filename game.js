// Zuerst fügen wir den Asset Loader am Anfang des Codes hinzu
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

// Boss-Klasse Definition
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
    this.y += Math.sin(Date.now() / 300 + this.level) * 2;

    if (Game.checkCollision(this, Game.player)) {
      Game.handlePlayerHit();
    }
  }

  draw() {
    // Boss Sprite zeichnen
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

// Ergänzungen für das Game-Objekt
const GameExtensions = {
  // Neue Eigenschaften
  bosses: [],
  currentBoss: null,
  nextBossThreshold: 500,
  bullets: [],

  // Modifizierte spawnCoin Funktion
  spawnCoin() {
    if (Math.random() < 0.5) {  // 50% Chance
      this.coins.push({
        x: Math.random() * (this.canvas.width - 20),
        y: Math.random() * (this.canvas.height - 100),
        width: 25,
        height: 25,
        collected: false,
        animationFrame: 0
      });
    }
  },

  // Boss Spawn Check
  checkBossSpawn() {
    if (this.state.score >= this.nextBossThreshold) {
      const bossLevel = Math.floor(this.state.score / 500);
      this.currentBoss = new Boss(bossLevel);
      this.bosses.push(this.currentBoss);
      this.nextBossThreshold += 500;
    }
  },

  // Boss Update Logik
  updateBosses() {
    this.bosses.forEach(boss => boss.update());
    
    // Boss Kollision mit Projektilen
    this.bosses.forEach((boss, bossIndex) => {
      this.bullets.forEach((bullet, bulletIndex) => {
        if (this.checkCollision(bullet, boss)) {
          boss.health--;
          this.bullets.splice(bulletIndex, 1);
          if (boss.health <= 0) {
            this.bosses.splice(bossIndex, 1);
            this.state.score += 200;
          }
        }
      });
    });
  }
};

// Modifizierter Game Loop
Game.gameLoop = function() {
  this.update();
  this.checkBossSpawn();
  this.updateBosses();
  this.draw();
  
  // Bosse zeichnen
  this.bosses.forEach(boss => boss.draw());

  if (!this.state.gameOver) {
    requestAnimationFrame(() => this.gameLoop());
  }
};

// Spiel mit Asset Loading starten
window.onload = function() {
  Assets.load().then(() => {
    // Erweitere das Game-Objekt mit den neuen Funktionen
    Object.assign(Game, GameExtensions);
    Game.init();
  });
};
