const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const playerNameInput = document.getElementById('player-name');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const eventMessage = document.getElementById('event-message');

let gridSize = 20;
let snake, foods, specialItems, computerSnakes;
let dx, dy;
let running = false;
let paused = false;
let speed = 150;
let score = 0;
let playerName = '';
let leaderboard = [];
let specialEffects = {
  speedUp: false,
  slowDown: false,
  invisible: false,
  reversed: false,
  invincible: false,
};
let effectTimers = {};

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', changeDirection);

function startGame() {
  playerName = playerNameInput.value.trim();
  if (playerName === '') {
    alert('請輸入名字！');
    return;
  }
  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  init();
}

function init() {
  snake = [{ x: 10, y: 10 }];
  dx = gridSize;
  dy = 0;
  foods = [];
  specialItems = [];
  computerSnakes = [
    { body: [{ x: 5, y: 5 }], dx: gridSize, dy: 0 },
    { body: [{ x: 15, y: 15 }], dx: 0, dy: gridSize },
  ];
  score = 0;
  speed = 150;
  running = true;
  paused = false;
  generateFood(5);
  update();
  setInterval(generateSpecialItem, 30000);
}

function generateFood(count = 1) {
  for (let i = 0; i < count; i++) {
    foods.push({
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    });
  }
}

function generateSpecialItem() {
  specialItems.push({
    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
    type: Math.floor(Math.random() * 7)
  });
}

function changeDirection(e) {
  if (specialEffects.reversed) {
    if (e.key === 'ArrowLeft' && dx === 0) { dx = gridSize; dy = 0; }
    else if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = gridSize; }
    else if (e.key === 'ArrowRight' && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = -gridSize; }
  } else {
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -gridSize; }
    else if (e.key === 'ArrowRight' && dx === 0) { dx = gridSize; dy = 0; }
    else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = gridSize; }
  }
}

function togglePause() {
  paused = !paused;
}

function restartGame() {
  clearInterval();
  startScreen.classList.remove('hidden');
  gameContainer.classList.add('hidden');
}

function update() {
  if (!running) return;
  if (paused) {
    setTimeout(update, speed);
    return;
  }
  moveSnake();
  moveComputerSnakes();
  checkCollision();
  draw();
  setTimeout(update, speed);
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (!eatFood()) snake.pop();
}

function moveComputerSnakes() {
  computerSnakes.forEach(compSnake => {
    if (Math.random() < 0.2) {
      const dirs = [
        { dx: gridSize, dy: 0 }, { dx: -gridSize, dy: 0 },
        { dx: 0, dy: gridSize }, { dx: 0, dy: -gridSize }
      ];
      const newDir = dirs[Math.floor(Math.random() * dirs.length)];
      compSnake.dx = newDir.dx;
      compSnake.dy = newDir.dy;
    }
    const head = { x: (compSnake.body[0].x + compSnake.dx + canvas.width) % canvas.width,
                   y: (compSnake.body[0].y + compSnake.dy + canvas.height) % canvas.height };
    compSnake.body.unshift(head);

    if (!eatFood(compSnake)) compSnake.body.pop();
    else if (Math.random() < 0.1) {  // 電腦蛇隨時間成長
      compSnake.body.push({ ...compSnake.body[compSnake.body.length-1] });
    }
  });
}

function eatFood(s = snake) {
  for (let i = 0; i < foods.length; i++) {
    if (s[0].x === foods[i].x && s[0].y === foods[i].y) {
      foods.splice(i, 1);
      if (s === snake) {
        score++;
        if (score % 5 === 0 && speed > 50) speed -= 5;
        generateFood();
      }
      return true;
    }
  }
  return false;
}

function checkCollision() {
  if (!specialEffects.invincible) {
    if (snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height) {
      endGame();
    }
    for (let i = 1; i < snake.length; i++) {
      if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
        endGame();
      }
    }
  }

  specialItems.forEach((item, index) => {
    if (snake[0].x === item.x && snake[0].y === item.y) {
      triggerSpecial(item.type);
      specialItems.splice(index, 1);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = specialEffects.invisible ? '#ffffff' : '#000000';
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
  });
  ctx.fillStyle = 'red';
  foods.forEach(f => {
    ctx.fillRect(f.x, f.y, gridSize, gridSize);
  });
  computerSnakes.forEach(compSnake => {
    ctx.fillStyle = 'blue';
    compSnake.body.forEach(segment => {
      ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
  });
  specialItems.forEach(item => {
    ctx.fillStyle = ['purple', 'cyan', 'orange', 'pink', 'green', 'yellow', 'brown'][item.type];
    ctx.fillRect(item.x, item.y, gridSize, gridSize);
  });
}

function triggerSpecial(type) {
  clearTimeout(effectTimers[type]);
  switch (type) {
    case 0: specialEffects.speedUp = true; speed = Math.max(30, speed - 50); eventMessage.textContent = '加速中！'; break;
    case 1: specialEffects.slowDown = true; speed += 50; eventMessage.textContent = '減速中！'; break;
    case 2: generateFood(5); eventMessage.textContent = '大量食物出現！'; break;
    case 3: specialEffects.invisible = true; eventMessage.textContent = '蛇透明了！'; break;
    case 4: score += 10; eventMessage.textContent = '超級大食物！'; break;
    case 5: specialEffects.invincible = true; eventMessage.textContent = '無敵模式！'; break;
    case 6: specialEffects.reversed = true; eventMessage.textContent = '方向顛倒！'; break;
  }
  effectTimers[type] = setTimeout(() => {
    specialEffects = { ...specialEffects, speedUp: false, slowDown: false, invisible: false, reversed: false, invincible: false };
    eventMessage.textContent = '';
  }, 5000);
}

function endGame() {
  running = false;
  leaderboard.push({ name: playerName, score: score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboardList.innerHTML = leaderboard.map(p => `<li>${p.name}: ${p.score}</li>`).join('');
  alert('遊戲結束！你的分數：' + score);
  restartGame();
}
