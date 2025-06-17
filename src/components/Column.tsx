import React from 'react';
import Cell from './Cell';
import { EMPTY, PLAYER1, PLAYER2 } from '../utils/constants';

interface ColumnProps {
  column: number[];
  colIndex: number;
  dropPiece: (colIndex: number) => void;
  currentPlayer: number;
  winningCells: [number, number][];
  gameOver: boolean;
  isHovered: boolean;
  setHoveredColumn: (colIndex: number | null) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  colIndex,
  dropPiece,
  currentPlayer,
  winningCells,
  gameOver,
  isHovered,
  setHoveredColumn,
}) => {
  const handleClick = () => {
    if (!gameOver) {
      dropPiece(colIndex);
    }
  };

  const isColumnFull = !column.includes(EMPTY);
  
  // Determine the color for the hover effect
  const getHoverColor = () => {
    if (isColumnFull || gameOver) return 'transparent';
    return currentPlayer === PLAYER1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)';
  };

  return (
    <div
      className={`flex flex-col cursor-pointer transition-all duration-150 ${
        isColumnFull || gameOver ? 'cursor-not-allowed' : 'hover:bg-opacity-20'
      }`}
      onClick={handleClick}
      onMouseEnter={() => !gameOver && setHoveredColumn(colIndex)}
      style={{
        backgroundColor: isHovered ? getHoverColor() : 'transparent',
        borderRadius: '4px',
      }}
    >
      {column.map((cell, rowIndex) => {
        const isWinningCell = winningCells.some(
          ([c, r]) => c === colIndex && r === rowIndex
        );
        
        return (
          <Cell
            key={rowIndex}
            value={cell}
            isWinningCell={isWinningCell}
            colIndex={colIndex}
            rowIndex={rowIndex}
          />
        );
      })}
    </div>
  );
};

export default Column;