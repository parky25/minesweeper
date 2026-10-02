'use strict'
const board = document.querySelector('#board');
const topBtn = document.querySelector('#topBtn');
const bottomBtn = document.querySelector('#bottomBtn');
const winMessage = document.querySelector('#winMessage');
let flagMode = false;
let over = false;
let size = 0;
let openCount = 0;
let mineTotal = 10;
const grid = [];

mainScreen();

// 셀 열기 함수
function openCell(r, c) {
  if (r < 0 || r >= size || c < 0 || c >= size) {
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
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr;
          let nc = c + dc;
          if (!((dc === 0) && (dr === 0))) {
            openCell(nr, nc);
          } 
        }
      }
    }
    openCount++;
    if (openCount === size*size - mineTotal) {
      gameWin();
    }
  }
}

// 깃발 토글
function flagToggle(r, c) {
  if (!(grid[r][c].isOpen)) {
    grid[r][c].isFlagged = !(grid[r][c].isFlagged);
    grid[r][c].element.textContent = grid[r][c].isFlagged ? '🚩' : '';
  }
}

// 게임 종료
function gameOver() {
  over = true;
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
}

// 게임 준비 화면
function mainScreen() {
  topBtn.replaceChildren();
  board.replaceChildren();
  bottomBtn.replaceChildren();
  winMessage.textContent = '';
  diffBtnAdd('쉬움', 9, 10);
  diffBtnAdd('보통', 16, 40);
  diffBtnAdd('어려움', 22, 99);
}

//게임 화면 전환
function gameScreen() {
  topBtn.replaceChildren();
  flagBtnAdd();
  startBtnAdd();
  mainBtnAdd();
}

// 게임 시작(셀 생성, 그리드에 저장, 클릭 인식 리스너 등록)
function gameStart() {
  board.replaceChildren();
  grid.length = 0;
  over = false;
  openCount = 0;
  winMessage.textContent = '';
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
        if (over) {
          return;
        }
        if (flagMode) {
          flagToggle(r, c);
        }
        else if (!(grid[r][c].isFlagged)){
          if (openCount === 0) {
            mineCreate(r, c);
            mineNumCount();
            openCell(r, c);
          }
          else if (grid[r][c].isMine) {       
            grid[r][c].element.classList.add('exploded');
            gameOver();
          }
          else {
            openCell(r, c);
          }
        }
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
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            let nr = r + dr;
            let nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
              if (grid[nr][nc].isMine) {grid[r][c].count++;}
            }
          }
        }
      }
    }
  }
}

// 깃발 버튼
function flagBtnAdd() {
  const flagBtn = document.createElement('button');
  topBtn.appendChild(flagBtn);
  flagBtn.textContent = '깃발 모드: 꺼짐';
  flagBtn.addEventListener('click', function() {
    flagMode = !flagMode;
    flagBtn.textContent = flagMode ? '깃발 모드: 켜짐' : '깃발 모드: 꺼짐';
    flagBtn.classList.toggle('active');
  });
}

// 재시작 버튼
function startBtnAdd() {
  const startBtn = document.createElement('button');
  bottomBtn.appendChild(startBtn);
  startBtn.textContent = '재시작';
  startBtn.addEventListener('click', function() {
    gameStart();
  })
}

// 메인화면 버튼
function mainBtnAdd() {
  const mainBtn = document.createElement('button');
  bottomBtn.appendChild(mainBtn);
  mainBtn.textContent = '메인화면으로';
  mainBtn.addEventListener('click', function() {
    mainScreen();
  })
}

// 난이도 버튼
function diffBtnAdd(diff, sizeDiff, mineTotalDiff) {
  const diffBtn = document.createElement('button');
  topBtn.appendChild(diffBtn);
  diffBtn.textContent = diff;
  diffBtn.addEventListener('click', function() {
    size = sizeDiff;
    board.style.setProperty('--size', size);
    mineTotal = mineTotalDiff;
    gameScreen();
    gameStart(); 
  })
}