//backend/src/types/express.d.ts

// On importe le type AuthUser depuis le fichier usersController.ts pour l'utiliser dans l'extension de l'interface Request d'Express.
// import { AuthUser } from '../controllers/usersController.ts';
export type AuthUser = {
    id: string;
    email: string;
}

// On étend l'interface Request d'Express pour inclure un champ user de type AuthUser.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser; 
    }
  }
}

// // On définit un type pour la requête de mise à jour du profil, 
// // qui inclut le corps de la requête et les informations de l'utilisateur authentifié. 
// // Cela permet de typer correctement le contrôleur de mise à jour du profil.
// export type UpdateProfileRequest = Request<{}, {}, UpdateProfileBody> & {
//     user: AuthUser;
// };

declare module 'express' {
  interface Request {
    user?: AuthUser; // On ajoute le champ user à l'interface Request d'Express.
  } 
}