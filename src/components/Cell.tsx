import React from 'react';
import { EMPTY, PLAYER1, PLAYER2 } from '../utils/constants';
import { CircleDashed } from 'lucide-react';

interface CellProps {
  value: number;
  isWinningCell: boolean;
  colIndex: number;
  rowIndex: number;
}

const Cell: React.FC<CellProps> = ({ value, isWinningCell, colIndex, rowIndex }) => {
  // Détermine la couleur et le style du pion
  const getCellStyle = () => {
    if (value === PLAYER1) {
      return {
        className: `w-full h-full rounded-full bg-red-500 border-2 border-red-600 
          ${isWinningCell ? 'animate-pulse shadow-lg cell-winner' : ''}
          transition-all duration-300 transform`,
        style: {
          boxShadow: isWinningCell
            ? '0 0 16px 4px rgba(239, 68, 68, 0.8)'
            : 'inset 0px -3px 0px rgba(0,0,0,0.2)',
        },
        label: 'Pion rouge',
      };
    }
    if (value === PLAYER2) {
      return {
        className: `w-full h-full rounded-full bg-yellow-400 border-2 border-yellow-500 
          ${isWinningCell ? 'animate-pulse shadow-lg cell-winner' : ''}
          transition-all duration-300 transform`,
        style: {
          boxShadow: isWinningCell
            ? '0 0 16px 4px rgba(251, 191, 36, 0.8)'
            : 'inset 0px -3px 0px rgba(0,0,0,0.2)',
        },
        label: 'Pion jaune',
      };
    }
    return {
      className: 'w-full h-full flex items-center justify-center',
      style: {},
      label: 'Case vide',
    };
  };

  // Animation de drop
  const getAnimationStyle = () => {
    if (value === EMPTY) return {};
    const dropDelay = rowIndex * 0.05;
    return {
      animation: `dropPiece 0.5s ${dropDelay}s ease-in-out forwards`,
    };
  };

  const { className, style, label } = getCellStyle();

  return (
    <div
      className="w-10 h-10 md:w-12 md:h-12 p-1 bg-blue-600 rounded-full flex items-center justify-center m-1 relative"
      style={{
        background: 'linear-gradient(145deg, #3168c9, #3a7af0)',
        boxShadow:
          'inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1)',
      }}
      aria-label={label}
      role="gridcell"
      tabIndex={-1}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isWinningCell ? 'z-10' : ''}`}
        style={getAnimationStyle()}
      >
        {value === EMPTY ? (
          <CircleDashed className="text-blue-300 opacity-30" size={16} />
        ) : (
          <div className={className} style={style} />
        )}
      </div>
    </div>
  );
};

export default Cell;