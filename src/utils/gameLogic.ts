import { COLS, ROWS, EMPTY } from './constants';

export const checkWinner = (
  board: number[][],
  col: number,
  row: number,
  player: number
) => {
  const horizontalWin = checkLine(board, row, 0, 0, 1, player);
  if (horizontalWin) return horizontalWin;
  const verticalWin = checkLine(board, 0, col, 1, 0, player);
  if (verticalWin) return verticalWin;
  const diagonalDownRightWin = checkDiagonal(board, player, 1, 1);
  if (diagonalDownRightWin) return diagonalDownRightWin;
  const diagonalDownLeftWin = checkDiagonal(board, player, 1, -1);
  if (diagonalDownLeftWin) return diagonalDownLeftWin;

  return null;
};

export const isBoardFull = (board: number[][]) => {
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (board[c][r] === EMPTY) {
        return false;
      }
    }
  }
  return true;
};
const checkLine = (
  board: number[][],
  startRow: number,
  startCol: number,
  rowIncrement: number,
  colIncrement: number,
  player: number
) => {
  let count = 0;
  let winningCells: [number, number][] = [];
  let tempWinningCells: [number, number][] = [];
  const maxRow = rowIncrement === 0 ? startRow + 1 : ROWS;
  const maxCol = colIncrement === 0 ? startCol + 1 : COLS;

  for (let r = startRow; r < maxRow; r++) {
    for (let c = startCol; c < maxCol; c++) {
      const currentRow = rowIncrement === 0 ? r : r + (count * rowIncrement);
      const currentCol = colIncrement === 0 ? c : c + (count * colIncrement);
      if (
        currentRow < 0 || 
        currentRow >= ROWS || 
        currentCol < 0 || 
        currentCol >= COLS
      ) {
        count = 0;
        tempWinningCells = [];
        continue;
      }

      if (board[currentCol][currentRow] === player) {
        count++;
        tempWinningCells.push([currentCol, currentRow]);
        if (count === 4) {
          winningCells = [...tempWinningCells];
          return { winningCells };
        }
      } else {
        count = 0;
        tempWinningCells = [];
      }
    }
  }

  return null;
};
const checkDiagonal = (
  board: number[][],
  player: number,
  rowIncrement: number,
  colIncrement: number
) => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let count = 0;
      let tempWinningCells: [number, number][] = [];
      for (let i = 0; i < 4; i++) {
        const currentRow = r + (i * rowIncrement);
        const currentCol = c + (i * colIncrement);
        if (
          currentRow < 0 || 
          currentRow >= ROWS || 
          currentCol < 0 || 
          currentCol >= COLS
        ) {
          break;
        }

        if (board[currentCol][currentRow] === player) {
          count++;
          tempWinningCells.push([currentCol, currentRow]);
          if (count === 4) {
            return { winningCells: tempWinningCells };
          }
        } else {
          break;
        }
      }
    }
  }

  return null;
};