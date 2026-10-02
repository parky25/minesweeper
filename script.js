const board = document.querySelector('#board');
const winMessage = document.querySelector('#winMessage');
let flagMode = false;
let over = false;
let size = 0;
let openCount = 0;
let mineTotal = 10;
const grid = [];

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
const difficulty = document.querySelector('#difficulty')
const easyButton = document.createElement('button');
difficulty.appendChild(easyButton);
easyButton.textContent = '쉬움';
easyButton.addEventListener('click', function() {
  size = 9;
  board.style.setProperty('--size', size);
  gameScreen();
  gameStart();
});
const normalButton = document.createElement('button');
difficulty.appendChild(normalButton);
normalButton.textContent = '보통';
normalButton.addEventListener('click', function() {
  size = 16;
  board.style.setProperty('--size', size);
  gameScreen();
  gameStart();
});
const hardButton = document.createElement('button');
difficulty.appendChild(hardButton);
hardButton.textContent = '어려움';
hardButton.addEventListener('click', function() {
  size = 22;
  board.style.setProperty('--size', size);
  gameScreen();
  gameStart();
});

//게임 화면 전환
function gameScreen() {
  difficulty.replaceChildren();
  flagBtnAdd();
  startBtnAdd();
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
          if (grid[r][c].isMine) {
            if (openCount === 0) {
              mineCreate(r, c);
              mineNumCount();
              openCell(r, c);
            }
            else {
              grid[r][c].element.classList.add('exploded');
              gameOver();
            }
          }
          else {
            openCell(r, c);
          }
        }
      });
    }
    grid.push(gridSub);
  }
  mineCreate(-1, -1);
  mineNumCount();
}
  
// 지뢰 생성
function mineCreate(fr, fc) {
  if (fr >= 0) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        grid[i][j].isMine = false;
        grid[i][j].count = 0;
      }
    }
  }
  let mineCount = 0;
  while (mineCount < mineTotal) {
    let r = Math.floor(Math.random() * size);
    let c = Math.floor(Math.random() * size);
    if (!grid[r][c].isMine && !((fr === r) && (fc === c))) {
      grid[r][c].isMine = true;
      mineCount++;
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
  const flagBtnBoard = document.querySelector('#flagBtnBoard');
  flagBtnBoard.appendChild(flagBtn);
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
  const startBtnBoard = document.querySelector('#startBtnBoard');
  startBtnBoard.appendChild(startBtn);
  startBtn.textContent = '재시작';
  startBtn.addEventListener('click', function() {
    gameStart();
  })
}