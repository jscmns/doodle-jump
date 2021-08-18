const grid = document.querySelector('.grid');
const doodler = document.createElement('div');
const platforms = [];
let doodlerLeftSpace = 50;
let startPoint = 150;
let doodlerBottomSpace = startPoint;
let isGameOver = false;
let platformCount = 5;
let upTimerId;
let downTimerId;
let isJumping = false;
let isGoingLeft = false;
let isGoingRight = false;
let rightTimerId;
let leftTimerId;
let score = 0;

class Platform {
  constructor(platBottom) {
    this.bottom = platBottom;

    // any number between 0 and 315, which is the left half of the platform
    this.left = Math.random() * 315;

    // Create platforms;
    this.createPlatform();
  }

  createPlatform() {
    this.drawnPlatform = document.createElement('div');
    const drawnPlatform = this.drawnPlatform;
    drawnPlatform.classList.add('platform');
    drawnPlatform.style.left = `${this.left}px`;
    drawnPlatform.style.bottom = `${this.bottom}px`;
    grid.appendChild(drawnPlatform);
  }
}

const createDoodler = () => {
  doodler.classList.add('doodler');
  grid.appendChild(doodler);
  doodlerLeftSpace = platforms[0].left;
  doodler.style.left = `${doodlerLeftSpace}px`;
  doodler.style.bottom = `${doodlerBottomSpace}px`;
};

const createPlatforms = () => {
  for (let i = 0; i < platformCount; i++) {
    // Platforms are spaced evenly inside the div, this defines that constant
    const PLATFORM_GAP = 600 / platformCount;

    /* 
        remember, multiplication is done first
        if we want 6 platforms, first one is 100 from bottom (100 + 0);
        then 200, then 100 + 2 * 100 = 100 + 200 = 300
        etc. 
    */

    const PLATFORM_BOTTOM = 100 + i * PLATFORM_GAP;
    let newPlatform = new Platform(PLATFORM_BOTTOM);
    platforms.push(newPlatform);
  }
};

const movePlatforms = () => {
  if (doodlerBottomSpace > 200) {
    // move platform up by 4, update it for every platform
    for (let platform of platforms) {
      platform.bottom -= 4;
      const drawnPlatform = platform.drawnPlatform;
      drawnPlatform.style.bottom = `${platform.bottom}px`;

      if (platform.bottom < 10) {
        // pick the first platform and remove the class to make it invisible
        // also remove it from the array and increase score
        const firstPlatform = platforms[0].drawnPlatform;
        firstPlatform.classList.remove('platform');
        score++;
        platforms.shift();

        // then add a new platform to the top
        const newPlatform = new Platform(600);
        platforms.push(newPlatform);
      }
    }
  }
};

const gameOver = () => {
  isGameOver = true;
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  grid.innerHTML = score;
  clearInterval(upTimerId);
  clearInterval(downTimerId);
  clearInterval(leftTimerId);
  clearInterval(rightTimerId);
};

const jump = () => {
  // clear down timer, making sure it stops falling
  clearInterval(downTimerId);
  isJumping = true;

  upTimerId = setInterval(() => {
    // move doodler up by 20px;
    doodlerBottomSpace += 20;
    doodler.style.bottom = `${doodlerBottomSpace}px`;
    if (doodlerBottomSpace > startPoint + 200) fall();
  }, 30);
};

const fall = () => {
  clearInterval(upTimerId);
  isJumping = false;
  // the other function increased the bottom space, this decreases it (falling)
  downTimerId = setInterval(() => {
    doodlerBottomSpace -= 5;
    doodler.style.bottom = `${doodlerBottomSpace}px`;
    if (doodlerBottomSpace <= 0) gameOver();

    // conditions for a collision to be true
    for (let platform of platforms) {
      if (
        doodlerBottomSpace >= platform.bottom &&
        doodlerBottomSpace <= platform.bottom + 15 &&
        doodlerLeftSpace + 60 >= platform.left &&
        doodlerLeftSpace <= platform.left + 85 &&
        !isJumping
      ) {
        startPoint = doodlerBottomSpace;
        jump();
      }
    }
  }, 30);
};

function moveLeft() {
  // twitches because it can't decide whether to go right or left
  // We have to clear the interval otherwise they overlap
  if (isGoingRight) {
    clearInterval(rightTimerId);
    isGoingRight = false;
  }

  isGoingLeft = true;
  leftTimerId = setInterval(() => {
    // Prevents it from exiting the screen once it hits the edge
    if (doodlerLeftSpace >= 0) {
      doodlerLeftSpace -= 5;
      doodler.style.left = `${doodlerLeftSpace}px`;
    } else {
      moveRight();
    }
  }, 30);
}

function moveRight() {
  if (isGoingLeft) {
    clearInterval(leftTimerId);
    isGoingLeft = false;
  }

  isGoingRight = true;

  rightTimerId = setInterval(() => {
    if (doodlerLeftSpace <= 340) {
      doodlerLeftSpace += 5;
      doodler.style.left = `${doodlerLeftSpace}px`;
    } else moveLeft();
  }, 30);
}

function moveStraight() {
  isGoingLeft = false;
  isGoingRight = false;
  clearInterval(rightTimerId);
  clearInterval(leftTimerId);
}

const control = (e) => {
  if (e.key === 'ArrowLeft') {
    moveLeft();
  } else if (e.key === 'ArrowRight') {
    moveRight();
  } else if (e.key === 'ArrowUp') {
    moveStraight();
  }
};

const start = () => {
  if (!isGameOver) {
    createPlatforms();
    createDoodler();
    setInterval(movePlatforms, 30);
    jump();
    document.addEventListener('keyup', control);
  }
};

// Attach to button
start();
