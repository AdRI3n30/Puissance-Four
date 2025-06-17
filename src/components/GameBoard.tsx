import { useState, useEffect } from 'react';
import Column from './Column';
import GameStatus from './GameStatus';
import { COLS, ROWS, EMPTY } from '../utils/constants';
import Chat from './Chat';

interface GameBoardProps {
  gameId: number;
  role: 'player1' | 'player2';
  playerId: number; 
}

const GameBoard = ({ gameId, role, playerId }: GameBoardProps) => {
  const createEmptyBoard = () =>
    Array(COLS).fill(null).map(() => Array(ROWS).fill(EMPTY));

  const [board, setBoard] = useState<number[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  useEffect(() => {
    const fetchGame = () => {
      fetch(`http://localhost:3001/api/games/${gameId}`)
        .then(res => res.json())
        .then(data => {
          setBoard(JSON.parse(data.board));
          setCurrentPlayer(data.current_player);
          setWinner(data.winner);
          setGameOver(!!data.winner);
        });
    };

    fetchGame();

    const interval = setInterval(fetchGame, 1500);

    return () => clearInterval(interval);
  }, [gameId]);

  // Jouer un coup
  const dropPiece = async (colIndex: number) => {
    // On vérifie le tour avec le rôle, pas l'id
    if (
      gameOver ||
      (role === 'player1' && currentPlayer !== 1) ||
      (role === 'player2' && currentPlayer !== 2)
    ) {
      return;
    }
    const res = await fetch(`http://localhost:3001/api/games/${gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, column: colIndex }),
    });
    if (res.ok) {
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setWinner(data.winner);
      setGameOver(!!data.winner);
    }
  };

  const resetGame = async () => {
    const res = await fetch(`http://localhost:3001/api/games/${gameId}/reset`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setWinner(data.winner);
      setGameOver(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <GameStatus
        currentPlayer={currentPlayer}
        winner={winner}
        gameOver={gameOver}
        resetGame={resetGame}
      />

      <div
        className="bg-blue-700 p-4 rounded-lg shadow-lg mt-4"
        style={{
          boxShadow:
            '0 10px 15px -3px rgba(30, 64, 175, 0.3), 0 4px 6px -4px rgba(30, 64, 175, 0.2)',
        }}
      >
        <div
          className="grid grid-cols-7 gap-2 bg-blue-800 p-3 rounded-md"
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {board.map((column, colIndex) => (
            <Column
              key={colIndex}
              column={column}
              colIndex={colIndex}
              dropPiece={dropPiece}
              currentPlayer={currentPlayer}
              winningCells={[]}
              gameOver={gameOver}
              isHovered={hoveredColumn === colIndex}
              setHoveredColumn={setHoveredColumn}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;