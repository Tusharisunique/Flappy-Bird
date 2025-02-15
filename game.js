const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    gravity: 0.6,
    lift: -8,
    velocity: 0,
};

let pipes = [];
let frameCount = 0;
let score = 0;
let gameOver = false;
let isPaused = false;

let pipeSpeed = 2;

let highScore = localStorage.getItem('highScore') || 0;
let countdownTimer = 3;
let gameStarted = false;
let minGapSize = 200;

let gameInitialized = false;

function drawBird() {
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = "#28a745";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    });
}

function drawBackground() {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updatePipes() {
    if (frameCount % 90 === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - minGapSize - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        const baseGap = 200;
        const minGap = Math.max(120, baseGap - (score * 2));
        const maxGap = Math.min(300, baseGap + 50);
        
        let currentGapSize;
        if (Math.random() < 0.7) {
            currentGapSize = Math.max(minGap, baseGap - (score * 3) + (Math.random() * 50));
        } else {
            currentGapSize = Math.min(maxGap, baseGap + (Math.random() * 100));
        }
        
        const bottomHeight = canvas.height - (topHeight + currentGapSize);

        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: bottomHeight,
            width: 40
        });
        
        if (score > 0) {
            const baseSpeed = 2 + (score / 10);
            const randomSpeedBoost = Math.random() * 0.5;
            pipeSpeed = Math.min(7, baseSpeed + randomSpeedBoost);
        }
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        if (pipe.x + pipe.width < 0) {
            pipes.shift();
            score++;
        }
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width) {
            if (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom) {
                gameOver = true;
            }
        }
    });
}

function flap() {
    if (!gameOver && !isPaused) {
        bird.velocity = bird.lift;
    }
}

function drawCountdown() {
    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(countdownTimer, canvas.width / 2, canvas.height / 2);
    
    bird.y += Math.sin(frameCount * 0.05) * 0.5;
}

function startCountdown() {
    if (countdownTimer > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawBird();
        drawCountdown();
        countdownTimer--;
        setTimeout(startCountdown, 1000);
    } else {
        gameStarted = true;
        update();
    }
}

function update() {
    if (!gameStarted) return;
    
    if (!gameOver && !isPaused) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (bird.y + bird.height >= canvas.height) {
            gameOver = true;
        }

        updatePipes();
        frameCount++;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawBird();
        drawPipes();

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Score: " + score, canvas.width / 2, 30);
        ctx.fillText("High Score: " + highScore, canvas.width / 2, 60);
        
        requestAnimationFrame(update);
    } else if (gameOver) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = "24px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText("High Score: " + highScore, canvas.width / 2, canvas.height / 2 + 50);
        
        document.getElementById("restartBtn").style.display = "block";
        document.getElementById("pauseBtn").style.display = "none";
    } else if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") flap();
    if (event.code === "Enter") restartGame();
    if (event.code === "KeyP") {
        if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
});

canvas.addEventListener("click", flap);

document.getElementById("restartBtn").addEventListener("click", restartGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("resumeBtn").addEventListener("click", resumeGame);

function restartGame() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    frameCount = 0;
    score = 0;
    pipeSpeed = 2;
    gameOver = false;
    countdownTimer = 3;
    gameStarted = false;
    
    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("resumeBtn").style.display = "none";
    document.getElementById("pauseBtn").style.display = "block";
    
    startCountdown();
}

function pauseGame() {
    if (gameStarted && !gameOver) {
        isPaused = true;
        document.getElementById("pauseBtn").style.display = "none";
        document.getElementById("resumeBtn").style.display = "block";
        update();
    }
}

function resumeGame() {
    if (gameStarted && !gameOver) {
        isPaused = false;
        document.getElementById("pauseBtn").style.display = "block";
        document.getElementById("resumeBtn").style.display = "none";
        update();
    }
}

function initGame() {
    if (!gameInitialized) {
        gameInitialized = true;
        document.getElementById("startBtn").style.display = "none";
        document.getElementById("pauseBtn").style.display = "block";
        startCountdown();
    }
}

document.getElementById("startBtn").addEventListener("click", initGame);

function showStartScreen() {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "20px Arial";
    ctx.fillText("Click 'Start Game' to play", canvas.width / 2, canvas.height / 2 + 20);
    
    // Make sure pause button is hidden at start
    document.getElementById("pauseBtn").style.display = "none";
}

showStartScreen();
