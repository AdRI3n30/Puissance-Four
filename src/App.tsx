import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Chat from './components/Chat';
import Auth from './components/Auth';
import Lobby from './components/Lobby';

function App() {
  const [user, setUser] = useState<{ id: number; email: string } | null>(() => {
    const saved = localStorage.getItem('user');
    console.log('User from localStorage:', saved);
    return saved ? JSON.parse(saved) : null;
  });
  const [game, setGame] = useState<any>(null);

  // Sauvegarde l'utilisateur dans le localStorage à chaque changement
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  if (!game) {
    return <Lobby user={user} onGameSelected={setGame} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800">
            Puissance 4
          </h1>
          <button
            onClick={async () => {
              await fetch(`/api/games/${game.id}/disconnect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId: user.id }),
              });
              setGame(null); 
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Se déconnecter
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GameBoard gameId={game.id} playerId={user.id} role={game.role} />
          </div>
          <div className="lg:col-span-1">
            <Chat gameId={game.id} role={game.role} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;