import express from 'express';
import cors from 'cors';
import pool from './db.js';
import bcrypt from 'bcrypt';
import { checkWinner } from './gameLogic.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Sert les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../dist')));

// Pour toutes les routes non API, renvoyer index.html (SPA)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Test DB
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inscription
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    // Récupère l'utilisateur créé
    const [rows] = await pool.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    );
    res.status(201).json(rows[0]); // <-- retourne { id, email }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email déjà utilisé' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, email, role, password FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }
    res.json({ id: user.id, email: user.email, role: user.role }); // <-- retourne { id, email }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Création de partie
app.post('/api/games', async (req, res) => {
  const { player1_id } = req.body;
  const emptyBoard = JSON.stringify(Array(7).fill(null).map(() => Array(6).fill(0)));
  try {
    const [result] = await pool.query(
      'INSERT INTO games (player1_id, board, current_player) VALUES (?, ?, ?)',
      [player1_id, emptyBoard, 1]
    );
    res.status(201).json({ gameId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rejoindre une partie
app.post('/api/games/:id/join', async (req, res) => {
  const { player2_id } = req.body;
  const gameId = req.params.id;
  try {
    await pool.query(
      'UPDATE games SET player2_id = ? WHERE id = ? AND player2_id IS NULL',
      [player2_id, gameId]
    );
    res.json({ message: 'Partie rejointe' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer l'état d'une partie
app.get('/api/games/:id', async (req, res) => {
  const gameId = req.params.id;
  try {
    const [games] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
    if (games.length === 0) return res.status(404).json({ error: 'Partie non trouvée' });
    res.json(games[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Jouer un coup
app.post('/api/games/:id/move', async (req, res) => {
  const gameId = req.params.id;
  const { player_id, column } = req.body;
  try {
    // Récupérer la partie
    const [games] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
    if (games.length === 0) return res.status(404).json({ error: 'Partie non trouvée' });
    const game = games[0];

    // Déterminer le numéro du joueur (1 ou 2)
    let playerNumber = null;
    if (game.player1_id === player_id) playerNumber = 1;
    else if (game.player2_id === player_id) playerNumber = 2;
    else return res.status(400).json({ error: 'Joueur non dans la partie' });

    // Vérifier que c'est bien au tour du joueur
    if (game.current_player !== playerNumber) {
      return res.status(400).json({ error: "Ce n'est pas votre tour" });
    }

    // Charger le plateau
    const board = JSON.parse(game.board);

    // Trouver la première case vide dans la colonne
    let row = board[column].lastIndexOf(0);
    if (row === -1) return res.status(400).json({ error: 'Colonne pleine' });

    // Placer le pion (1 ou 2)
    board[column][row] = playerNumber;

    // Vérifier le gagnant
    let winner = null;
    if (checkWinner(board, playerNumber)) {
      winner = playerNumber;
    }

    // Déterminer le prochain joueur (1 ou 2)
    const nextPlayer = playerNumber === 1 ? 2 : 1;

    await pool.query(
      'UPDATE games SET board = ?, current_player = ?, winner = ? WHERE id = ?',
      [JSON.stringify(board), nextPlayer, winner, gameId]
    );

    res.json({ board, current_player: nextPlayer, winner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les messages d'une partie
app.get('/api/games/:id/messages', async (req, res) => {
  const gameId = req.params.id;
  const [rows] = await pool.query(
    'SELECT * FROM messages WHERE game_id = ? ORDER BY timestamp ASC',
    [gameId]
  );
  res.json(rows);
});

// Envoyer un message
app.post('/api/games/:id/messages', async (req, res) => {
  const gameId = req.params.id;
  const { player, text } = req.body;
  await pool.query(
    'INSERT INTO messages (game_id, player, text) VALUES (?, ?, ?)',
    [gameId, player, text]
  );
  res.status(201).json({ message: 'Message envoyé' });
});

// Supprimer tous les messages d'une partie
app.delete('/api/games/:id/messages', async (req, res) => {
  const gameId = req.params.id;
  try {
    await pool.query('DELETE FROM messages WHERE game_id = ?', [gameId]);
    res.json({ message: 'Messages supprimés' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Déconnexion
app.post('/api/games/:id/disconnect', async (req, res) => {
  const { playerId } = req.body;
  const gameId = req.params.id;
  // Récupère la partie pour savoir si c'est player1 ou player2
  const [games] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
  if (!games.length) return res.status(404).json({ error: 'Partie non trouvée' });
  const game = games[0];
  let field = '';
  if (game.player1_id === playerId) field = 'player1_connected';
  else if (game.player2_id === playerId) field = 'player2_connected';
  else return res.status(400).json({ error: 'Joueur non trouvé dans la partie' });

  await pool.query(`UPDATE games SET ${field} = FALSE WHERE id = ?`, [gameId]);

  // Relire la partie pour avoir les valeurs à jour
  const [updatedGames] = await pool.query('SELECT * FROM games WHERE id = ?', [gameId]);
  const updatedGame = updatedGames[0];

  // Supprimer si les deux sont déco (0 ou false)
  if (
    (updatedGame.player1_connected === 0 || updatedGame.player1_connected === false) &&
    (updatedGame.player2_connected === 0 || updatedGame.player2_connected === false)
  ) {
    await pool.query('DELETE FROM messages WHERE game_id = ?', [gameId]);
    await pool.query('DELETE FROM games WHERE id = ?', [gameId]);
  }

  res.json({ message: 'Déconnexion prise en compte' });
});

// Trouver une partie en attente
app.get('/api/games/waiting', async (req, res) => {
  const [games] = await pool.query(
    'SELECT * FROM games WHERE player2_id IS NULL ORDER BY created_at ASC LIMIT 1'
  );
  if (games.length > 0) {
    res.json(games[0]);
  } else {
    res.json(null);
  }
});

// Récupérer toutes les parties
app.get('/api/games', async (req, res) => {
  const [games] = await pool.query('SELECT * FROM games ORDER BY created_at DESC');
  res.json(games);
});

// Réinitialiser une partie
app.post('/api/games/:id/reset', async (req, res) => {
  const gameId = req.params.id;
  // Crée un plateau vide (adapte selon ta logique)
  const emptyBoard = JSON.stringify(Array(7).fill(null).map(() => Array(6).fill(0)));
  await pool.query(
    'UPDATE games SET board = ?, current_player = 1, winner = NULL WHERE id = ?',
    [emptyBoard, gameId]
  );
  res.json({ message: 'Partie réinitialisée', board: JSON.parse(emptyBoard), current_player: 1, winner: null });
});

// Récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, role FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer tous les messages
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY timestamp DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});