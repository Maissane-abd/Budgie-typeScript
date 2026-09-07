import db from '../models/db.js';
// import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';

// -- Table des Utilisateurs
// CREATE TABLE users ( 
//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   first_name VARCHAR(100) NOT NULL,
//   last_name VARCHAR(100) NOT NULL,
//   email VARCHAR(255) UNIQUE NOT NULL,
//   password_hash TEXT NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   updated_at TIMESTAMPTZ DEFAULT now()
// );

// Dans getProfile, on exclut le mot de passe de la réponse pour des raisons de sécurité. 
// On ne renvoie que l'id, le prénom, le nom et l'email de l'utilisateur.
type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
};

// Les propriétés de l'utilisateur authentifié sont ajoutées à la requête via un middleware d'authentification. 
// Cela permet d'accéder facilement aux informations de l'utilisateur dans les contrôleurs sans avoir à les récupérer à chaque fois depuis la base de données.
// Dans updateProfile, on permet à l'utilisateur de mettre à jour son prénom, son nom et son email. 
// Le mot de passe n'est pas modifiable ici pour des raisons de sécurité. 
// Si l'utilisateur souhaite changer son mot de passe, il devrait passer par un processus dédié de changement de mot de passe.
type AuthUser = {
  id: string;
  email: string;
};

// On définit un type pour la requête authentifiée, qui inclut les informations de l'utilisateur authentifié. 
// Cela permet de typer correctement les contrôleurs qui nécessitent une authentification.
type AuthenticatedRequest = Request & {
  user: AuthUser;
};

// On définit un type pour le corps de la requête de mise à jour du profil, qui peut contenir le prénom, le nom et l'email. 
// Ces champs sont optionnels, car l'utilisateur peut choisir de ne mettre à jour qu'une partie de son profil.
type UpdateProfileBody = {
    first_name?: string;
    last_name?: string;
    email?: string;
};

// On définit un type pour la requête de mise à jour du profil, 
// qui inclut le corps de la requête et les informations de l'utilisateur authentifié. 
// Cela permet de typer correctement le contrôleur de mise à jour du profil.
type UpdateProfileRequest = Request<{}, {}, UpdateProfileBody> & {
    user: AuthUser;
};



export const getProfile = async (req: AuthenticatedRequest, res: Response<{error: string} | User>): Promise<void> => {
    try {
        // On exclut le mot de passe de la réponse
        // les rows renvoient un tableau d'objets, même si on ne récupère qu'un seul utilisateur. 
        // On prend donc le premier élément du tableau pour renvoyer l'utilisateur.
        const { rows }: { rows: User[] } = await db.query(
            'SELECT id, first_name, last_name, email FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!rows.length) {
            res.status(404).json({ error: "Utilisateur introuvable" });
            return;
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const updateProfile = async (req: UpdateProfileRequest, res: Response<{error: string} | User>): Promise<void> => {
    const { first_name, last_name, email } = req.body;
    try {
        const { rows }: { rows: User[] } = await db.query(
            `UPDATE users 
             SET first_name = COALESCE($1, first_name), 
                 last_name = COALESCE($2, last_name), 
                 email = COALESCE($3, email) 
             WHERE id = $4 RETURNING id, first_name, last_name, email`,
            [first_name, last_name, email, req.user.id]
        );
         if (!rows.length) {
            res.status(404).json({ error: "Utilisateur introuvable" });
            return;
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

// On définit un contrôleur pour supprimer le compte de l'utilisateur authentifié. 
// On utilise une requête SQL DELETE pour supprimer l'utilisateur de la base de données. 
// Si la suppression est réussie, on renvoie un statut 204 (No Content). 
// Si l'utilisateur n'est pas trouvé, on renvoie un statut 404 (Not Found). 
// En cas d'erreur serveur, on renvoie un statut 500 (Internal Server Error).
export const deleteAccount = async (req: AuthenticatedRequest, res: Response<{error: string} | void>): Promise<void> => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};