import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/db.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
}

const queryUser = `
  SELECT 
    u.id, u.first_name, u.last_name, u.email,
    COALESCE(p.plan_name, 'Free') as plan_name,
    COALESCE(p.max_accounts, 2) as max_accounts,
    s.status as sub_status
  FROM users u
  LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status IN ('active', 'trial')
  LEFT JOIN plans p ON s.plan_id = p.id
  WHERE u.id = $1
`;

router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Champs requis" });
  }

  try {
    const { rows: existing } = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.length > 0) return res.status(409).json({ error: "Email déjà utilisé" });

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
        "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email",
        [first_name, last_name, email, hash]
    );
    const user = rows[0];

    await db.query(
        "INSERT INTO accounts (user_id, account_name, created_on, currency) VALUES ($1, 'Compte Principal', CURRENT_DATE, 'EUR')",
        [user.id]
    );

    const token = createToken(user);
    res.status(201).json({ user: { ...user, plan_name: 'Free' }, token });

  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Champs requis" });

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const baseUser = rows[0];

    if (!baseUser || !(await bcrypt.compare(password, baseUser.password_hash))) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const { rows: fullUser } = await db.query(queryUser, [baseUser.id]);
    const user = fullUser[0];
    const token = createToken(user);

    res.json({ user, token });

  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(queryUser, [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  const { first_name, last_name, email } = req.body;
  try {
    await db.query(
        `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           email = COALESCE($3, email), 
           updated_at = NOW() 
       WHERE id = $4`,
        [first_name, last_name, email, req.user.id]
    );

    const { rows } = await db.query(queryUser, [req.user.id]);
    res.json(rows[0]);

  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: "Email pris" });
    res.status(500).json({ error: "Erreur mise à jour" });
  }
});

router.delete("/me", requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

export default router;