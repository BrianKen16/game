const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const effectDisplay = document.getElementById('effectDisplay');

let gameInterval;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = { x: 15, y: 15 };
let specialFood = { x: 20, y: 20 };
let gridSize = 20;
let tileCountX, tileCountY;
let score = 0;
let isPaused = false;
let reverseControl = false;
let effectTimeout;

// 調整畫布大小
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  tileCountX = Math.floor(canvas.width / gridSize);
  tileCountY = Math.floor(canvas.height / gridSize);
}
window.addEventListener('resize', resizeCanvas);

// 初始化
resizeCanvas();

// 開始遊戲
startButton.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  startGame();
});

function startGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  score = 0;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 150);
}

function gameLoop() {
  if (isPaused) return;

  // 移動
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY || snake.some(s => s.x === head.x && s.y === head.y)) {
    clearInterval(gameInterval);
    alert("遊戲結束！");
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    spawnFood();
    score++;
  } else if (head.x === specialFood.x && head.y === specialFood.y) {
    spawnSpecialFood();
    triggerSpecialEffect();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 畫蛇
  ctx.fillStyle = 'green';
  snake.forEach(part => {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
  });

  // 畫食物
  ctx.fillStyle = 'blue';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

  // 畫特殊方塊
  ctx.fillStyle = 'purple';
  ctx.fillRect(specialFood.x * gridSize, specialFood.y * gridSize, gridSize - 2, gridSize - 2);
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * tileCountX),
    y: Math.floor(Math.random() * tileCountY)
  };
}

function spawnSpecialFood() {
  specialFood = {
    x: Math.floor(Math.random() * tileCountX),
    y: Math.floor(Math.random() * tileCountY)
  };
}

function triggerSpecialEffect() {
  const effects = ["加速", "減速", "左右顛倒", "尾巴減少"];
  const effect = effects[Math.floor(Math.random() * effects.length)];
  showEffect(effect);

  if (effect === "加速") {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
    resetEffectAfter(5000, 150);
  } else if (effect === "減速") {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 200);
    resetEffectAfter(5000, 150);
  } else if (effect === "左右顛倒") {
    reverseControl = true;
    resetEffectAfter(5000, 150, true);
  } else if (effect === "尾巴減少") {
    snake.splice(-3);
  }
}

function showEffect(text) {
  effectDisplay.textContent = text;
  effectDisplay.classList.remove('hidden');
}

function hideEffect() {
  effectDisplay.classList.add('hidden');
}

function resetEffectAfter(ms, speed, resetReverse = false) {
  if (effectTimeout) clearTimeout(effectTimeout);
  effectTimeout = setTimeout(() => {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
    if (resetReverse) reverseControl = false;
    hideEffect();
  }, ms);
}

// 控制方向
window.addEventListener('keydown', e => {
  const key = e.key;
  if (!reverseControl) {
    if (key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -1 };
    if (key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 1 };
    if (key === 'ArrowLeft' && direction.x === 0) direction = { x: -1, y: 0 };
    if (key === 'ArrowRight' && direction.x === 0) direction = { x: 1, y: 0 };
  } else {
    if (key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -1 };
    if (key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 1 };
    if (key === 'ArrowLeft' && direction.x === 0) direction = { x: 1, y: 0 };
    if (key === 'ArrowRight' && direction.x === 0) direction = { x: -1, y: 0 };
  }
});
