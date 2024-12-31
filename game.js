const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;  // Schmaleres Canvas für vertikales Gameplay
canvas.height = 600;

// Spielzustand
let score = 0;
let scrollSpeed = 2;
let gameOver = false;

// Spieler
const player = {
    x: canvas.width / 2 - 15,  // Mittig positionieren
    y: canvas.height - 100,    // Näher am unteren Rand starten
    width: 30,
    height: 30,
    speed: 5,
    velocityX: 0,
    velocityY: 0,
    gravity: 0.5,
    jumpForce: -12,
    isJumping: false
};

// Plattformen
const platforms = [];
const platformHeight = 15;
const platformWidth = 100;
const platformGap = 150;  // Vertikaler Abstand zwischen Plattformen

// Initial platforms
function createInitialPlatforms() {
    // Startplattform
    platforms.push({
        x: canvas.width / 2 - platformWidth / 2,
        y: canvas.height - 50,
        width: platformWidth,
        height: platformHeight
    });

    // Generiere erste Reihe von Plattformen
    for (let i = 1; i < 6; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - platformWidth),
            y: canvas.height - (i * platformGap),
            width: platformWidth,
            height: platformHeight
        });
    }
}

// Steuerung
const keys = {
    left: false,
    right: false,
    up: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === ' ') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === ' ') keys.up = false;
});

// Kollisionserkennung
function checkPlatformCollision(platform) {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y + player.height <= platform.y + platform.height &&
           player.y + player.height + player.velocityY >= platform.y;
}

function updatePlayer() {
    // Horizontale Bewegung
    if (keys.left) player.velocityX = -player.speed;
    else if (keys.right) player.velocityX = player.speed;
    else player.velocityX = 0;

    // Aktualisiere Position
    player.x += player.velocityX;
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Horizontale Grenzen
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Plattform Kollisionen
    let onPlatform = false;
    platforms.forEach(platform => {
        if (checkPlatformCollision(platform)) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            onPlatform = true;
        }
    });

    // Sprung
    if (keys.up && !player.isJumping && onPlatform) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
    }

    // Game Over wenn Spieler unten raus fällt
    if (player.y > canvas.height) {
        gameOver = true;
    }
}

function updatePlatforms() {
    // Bewege alle Plattformen nach unten
    platforms.forEach(platform => {
        platform.y += scrollSpeed;
    });

    // Entferne Plattformen die unten raus sind
    for (let i = platforms.length - 1; i >= 0; i--) {
        if (platforms[i].y > canvas.height) {
            platforms.splice(i, 1);
            // Füge neue Plattform oben hinzu
            platforms.push({
                x: Math.random() * (canvas.width - platformWidth),
                y: platforms[0].y - platformGap,
                width: platformWidth,
                height: platformHeight
            });
            score++;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Zeichne Hintergrund
    ctx.fillStyle = '#87CEEB';  // Himmelblau
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zeichne Plattformen
    ctx.fillStyle = '#4CAF50';  // Grün
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Zeichne Spieler
    ctx.fillStyle = '#FF0000';  // Rot
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Zeichne Score
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

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
    if (!gameOver) {
        updatePlayer();
        updatePlatforms();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Spiel starten
createInitialPlatforms();
gameLoop();
