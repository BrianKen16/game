const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');
const gameContainer = document.getElementById('gameContainer');
const playerNameInput = document.getElementById('playerName');
const scoreBoard = document.getElementById('scoreBoard');
const countdownDiv = document.getElementById('countdown');

const gridSize = 20;
let snake, direction, food, running, playerName, paused;
let computerSnakes = [];
let score = 0;
let speed = 200;
let specialItems = [];
let reverseControl = false;
let specialItemInterval;
let countdownTimer;

startButton.addEventListener('click', () => {
  playerName = playerNameInput.value.trim();
  if (playerName) {
    startScreen.classList.add('hidden');
    countdownDiv.classList.remove('hidden');
    let count = 3;
    countdownDiv.textContent = count;
    countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownDiv.textContent = count;
      } else {
        clearInterval(countdownTimer);
        countdownDiv.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        init();
      }
    }, 1000);
  }
});

restartButton.addEventListener('click', restartGame);
pauseButton.addEventListener('click', () => {
  paused = !paused;
});

function restartGame() {
  clearInterval(specialItemInterval);
  clearInterval(countdownTimer);
  startScreen.classList.remove('hidden');
  gameContainer.classList.add('hidden');
  countdownDiv.classList.add('hidden');
  running = false;
}

function init() {
  snake = [{x: 10, y: 10}];
  direction = {x: 1, y: 0};
  food = randomPosition();
  computerSnakes = Array.from({length: 3}, () => ({
    body: [randomPosition()],
    direction: randomDirection()
  }));
  score = 0;
  speed = 200;
  specialItems = [];
  reverseControl = false;
  running = true;
  paused = false;
  specialItemInterval = setInterval(generateSpecialItem, 10000);
  update();
}

function randomPosition() {
  return {
    x: Math.floor(Math.random() * (canvas.width / gridSize)),
    y: Math.floor(Math.random() * (canvas.height / gridSize))
  };
}

function randomDirection() {
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function update() {
  if (!running) return;
  if (paused) {
    setTimeout(update, speed);
    return;
  }

  moveSnake(snake, direction, false);

  for (let compSnake of computerSnakes) {
    if (Math.random() < 0.1) {
      compSnake.direction = randomDirection();
    }
    moveSnake(compSnake.body, compSnake.direction, true);
  }

  checkCollision();
  draw();
  setTimeout(update, speed);
}

function moveSnake(snakeBody, moveDirection, isComputer) {
  const head = {...snakeBody[0]};
  head.x += moveDirection.x;
  head.y += moveDirection.y;

  if (isComputer) {
    // 電腦蛇可以穿牆
    if (head.x < 0) head.x = canvas.width / gridSize - 1;
    if (head.x >= canvas.width / gridSize) head.x = 0;
    if (head.y < 0) head.y = canvas.height / gridSize - 1;
    if (head.y >= canvas.height / gridSize) head.y = 0;
  } else {
    // 玩家撞牆就死
    if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize) {
      running = false;
      alert('遊戲結束！分數：' + score);
      return;
    }
  }

  snakeBody.unshift(head);

  if (!eatFood(snakeBody)) {
    snakeBody.pop();
  }
}

function eatFood(snakeBody) {
  if (snakeBody[0].x === food.x && snakeBody[0].y === food.y) {
    score++;
    food = randomPosition();
    speed = Math.max(50, speed - 5);
    return true;
  }
  for (let i = 0; i < specialItems.length; i++) {
    if (snakeBody[0].x === specialItems[i].x && snakeBody[0].y === specialItems[i].y) {
      triggerSpecialItem(specialItems[i].type);
      specialItems.splice(i, 1);
      return true;
    }
  }
  return false;
}

function triggerSpecialItem(type) {
  switch(type) {
    case 0: speed = Math.max(30, speed - 20); break; // 加速
    case 1: speed += 20; break; // 減速
    case 2: score += 5; break; // 加分
    case 3: score = Math.max(0, score - 5); break; // 扣分
    case 4: specialItems = []; break; // 清除道具
    case 5: reverseControl = true; setTimeout(() => reverseControl = false, 10000); break; // 顛倒方向
    case 6: snake.push({x: snake[snake.length-1].x, y: snake[snake.length-1].y}); break; // 增加長度
  }
}

function generateSpecialItem() {
  specialItems.push({
    x: Math.floor(Math.random() * (canvas.width / gridSize)),
    y: Math.floor(Math.random() * (canvas.height / gridSize)),
    type: Math.floor(Math.random() * 7)
  });
}

function checkCollision() {
  const head = snake[0];
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      running = false;
      alert('自己撞自己！分數：' + score);
      return;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 畫玩家
  ctx.fillStyle = 'green';
  snake.forEach(part => {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
  });

  // 畫食物
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // 畫電腦蛇
  ctx.fillStyle = 'blue';
  computerSnakes.forEach(snake => {
    snake.body.forEach(part => {
      ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
    if (Math.random() < 0.02) {
      snake.body.push({...snake.body[snake.body.length-1]}); // 電腦蛇隨機增長
    }
  });

  // 畫特殊道具
  specialItems.forEach(item => {
    const colors = ['purple', 'cyan', 'orange', 'pink', 'lime', 'yellow', 'brown'];
    ctx.fillStyle = colors[item.type] || 'black';
    ctx.fillRect(item.x * gridSize, item.y * gridSize, gridSize, gridSize);
  });

  // 更新分數
  scoreBoard.innerText = `${playerName} 的分數：${score}`;
}

document.addEventListener('keydown', changeDirection);

function changeDirection(e) {
  if (reverseControl) {
    if (e.key === 'ArrowLeft') direction = {x:1, y:0};
    else if (e.key === 'ArrowRight') direction = {x:-1, y:0};
    else if (e.key === 'ArrowUp') direction = {x:0, y:1};
    else if (e.key === 'ArrowDown') direction = {x:0, y:-1};
  } else {
    if (e.key === 'ArrowLeft') direction = {x:-1, y:0};
    else if (e.key === 'ArrowRight') direction = {x:1, y:0};
    else if (e.key === 'ArrowUp') direction = {x:0, y:-1};
    else if (e.key === 'ArrowDown') direction = {x:0, y:1};
  }
}
