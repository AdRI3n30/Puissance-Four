import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';

interface LobbyProps {
  user: { id: number; email: string; role: number };
  onGameSelected: (game: any) => void;
}

const Lobby: React.FC<LobbyProps & { onLogout?: () => void }> = ({ user, onGameSelected, onLogout }) => {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);

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
    onGameSelected({ id: gameId, role: 'player2' });
    setJoining(false);
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    window.location.reload(); // Force le retour à la page de connexion
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex w-full justify-between items-center mb-6 max-w-md">
        <h2 className="text-2xl font-bold">Bienvenue, {user.email} !</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-4"
        >
          Déconnexion
        </button>
      </div>
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
          {games
            .filter(game => game.finis === 0) // Affiche seulement les parties non terminées
            .map((game) => (
              <li key={game.id} className="flex justify-between items-center border-b py-2">
                <span>
                  Partie #{game.id} | Joueur 1: {game.player1_id} | Joueur 2: {game.player2_id ? game.player2_id : 'En attente'}
                </span>
                {!game.player2_id && game.player1_id !== user.id && (
                  <button
                    onClick={() => joinGame(game.id)}
                    disabled={joining}
                    className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    {joining ? '...' : 'Rejoindre'}
                  </button>
                )}
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
      {user.role === 1 ? (
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => setShowAdmin(true)}
        >
          Dashboard Admin
        </button>
      ) : (
        <div className="mb-4 text-gray-700 font-semibold">Vous êtes un client</div>
      )}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
    </div>
  );
};

export default Lobby;