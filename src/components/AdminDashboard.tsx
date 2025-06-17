import { useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  role: number;
}

interface Game {
  id: number;
  player1_id: number;
  player2_id: number | null;
  winner: number | null;
  created_at: string;
}

interface Message {
  id: number;
  game_id: number;
  player: number;
  text: string;
  timestamp: string;
}

const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      // Appelle les bonnes routes API du backend
      const [usersRes, gamesRes, messagesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/games'),
        fetch('/api/messages'),
      ]);
      setUsers(await usersRes.json());
      setGames(await gamesRes.json());
      setMessages(await messagesRes.json());
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Dashboard Admin</h2>
          <button onClick={onClose} className="text-red-500 font-bold text-lg">✕</button>
        </div>
        <h3 className="text-lg font-semibold mt-4 mb-2">Utilisateurs</h3>
        <table className="w-full mb-4 border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.role === 1 ? 'Admin' : 'User'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="text-lg font-semibold mt-4 mb-2">Parties</h3>
        <table className="w-full mb-4 border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Joueur 1</th>
              <th>Joueur 2</th>
              <th>Gagnant</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {games.map(g => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.player1_id}</td>
                <td>{g.player2_id ?? '-'}</td>
                <td>{g.winner ?? '-'}</td>
                <td>{g.created_at ? new Date(g.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="text-lg font-semibold mt-4 mb-2">Messages</h3>
        <table className="w-full border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Partie</th>
              <th>Joueur</th>
              <th>Texte</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.game_id}</td>
                <td>{m.player}</td>
                <td>{m.text}</td>
                <td>{m.timestamp ? new Date(m.timestamp).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;