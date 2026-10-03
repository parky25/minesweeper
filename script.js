'use strict'
const mainScreen = document.querySelector('#mainScreen');
const gameScreen = document.querySelector('#gameScreen');
const scoreScreen = document.querySelector('#scoreScreen');
const board = document.querySelector('#board');
const diffBoard = document.querySelector('#diffBoard');
const scoreBtn = document.querySelector('#scoreBtn');
const timeMessage = document.querySelector('#timeMessage');
const mineNumMessage = document.querySelector('#mineNumMessage');
const flagBtn = document.querySelector('#flagBtn');
const startBtn = document.querySelector('#startBtn');
const mainBtn = document.querySelector('#mainBtn');
const mainBtn2 = document.querySelector('#mainBtn2');
const winMessage = document.querySelector('#winMessage');
const easyBest = document.querySelector('#easyBest');
const normalBest = document.querySelector('#normalBest');
const hardBest = document.querySelector('#hardBest');
let timer;
let startTime;
let curTime;
let clickShort = true;
let clickLong;
let flagMode = false;
let over = false;
let size = 0;
let difficulty = 'easy'; 
let openCount = 0;
let mineTotal = 10;
let flagCount = 0;
let mineLeft = mineTotal - flagCount;
const grid = [];
let diffDic = {easy: '쉬움', normal: '보통', hard: '어려움'};

// 난이도 버튼 추가 및 리스너 장착
diffBtnAdd('easy', 9, 10);
diffBtnAdd('normal', 16, 40);
diffBtnAdd('hard', 22, 99);
startBtn.textContent = '재시작';
startBtn.addEventListener('click', function () {
  clearInterval(timer);
  gameStart();
});
flagBtn.textContent = '깃발 모드: 꺼짐';
flagBtn.addEventListener('click', function () {
  flagMode = !flagMode;
  flagBtn.textContent = flagMode ? '깃발 모드: 켜짐' : '깃발 모드: 꺼짐';
  flagBtn.classList.toggle('active');
});
mainBtn.textContent = '메인화면으로';
mainBtn.addEventListener('click', function () {
  clearInterval(timer);
  mainScreenShow();
});
mainBtn2.textContent = '메인화면으로';
mainBtn2.addEventListener('click', function () {
  mainScreenShow();
});
scoreBtn.textContent = '최고기록';
scoreBtn.addEventListener('click', function () {
  scoreScreenShow();
});

// 첫 시작
mainScreenShow();
board.addEventListener('contextmenu', function (e) {
  e.preventDefault();
})

// 셀 열기 함수
function openCell(r, c) {
  if (over) {
    return;
  }
  if (grid[r][c].isOpen) {
    return;
  }
  if (grid[r][c].isFlagged) {
    return;
  }
  else {
    grid[r][c].isOpen = true;
    grid[r][c].element.classList.add('open');
    if (grid[r][c].count > 0) {
      grid[r][c].element.textContent = grid[r][c].count;
    }
    else {
      repeat8(r, c, function (nr, nc) {
        openCell(nr, nc);
      });
    }
    openCount++;
    if (openCount === size*size - mineTotal) {
      gameWin();
    }
  }
}

// 코드(숫자 칸 눌러 주변 열기)
function chord(r, c) {
  if (over) {
    return;
  }
  let surNum = 0;
  repeat8(r, c, function (nr, nc) {
    if (grid[nr][nc].isFlagged) {surNum++;}
  });
  if (surNum === grid[r][c].count) {
    repeat8(r, c, function (nr, nc) {
      click(nr, nc);
    });
  }
}

// 깃발 토글
function flagToggle(r, c) {
  if (over) {
    return;
  }
  if (!(grid[r][c].isOpen)) {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    grid[r][c].isFlagged = !(grid[r][c].isFlagged);
    if (grid[r][c].isFlagged) {
      flagCount++;
    }
    else {
      flagCount--;
    }
    mineLeft = mineTotal - flagCount;
    mineNumMessage.textContent = `남은 지뢰 수: ${mineLeft}`;
    grid[r][c].element.textContent = grid[r][c].isFlagged ? '🚩' : '';
  }
}

// 게임 종료
function gameOver() {
  over = true;
  clearInterval(timer);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].isMine) {
        grid[r][c].element.textContent = '💣';
      } 
    }
  }
}

// 게임 승리
function gameWin() {
  winMessage.textContent = '🎉 승리!';
  over = true;
  clearInterval(timer);
  let timeRec = ((curTime - startTime) / 1000).toFixed(2);
  let recName = 'minesweeper-bestscore-' + difficulty;
  let bestRec = Number(localStorage.getItem('recName'));
  if (bestRec !== 0) {
    if (timeRec < bestRec) {bestRec = timeRec;}
  }
  else {
    bestRec = timeRec;
  }
  localStorage.setItem(recName, bestRec);
}

// 게임 준비 화면
function mainScreenShow() {
  mainScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  scoreScreen.classList.add('hidden');
  clearInterval(timer);
}

function scoreScreenShow() {
  scoreScreen.classList.remove('hidden');
  mainScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  scoreWrite('minesweeper-bestscore-easy', easyBest, '쉬움');
  scoreWrite('minesweeper-bestscore-normal', normalBest, '보통');
  scoreWrite('minesweeper-bestscore-hard', hardBest, '어려움');
}

//게임 화면 전환
function gameScreenShow() {
  gameScreen.classList.remove('hidden');
  mainScreen.classList.add('hidden');
  scoreScreen.classList.add('hideen');
}

// 게임 시작(셀 생성, 그리드에 저장, 클릭 인식 리스너 등록)
function gameStart() {
  board.replaceChildren();
  grid.length = 0;
  over = false;
  openCount = 0;
  flagCount = 0;
  winMessage.textContent = '';
  clearInterval(timer);
  timeMessage.textContent = '지난 시간: 0.0s';
  mineLeft = mineTotal - flagCount;
  mineNumMessage.textContent = `남은 지뢰 수: ${mineLeft}`;
  for (let r = 0; r < size; r++) {
    const gridSub = [];
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      board.appendChild(cell);
      gridSub.push({
        element: cell,
        isMine: false,
        count: 0,
        isOpen: false,
        isFlagged: false
      });
      cell.addEventListener('click', function () {
        if (!clickShort) {
          return;
        }
        if (flagMode) {
          flagToggle(r, c);
        }
        else if (grid[r][c].isOpen) {
          chord(r, c);
        }
        else {
          click(r, c);
        }
      });
      cell.addEventListener('pointerdown', function() {
        clickShort = true;
        clickLong = setTimeout(function () {
          flagToggle(r, c);
          clickShort = false;
        }, 500);
      });
      cell.addEventListener('pointerup', function() {
        clearTimeout(clickLong);
      });
      cell.addEventListener('pointerleave', function() {
        clearTimeout(clickLong);
      });
      cell.addEventListener('pointercancel', function() {
        clearTimeout(clickLong);
      });
    }
    grid.push(gridSub);
  }
}
  
// 지뢰 생성
function mineCreate(fr, fc) {
  let mineCount = 0;
  while (mineCount < mineTotal) {
    let r = Math.floor(Math.random() * size);
    let c = Math.floor(Math.random() * size);
    if (!grid[r][c].isMine) {
      if ((Math.abs(r - fr) > 1) || (Math.abs(c - fc) > 1)) {
        grid[r][c].isMine = true;
        mineCount++;
      }
    }
  }
}

// 주변 지뢰 개수 count
function mineNumCount() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].isMine) {
        repeat8(r, c, function (nr, nc) {
          if (grid[nr][nc].isMine) {
            grid[r][c].count++;
          }
        });
      }
    }
  }
}

// 클릭
function click(r, c) {
  if (over) {
    return;
  }
  if (!(grid[r][c].isFlagged)){
    if (openCount === 0) {
      mineCreate(r, c);
      mineNumCount();
      openCell(r, c);
      timeCount();
    }
    else if (grid[r][c].isMine) {       
      grid[r][c].element.classList.add('exploded');
      gameOver();
    }
    else {
      openCell(r, c);
    }
  }
}

// 난이도 버튼
function diffBtnAdd(diff, sizeDiff, mineTotalDiff) {
  const diffBtn = document.createElement('button');
  diffBoard.appendChild(diffBtn);
  diffBtn.textContent = diffDic[diff];
  diffBtn.addEventListener('click', function() {
    size = sizeDiff;
    board.style.setProperty('--size', size);
    mineTotal = mineTotalDiff;
    difficulty = diff;
    gameScreenShow();
    gameStart(); 
  });
}

// 시간 표시
function timeCount() {
  startTime = Date.now();
  timer = setInterval(function () {
    curTime = Date.now();
    let time = ((curTime - startTime) / 1000).toFixed(1);
    timeMessage.textContent = `지난 시간: ${time}s`;
  }, 5);
}

// 최고기록 쓰기
function scoreWrite(storageName, elementName, diffName) {
  let scoreValue = Number(localStorage.getItem(storageName));
  if (scoreValue === 0) {
    elementName.textContent = diffName + ': 기록 없음';
  }
  else {
    elementName.textContent = diffName + ': ' + scoreValue + 's';
  }
}

// 주변 8칸 순회
function repeat8(r, c, action) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      let nr = r + dr;
      let nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (!((dc === 0) && (dr === 0))) {
          action(nr, nc);
        }
      }
    }
  }
}