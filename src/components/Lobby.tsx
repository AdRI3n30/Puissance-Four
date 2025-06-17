import React, { useState, useEffect } from 'react';

interface LobbyProps {
  user: { id: number; email: string };
  onGameSelected: (game: any) => void;
}

const Lobby: React.FC<LobbyProps> = ({ user, onGameSelected }) => {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    const fetchGames = () => {
      fetch('/api/games')
        .then(res => res.json())
        .then(setGames);
    };

    fetchGames();
    const interval = setInterval(fetchGames, 2000);
    return () => clearInterval(interval);
  }, []);

  const createGame = async () => {
    setError('');
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player1_id: user.id }),
    });
    const data = await res.json();
    // Le créateur est toujours joueur 1
    onGameSelected({ id: data.gameId, role: 'player1' });
  };

  const joinGame = async (gameId: number) => {
    setError('');
    setJoining(true);
    await fetch(`/api/games/${gameId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player2_id: user.id }),
    });
    // Le premier à rejoindre est toujours joueur 2
    onGameSelected({ id: gameId, role: 'player2' });
    setJoining(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-6">Bienvenue, {user.email} !</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={createGame}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold"
        >
          Créer une partie
        </button>
      </div>
      <h3 className="text-xl font-semibold mb-2">Liste des parties :</h3>
      <div className="w-full max-w-md">
        <ul>
          {games.map((game) => (
            <li key={game.id} className="flex justify-between items-center border-b py-2">
              <span>
                Partie #{game.id} | Joueur 1: {game.player1_id} | Joueur 2: {game.player2_id ? game.player2_id : 'En attente'}
              </span>
              {/* Si la partie attend un joueur 2 et que ce n'est pas le créateur */}
              {!game.player2_id && game.player1_id !== user.id && (
                <button
                  onClick={() => joinGame(game.id)}
                  disabled={joining}
                  className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  {joining ? '...' : 'Rejoindre'}
                </button>
              )}
              {/* Si l'utilisateur est dans la partie, il peut la reprendre */}
              {(game.player1_id === user.id || game.player2_id === user.id) && (
                <button
                  onClick={() => onGameSelected({
                    id: game.id,
                    role: game.player1_id === user.id ? 'player1' : 'player2'
                  })}
                  className="ml-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Reprendre
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default Lobby;