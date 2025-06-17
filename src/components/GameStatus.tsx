import React from 'react';
import { PLAYER1, PLAYER2 } from '../utils/constants';

interface GameStatusProps {
  currentPlayer: number;
  winner: number | null;
  gameOver: boolean;
  resetGame: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({
  currentPlayer,
  winner,
  gameOver,
  resetGame,
}) => {
  const getStatusMessage = () => {
    if (winner === PLAYER1) {
      return "Joueur 1 (Rouge) gagne!";
    } else if (winner === PLAYER2) {
      return "Joueur 2 (Jaune) gagne!";
    } else if (gameOver) {
      return "Match nul!";
    } else {
      return `Au tour du Joueur ${currentPlayer === PLAYER1 ? '1 (Rouge)' : '2 (Jaune)'}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-lg flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center mb-3 sm:mb-0">
        <div className="flex items-center">
          <div 
            className={`w-6 h-6 rounded-full mr-2 ${
              currentPlayer === PLAYER1 && !gameOver ? 'bg-red-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="mr-4">Joueur 1</span>
        </div>
        <div className="flex items-center">
          <div 
            className={`w-6 h-6 rounded-full mr-2 ${
              currentPlayer === PLAYER2 && !gameOver ? 'bg-yellow-400 animate-pulse' : 'bg-yellow-400'
            }`}
          />
          <span>Joueur 2</span>
        </div>
      </div>
      
      <div className="flex items-center">
        <p className="font-semibold text-gray-800 mr-4">{getStatusMessage()}</p>
        {(winner !== null || gameOver) && (
          <button
            onClick={resetGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Nouvelle partie
          </button>
        )}
      </div>
    </div>
  );
};

export default GameStatus;