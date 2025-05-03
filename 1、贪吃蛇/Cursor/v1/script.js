// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const speedControl = document.getElementById('speed-control');
const speedValue = document.getElementById('speed-value');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

// 游戏参数
const gridSize = 20; // 网格大小
const initialSpeed = 5; // 初始速度
let speed = initialSpeed;
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// 蛇的初始位置和方向
let snake = [
    { x: 5, y: 5 }
];
let direction = 'right';
let nextDirection = 'right';

// 食物位置
let food = generateFood();

// 初始化游戏
function init() {
    // 绘制初始状态
    clearCanvas();
    drawSnake();
    drawFood();
    
    // 设置速度控制
    speedControl.value = initialSpeed;
    speedValue.textContent = initialSpeed;
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        
        // 重置蛇的位置和方向
        snake = [{ x: 5, y: 5 }];
        direction = 'right';
        nextDirection = 'right';
        
        // 生成新食物
        food = generateFood();
        
        // 开始游戏循环
        gameLoop = setInterval(update, 1000 / speed);
    }
}

// 暂停游戏
function pauseGame() {
    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        gamePaused = true;
    } else if (gameRunning && gamePaused) {
        gameLoop = setInterval(update, 1000 / speed);
        gamePaused = false;
    }
}

// 重新开始游戏
function restartGame() {
    // 停止当前游戏循环
    if (gameRunning) {
        clearInterval(gameLoop);
    }
    
    // 重置游戏状态
    gameRunning = false;
    gamePaused = false;
    score = 0;
    scoreElement.textContent = score;
    
    // 重置蛇和食物
    snake = [{ x: 5, y: 5 }];
    direction = 'right';
    nextDirection = 'right';
    food = generateFood();
    
    // 重绘画布
    clearCanvas();
    drawSnake();
    drawFood();
}

// 更新游戏状态
function update() {
    // 更新蛇的方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 不移除蛇尾，让蛇变长
        // 生成新食物
        food = generateFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 重绘画布
    clearCanvas();
    drawSnake();
    drawFood();
}

// 移动蛇
function moveSnake() {
    // 获取蛇头位置
    const head = { x: snake[0].x, y: snake[0].y };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新蛇头添加到蛇身前面
    snake.unshift(head);
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= canvas.width / gridSize ||
        head.y < 0 || head.y >= canvas.height / gridSize) {
        return true;
    }
    
    // 检查是否撞到自己的身体
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    alert(`游戏结束！你的得分是: ${score}`);
}

// 生成食物
function generateFood() {
    let newFood;
    let foodOnSnake;
    
    // 确保食物不会生成在蛇身上
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
        
        // 检查食物是否在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    return newFood;
}

// 清空画布
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 蛇头和蛇身使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50'; // 蛇头颜色
        } else {
            ctx.fillStyle = '#8BC34A'; // 蛇身颜色
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 添加边框
        ctx.strokeStyle = '#388E3C';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 为蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            
            // 根据方向绘制眼睛
            switch (direction) {
                case 'up':
                    ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, 4, 4);
                    ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 4, 4, 4);
                    break;
                case 'down':
                    ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 12, 4, 4);
                    ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 12, 4, 4);
                    break;
                case 'left':
                    ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, 4, 4);
                    ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 12, 4, 4);
                    break;
                case 'right':
                    ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 4, 4, 4);
                    ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 12, 4, 4);
                    break;
            }
        }
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#F44336'; // 食物颜色
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2 - 3,
        food.y * gridSize + gridSize / 2 - 3,
        gridSize / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 键盘事件监听
document.addEventListener('keydown', (event) => {
    // 防止方向键滚动页面
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // 只有在游戏运行时才响应方向键
    if (gameRunning && !gamePaused) {
        switch (event.keyCode) {
            // 上方向键
            case 38:
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                break;
            // 下方向键
            case 40:
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                break;
            // 左方向键
            case 37:
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                break;
            // 右方向键
            case 39:
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                break;
        }
    }
});

// 速度控制事件监听
speedControl.addEventListener('input', () => {
    speed = parseInt(speedControl.value);
    speedValue.textContent = speed;
    
    // 如果游戏正在运行，更新游戏循环速度
    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 / speed);
    }
});

// 按钮事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// 初始化游戏
init();