import db from '../models/db.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
    try {
        // On exclut le mot de passe de la réponse
        const { rows } = await db.query(
            'SELECT id, first_name, last_name, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ error: "Utilisateur introuvable" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const updateProfile = async (req, res) => {
    const { first_name, last_name, email } = req.body;
    try {
        const { rows } = await db.query(
            `UPDATE users 
             SET first_name = COALESCE($1, first_name), 
                 last_name = COALESCE($2, last_name), 
                 email = COALESCE($3, email) 
             WHERE id = $4 RETURNING id, first_name, last_name, email`,
            [first_name, last_name, email, req.user.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};