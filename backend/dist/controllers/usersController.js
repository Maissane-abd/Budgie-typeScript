import db from '../models/db.js';
// On définit un type pour la requête de mise à jour du profil, 
// qui inclut le corps de la requête et les informations de l'utilisateur authentifié. 
// Cela permet de typer correctement le contrôleur de mise à jour du profil.
// export type UpdateProfileRequest = Request<{}, {}, UpdateProfileBody> & {
//     user: AuthUser;
// };
export const getProfile = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
    }
    try {
        // On exclut le mot de passe de la réponse
        // les rows renvoient un tableau d'objets, même si on ne récupère qu'un seul utilisateur. 
        // On prend donc le premier élément du tableau pour renvoyer l'utilisateur.
        const { rows } = await db.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1', [req.user.id]);
        if (!rows.length) {
            res.status(404).json({ error: "Utilisateur introuvable" });
            return;
        }
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};
export const updateProfile = async (req, res) => {
    const { first_name, last_name, email } = req.body;
    if (!req.user) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
    }
    try {
        const { rows } = await db.query(`UPDATE users 
             SET first_name = COALESCE($1, first_name), 
                 last_name = COALESCE($2, last_name), 
                 email = COALESCE($3, email) 
             WHERE id = $4 RETURNING id, first_name, last_name, email`, [first_name, last_name, email, req.user.id]);
        if (!rows.length) {
            res.status(404).json({ error: "Utilisateur introuvable" });
            return;
        }
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};
// On définit un contrôleur pour supprimer le compte de l'utilisateur authentifié. 
// On utilise une requête SQL DELETE pour supprimer l'utilisateur de la base de données. 
// Si la suppression est réussie, on renvoie un statut 204 (No Content). 
// Si l'utilisateur n'est pas trouvé, on renvoie un statut 404 (Not Found). 
// En cas d'erreur serveur, on renvoie un statut 500 (Internal Server Error).
export const deleteAccount = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
    }
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};
