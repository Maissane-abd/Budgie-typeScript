import db from '../models/db.js';
// import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type UpdateProfileBody = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

// GET /users/profile, returns the profile of the authenticated user
export const getProfile = async (
  req: Request,
  res: Response<{ error: string } | User>,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Utilisateur non authentifié' });
    return;
  }

  try {
    // Fetch the user profile from the database
    const { rows }: { rows: User[] } = await db.query(
      'SELECT id, first_name, last_name, email FROM users WHERE id = $1',
      [req.user.id],
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT /users/profile, updates the profile of the authenticated user
export const updateProfile = async (
  req: Request,
  res: Response<{ error: string } | User>,
): Promise<void> => {
  const { first_name, last_name, email } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Utilisateur non authentifié' });
    return;
  }

  try {
    const { rows }: { rows: User[] } = await db.query(
      `UPDATE users 
             SET first_name = COALESCE($1, first_name), 
                 last_name = COALESCE($2, last_name), 
                 email = COALESCE($3, email) 
             WHERE id = $4 RETURNING id, first_name, last_name, email`,
      [first_name, last_name, email, req.user.id],
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// DELETE /users/profile, deletes the account of the authenticated user
export const deleteAccount = async (
  req: Request,
  res: Response<{ error: string } | void>,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Utilisateur non authentifié' });
    return;
  }

  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
