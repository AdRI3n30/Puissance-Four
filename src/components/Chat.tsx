import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  player: number; // 1 ou 2
  timestamp: string;
}

interface ChatProps {
  gameId: number;
  role: 'player1' | 'player2';
}

const Chat: React.FC<ChatProps> = ({ gameId, role }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Détermine le numéro du joueur selon le rôle
  const playerNumber = role === 'player1' ? 1 : 2;

  const fetchMessages = async () => {
    const res = await fetch(`/api/games/${gameId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Ajoute cet effet pour scroller en bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() === '') return;
    await fetch(`/api/games/${gameId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: playerNumber, text: currentMessage }),
    });
    setCurrentMessage('');
    fetchMessages();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center">
        <MessageSquare size={20} className="mr-2" />
        <h2 className="font-semibold">Chat</h2>
      </div>
      <div 
        className="flex-grow p-3 overflow-y-auto"
        style={{ maxHeight: '400px', minHeight: '300px' }}
      >
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center flex flex-col items-center justify-center h-full">
            <MessageSquare size={40} className="mb-2 opacity-50" />
            <p>Aucun message. Commencez la conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            // On vérifie si le message vient du joueur courant
            const isOwnMessage =
              (role === 'player1' && message.player === 1) ||
              (role === 'player2' && message.player === 2);

            return (
              <div
                key={message.id}
                className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end">
                  {/* Bulle de couleur selon le joueur qui a envoyé le message */}
                  <div
                    className={`w-8 h-8 rounded-full mr-2 flex-shrink-0 ${
                      message.player === 1 ? 'bg-red-500' : 'bg-yellow-400'
                    }`}
                  />
                  <div
                    className={`px-4 py-2 rounded-lg shadow ${
                      message.player === 1
                        ? 'bg-red-100 text-red-900'
                        : 'bg-yellow-100 text-yellow-900'
                    }`}
                  >
                    <div className="text-xs opacity-60 mb-1">
                      {message.player === 1 ? 'Joueur Rouge' : 'Joueur Jaune'} • {formatTime(message.timestamp)}
                    </div>
                    <div>{message.text}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center">
          {currentMessage.trim() !== '' && (
            <div
              className={`w-8 h-8 rounded-full mr-2 flex-shrink-0 ${
                playerNumber === 1 ? 'bg-red-500' : 'bg-yellow-400'
              }`}
            />
          )}
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder={
              playerNumber === 1
                ? "Votre message (Pion rouge)…"
                : "Votre message (Pion jaune)…"
            }
            className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="ml-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;