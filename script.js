const board = document.querySelector('#board');
let flagMode = false;
let over = false;
let openCount = 0;
let size = 9;
let mineTotal = 10;

// 셀 열기 함수
function openCell(r, c) {
  if (r < 0 || r >= size || c < 0 || c >= size) {
    return;
  }
  if (grid[r][c].isOpen) {
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
          nr = r + dr;
          nc = c + dc;
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
  const message = document.querySelector('#winMessage');
  message.textContent = '🎉 승리!';
}

// 셀 생성 / 그리드에 저장 / 클릭 인식 리스너 등록
const grid = [];
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

// 지뢰 생성
let mineCount = 0;
while (mineCount < mineTotal) {
  let r = Math.floor(Math.random() * size);
  let c = Math.floor(Math.random() * size);
  if (!grid[r][c].isMine) {
    grid[r][c].isMine = true;
    mineCount++;
  }
}

// 주변 지뢰 개수 count
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (!grid[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          nr = r + dr;
          nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (grid[nr][nc].isMine) {grid[r][c].count++;}
          }
        }
      }
    }
  }
}

// 깃발 버튼
const flagBtn = document.querySelector('#flagBtn');
flagBtn.addEventListener('click', function() {
  flagMode = !flagMode;
  flagBtn.textContent = flagMode ? '깃발 모드: 켜짐' : '깃발 모드: 꺼짐';
  flagBtn.classList.toggle('active');
});