import pool from './db';
import crypto from 'crypto';

export interface User {
  id: number;
  email: string;
}

export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

export const createUser = async (email: string, password: string): Promise<User> => {
  const hashedPassword = hashPassword(password);
  const [result] = await pool.execute(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hashedPassword]
  );
  const id = (result as any).insertId;
  return { id, email };
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  const user = (rows as any[])[0];
  
  if (!user || !verifyPassword(password, user.password)) {
    return null;
  }
  
  return { id: user.id, email: user.email };
};