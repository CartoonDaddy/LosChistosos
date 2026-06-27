const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const top3List = document.getElementById('top3List');
const nickInput = document.getElementById('nick');

const gridSize = 20;
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 1;
let dy = 0;
let score = 0;
let speed = 100;
let gameInterval = setInterval(draw, speed);

displayRanking();

function displayRanking() {
    const topScores = JSON.parse(localStorage.getItem('korkys_scores')) || [];
    top3List.innerHTML = '';
    topScores.forEach(entry => {
        const li = document.createElement('li');
        li.innerText = `${entry.id}: ${entry.score} pts`;
        top3List.appendChild(li);
    });
}

function updateRanking(finalScore) {
    let topScores = JSON.parse(localStorage.getItem('korkys_scores')) || [];
    if (topScores.length < 3 || finalScore > topScores[topScores.length - 1].score) {
        let id = nickInput.value.trim() || "Anon";
        topScores.push({id: id, score: finalScore});
        topScores.sort((a,b) => b.score - a.score);
        topScores = topScores.slice(0, 3);
        localStorage.setItem('korkys_scores', JSON.stringify(topScores));
        displayRanking();
    }
}

function restartGame() {
    updateRanking(score);
    snake = [{x: 10, y: 10}];
    dx = 1;
    dy = 0;
    score = 0;
    speed = 100;
    scoreElement.innerText = score;
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, speed);
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glow effects
    ctx.shadowBlur = 15;

    // Draw snake (prettier rounded segments)
    ctx.shadowColor = '#0f0';
    ctx.fillStyle = '#0f0';
    snake.forEach(part => {
        ctx.beginPath();
        ctx.roundRect(part.x * gridSize + 2, part.y * gridSize + 2, gridSize - 4, gridSize - 4, 6);
        ctx.fill();
    });

    // Draw food (circle instead of square)
    ctx.shadowColor = '#f00';
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Movement
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
        score++;
        scoreElement.innerText = score;

        // Aumentar velocidad: reducir intervalo, mínimo 50ms
        if (speed > 50) {
            speed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(draw, speed);
        }
    } else {
        snake.pop();
    }

    // Game over
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
        restartGame();
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
    if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
    if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
});