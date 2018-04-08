(function (window, document) {
  destroyEverything = () => {
    document.removeEventListener('keydown', keyEvents);
    document.getElementById('tslsSnakeGameCanvas').remove();
    document.getElementById('tslsSnakeGameNotification').remove();
    document.getElementById('tslsSnakeGameHeading').remove();
  }
  if(document.getElementById('tslsSnakeGameCanvas')) {
    destroyEverything();
    return false;
  }
  const maxCanvasHeight = Math.floor(window.innerHeight/100) * 100;
  const maxCanvasWidth = Math.floor(window.innerWidth/100) * 100;
  const scoreHeadingStyle = `
    position: fixed;
    bottom: 40px;
    left: 40px;
    font-family: Arial;
    font-size: 20px;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    box-shadow: 0px 0px 2px 3px #a1a1a1;
    border-radius: 50%;
    background: #d3d3d3;
    z-index: 9998;
  `;
  const notificationStyle = `
    position: fixed;
    top: calc(50% - 35px);
    width: 40%;
    left: 30%;
    margin: 0;
    font-family: Arial;
    font-size: 2.5em;
    color: #888;
    text-align: center;
    z-index: 9999;
    background: #fff;
    padding: 10px 20px;
    box-shadow: 0px 0px 3px 5px #ccc;
    border-radius: 10px;
  `;
  const canvasStyle = `
    position: fixed;
    top: 10px;
    left: 20px;
    z-index: 9999;
    background: rgba(255,255,255, 0.3);
  `;
  const startMsg = 'Hit spacebar to play/pause';
  const gameOverMsg = 'Ohhh! your snake got hurt, hit enter to restart';
  const mycanvas = document.createElement('canvas');
  const scoreHeading = document.createElement('h3');
  const notification = document.createElement('h3');
  mycanvas.setAttribute('width', maxCanvasWidth);
  mycanvas.setAttribute('height', maxCanvasHeight);
  mycanvas.setAttribute('id', 'tslsSnakeGameCanvas');
  mycanvas.style.cssText = canvasStyle;
  scoreHeading.style.cssText = scoreHeadingStyle;
  scoreHeading.setAttribute('id', 'tslsSnakeGameHeading');
  notification.style.cssText = notificationStyle;
  notification.setAttribute('id', 'tslsSnakeGameNotification');
  notification.textContent = startMsg;
  document.body.appendChild(mycanvas);
  document.body.appendChild(scoreHeading)
  document.body.appendChild(notification)
  const context = mycanvas.getContext('2d');
  const snakeSize = 25;
  const maxX = (mycanvas.width / snakeSize) - 1;
  const maxY = (mycanvas.height / snakeSize) - 1;
  const w = mycanvas.width;
  const h = mycanvas.height;
  let isPaused;
  let isDead;
  let score;
  let snake;
  let food;

  const drawModule = (function () {
    let ctx;
    let gameloop;

    const drawSnake = (x, y) => {
      ctx.fillStyle = 'green';
      ctx.fillRect(x*snakeSize, y*snakeSize, snakeSize-2, snakeSize-2);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(x*snakeSize, y*snakeSize, snakeSize, snakeSize);
    }
  
    const drawFood = (x, y) => {
      ctx.fillStyle = 'yellow';
      const radius = snakeSize/2;
      ctx.beginPath();
      ctx.arc(x*snakeSize + radius, y*snakeSize + radius, radius + 2, 0, 2*Math.PI);
      ctx.fill();
      //ctx.fillRect(x*snakeSize, y*snakeSize, snakeSize, snakeSize);
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(x*snakeSize + radius, y*snakeSize + radius, radius, 0, 2*Math.PI);
      ctx.fill();
      //ctx.fillRect(x*snakeSize+1, y*snakeSize+1, snakeSize-2, snakeSize-2);
    }
  
    const drawScore = function() {
      scoreHeading.textContent = score
      //level settings
      if(score == 10) start(70)
      if(score == 20) start(60)
      if(score == 30) start(50)
      if(score == 50) start(40)
      if(score == 70) start(30)
    }
  
    const createFood = function() {
      food = {
        x: Math.floor((Math.random() * maxX) + 1),
        y: Math.floor((Math.random() * maxY) + 1)
      }
  
      for (let i=0; i>snake.length; i++) {
        const snakeX = snake[i].x;
        const snakeY = snake[i].y;
      
        if (food.x===snakeX && food.y === snakeY || food.y === snakeY && food.x===snakeX) {
          food.x = Math.floor((Math.random() * maxX) + 1);
          food.y = Math.floor((Math.random() * maxY) + 1);
        }
      }
    }
  
    const initializeSnake = function() {
        snake = [];
        score = 0;
        for (let i = 6; i>0; i--) {
            snake.push({x:i, y:0});
        }
    }
      
    const paint = function(){
        //ctx.fillStyle = 'transparent';
        try{ctx.clearRect(0, 0, w, h)}catch(e){}
        ctx.rect(0, 0, w, h);
        
        let snakeX = snake[0].x;
        let snakeY = snake[0].y;
  
        if (snakeDirection == 'right') { 
          snakeX++; }
        else if (snakeDirection == 'left') { 
          snakeX--; }
        else if (snakeDirection == 'up') { 
          snakeY--; 
        } else if(snakeDirection == 'down') { 
          snakeY++; }
        if (snakeX == -1 || snakeX == w/snakeSize || snakeY == -1 || snakeY == h/snakeSize || checkCollision(snakeX, snakeY, snake)) {
            //Stop game
            clearInterval(gameloop);
            isDead = true;
            notification.textContent = gameOverMsg;
            notification.style.display = 'block';
        }
        let tail;
        if(snakeX == food.x && snakeY == food.y) {
          tail = {x: snakeX, y: snakeY}; //Create a new head instead of moving the tail
          score ++;
          
          createFood(); //Create new food
        } else {
          tail = snake.pop(); //pops out the last cell
          tail.x = snakeX; 
          tail.y = snakeY;
        }
        //The snake can now eat the food.
        snake.unshift(tail); //puts back the tail as the first cell

        for(let i = 0; i < snake.length; i++) {
          drawSnake(snake[i].x, snake[i].y);
        } 
        
        drawFood(food.x, food.y); 
        drawScore();
    }
  
    const checkCollision = function(x, y, array) {
        for(let i = 0; i < array.length; i++) {
          if(array[i].x === x && array[i].y === y) {
            return true;
          }
          
        } 
        return false;
    }
  
    const init = context => {
      notification.textContent = startMsg;
      isDead = false;
      ctx = context;
      snakeDirection = 'right';
      pause();
      initializeSnake();
      createFood();
      paint();
    }
  
    const pause = () => {
      if(isPaused || isDead) return false;
      try{clearInterval(gameloop);}catch(e){}
      notification.style.display = 'block';
      gameloop = false;
      isPaused= true;
  
    }
  
    const resume = () => {
      if(!isPaused || isDead) return false;
      notification.style.display = 'none';
      isPaused= false;
      start(80);
    }
  
    const start = speed => {
      if(gameloop) {
        try {
          clearInterval(gameloop);
          gameloop = false;
        }catch(e) {}  
      }
      gameloop = setInterval(paint, speed);
    }
  
  
    return {
      init : init,
      pause: pause,
      resume: resume
    };
  }());

drawModule.init(context);

function keyEvents(event) {
  event.preventDefault();
  const { keyCode } = event;
  if(keyCode === 32) {
    if(isPaused) drawModule.resume();
    else drawModule.pause();
  }

  if(keyCode === 13) {
    drawModule.init(context);
  }

  if(isPaused) return false;
  switch(keyCode) {
    
    case 37: 
      if (snakeDirection != 'right')  snakeDirection = 'left';
      break;

    case 39:
      if (snakeDirection != 'left') snakeDirection = 'right';
      break;

    case 38:
      if (snakeDirection != 'down') snakeDirection = 'up';
      break;

    case 40:
      if (snakeDirection != 'up') snakeDirection = 'down';
      break;
  }
}
document.addEventListener('keydown', keyEvents);

})(window, document);
