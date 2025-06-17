export function checkWinner(board, player) {
  const COLS = board.length;
  const ROWS = board[0].length;

  // Directions: [dx, dy]
  const directions = [
    [1, 0],   // horizontal
    [0, 1],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal up-right
  ];

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (board[col][row] !== player) continue;
      for (const [dx, dy] of directions) {
        let count = 1;
        let c = col + dx;
        let r = row + dy;
        while (
          c >= 0 && c < COLS &&
          r >= 0 && r < ROWS &&
          board[c][r] === player
        ) {
          count++;
          if (count === 4) return true;
          c += dx;
          r += dy;
        }
      }
    }
  }
  return false;
}