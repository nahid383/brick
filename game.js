const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 3;
let gameRunning = false;
let gameStarted = false;

// Paddle
const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 30,
    width: 120,
    height: 15,
    speed: 8
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 8,
    dx: 5,
    dy: -5,
    speed: 5
};

// Bricks
const brickRows = 6;
const brickCols = 10;
const brickWidth = 75;
const brickHeight = 25;
const brickPadding = 5;
const brickOffsetTop = 60;
const brickOffsetLeft = 35;

let bricks = [];
const brickColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];

// Initialize bricks
function initBricks() {
    bricks = [];
    for (let r = 0; r < brickRows; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickCols; c++) {
            bricks[r][c] = {
                x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                y: r * (brickHeight + brickPadding) + brickOffsetTop,
                status: 1,
                color: brickColors[r]
            };
        }
    }
}

// Input handling
let rightPressed = false;
let leftPressed = false;
let mouseX = 0;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
canvas.addEventListener('mousemove', mouseMoveHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!gameStarted) {
            startGame();
        }
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
}

// Drawing functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
            if (bricks[r][c].status === 1) {
                const brick = bricks[r][c];
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brickWidth, brickHeight, 5);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Collision detection
function collisionDetection() {
    for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
            const brick = bricks[r][c];
            if (brick.status === 1) {
                if (ball.x > brick.x && ball.x < brick.x + brickWidth &&
                    ball.y > brick.y && ball.y < brick.y + brickHeight) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score += 10;
                    updateScore();
                    
                    // Check if all bricks are destroyed
                    if (score === brickRows * brickCols * 10) {
                        endGame('You Win! 🎉');
                    }
                }
            }
        }
    }
}

// Update game state
function update() {
    if (!gameRunning) return;

    // Move paddle
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }

    // Mouse control
    if (mouseX > 0) {
        paddle.x = mouseX - paddle.width / 2;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with walls
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Ball collision with paddle
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        // Add some angle based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = ball.speed * (hitPos - 0.5) * 2;
        ball.dy = -Math.abs(ball.dy);
    }

    // Ball falls below paddle
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();
        if (lives === 0) {
            endGame('Game Over!');
        } else {
            resetBall();
        }
    }

    collisionDetection();
}

// Render game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();

    if (!gameStarted) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start!', canvas.width / 2, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Game control functions
function startGame() {
    gameStarted = true;
    gameRunning = true;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -5;
    gameRunning = false;
    gameStarted = false;
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function endGame(message) {
    gameRunning = false;
    document.getElementById('gameOverTitle').textContent = message;
    document.getElementById('finalScore').textContent = `Final Score: ${score}`;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    score = 0;
    lives = 3;
    gameRunning = false;
    gameStarted = false;

    updateScore();
    updateLives();

    initBricks();
    resetBall();

    document.getElementById('gameOver').style.display = 'none';
}

// Initialize game
initBricks();
gameLoop();
