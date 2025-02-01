// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;
// Game state
let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;
let muted = false;
// Sound effects
const sounds = {
    jump: new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='),
    coin: new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='),
    death: new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=')
};
// Sprite animations
const playerSprite = {
    width: 32,
    height: 32,
    frameX: 0,
    frameY: 0,
    moving: false,
    facing: 'right'
};
// Player properties
const player = {
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    speed: 5,
    jumpForce: -12,
    gravity: 0.5,
    velocityY: 0,
    isJumping: false,
    isInvulnerable: false
};
// Coins
const coins = [];
function spawnCoin() {
    coins.push({
        x: Math.random() * (canvas.width - 20),
        y: Math.random() * (canvas.height - 100),
        width: 15,
        height: 15,
        collected: false
    });
}
// Enemies
const enemies = [];
function spawnEnemy() {
    enemies.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 100),
        width: 20,
        height: 20,
        speed: 2 + Math.random() * 2
    });
}
// Power-ups
const powerUps = [];
function spawnPowerUp() {
    powerUps.push({
        x: Math.random() * (canvas.width - 20),
        y: Math.random() * (canvas.height - 100),
        width: 20,
        height: 20,
        type: Math.random() < 0.5 ? 'invincibility' : 'extraLife',
        active: false
    });
}
// Platforms with movement
const platforms = [
    { x: 0, y: 350, width: 800, height: 50, moving: false },    // Ground
    { x: 300, y: 250, width: 200, height: 20, moving: true, direction: 1, speed: 1 },  // Moving platform
    { x: 100, y: 150, width: 200, height: 20, moving: false },  // Static platform
    { x: 500, y: 200, width: 200, height: 20, moving: true, direction: 1, speed: 2 }   // Fast moving platform
];
// Controls
const keys = {
    right: false,
    left: false,
    up: false
};
// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === ' ' || e.key === 'ArrowUp') keys.up = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === ' ' || e.key === 'ArrowUp') keys.up = false;
});
document.getElementById('muteButton').addEventListener('click', () => {
    muted = !muted;
    document.getElementById('muteButton').textContent = muted ? '🔇' : '🔊';
});
// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}
// Sound player
function playSound(soundName) {
    if (!muted) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play();
    }
}
// Update game elements
function updatePlatforms() {
    platforms.forEach(platform => {
        if (platform.moving) {
            platform.x += platform.speed * platform.direction;
            if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
                platform.direction *= -1;
            }
        }
    });
}
function updatePlayer() {
    // Horizontal movement
    if (keys.right) {
        player.x += player.speed;
        playerSprite.moving = true;
        playerSprite.facing = 'right';
    }
    if (keys.left) {
        player.x -= player.speed;
        playerSprite.moving = true;
        playerSprite.facing = 'left';
    }
    if (!keys.right && !keys.left) {
        playerSprite.moving = false;
    }
    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    // Platform collision
    let onPlatform = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                onPlatform = true;
                
                // Move player with platform
                if (platform.moving) {
                    player.x += platform.speed * platform.direction;
                }
            }
        }
    });
    // Jump
    if (keys.up && !player.isJumping && onPlatform) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
        playSound('jump');
    }
    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
}
function updateCoins() {
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 10;
            playSound('coin');
            document.getElementById('scoreValue').textContent = score;
        }
    });
}
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x -= enemy.speed;
        
        if (!player.isInvulnerable && checkCollision(player, enemy)) {
            lives--;
            playSound('death');
            document.getElementById('livesValue').textContent = lives;
            player.isInvulnerable = true;
            setTimeout(() => { player.isInvulnerable = false; }, 2000);
            
            if (lives <= 0) {
                gameOver = true;
            }
        }
    });
}
function updatePowerUps() {
    powerUps.forEach(powerUp => {
        if (!powerUp.collected && checkCollision(player, powerUp)) {
            powerUp.collected = true;
            if (powerUp.type === 'invincibility') {
                player.isInvulnerable = true;
                setTimeout(() => { player.isInvulnerable = false; }, 5000);
            } else if (powerUp.type === 'extraLife') {
                lives++;
                document.getElementById('livesValue').textContent = lives;
            }
        }
    });
}
// Drawing functions
function drawPlayer() {
    ctx.fillStyle = player.isInvulnerable ? '#FFD700' : '#FF0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}
function drawPlatforms() {
    ctx.fillStyle = '#4CAF50';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}
function drawCoins() {
    ctx.fillStyle = '#FFD700';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}
function drawEnemies() {
    ctx.fillStyle = '#FF4444';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
            ctx.fillStyle = powerUp.type === 'invincibility' ? '#FFD700' : '#FF69B4';
            ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }
    });
}
// Game loop
function update() {
    if (!gameOver) {
        updatePlatforms();
        updatePlayer();
        updateCoins();
        updateEnemies();
        updatePowerUps();
        
        // Spawn new elements
        if (Math.random() < 0.02) spawnCoin();
        if (Math.random() < 0.01) spawnEnemy();
        if (Math.random() < 0.005) spawnPowerUp();
        
        // Level progression
        if (score >= level * 100) {
            level++;
            document.getElementById('levelValue').textContent = level;
            player.speed += 0.5;
        }
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawPowerUps();
    drawPlayer();
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 40);
    }
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
// Initialize game
spawnCoin();
spawnEnemy();
gameLoop();
