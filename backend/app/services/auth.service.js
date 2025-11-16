// app/services/auth.service.js
// Gestion JWT + bcrypt
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { ValidationError } from "../utils/errors.js";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = "1h";

/* -------------------------------------------------------------------------- */
/* SIGNUP                                                                  */
/* -------------------------------------------------------------------------- */
export async function signup({ email, password, username, first_name, last_name, is_admin = false }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ValidationError("Email déjà utilisé");

  // Vérifier si le username est déjà pris (si fourni)
  if (username) {
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) throw new ValidationError("Pseudo déjà utilisé");
  }

  const password_hash = await bcrypt.hash(password, 10);

  const userData = {
    email,
    password_hash,
    is_admin
  };

  // Ajouter les champs optionnels seulement s'ils sont fournis
  if (username) userData.username = username;
  if (first_name) userData.first_name = first_name;
  if (last_name) userData.last_name = last_name;

  const user = await User.create(userData);

  const token = jwt.sign(
    { id: user.id, email: user.email, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      is_admin: user.is_admin
    },
    access_token: token,
    token_type: "Bearer",
    expires_in: JWT_EXPIRES_IN,
    token, // ajouté pour compatibilité cookie dans controller
  };
}

/* -------------------------------------------------------------------------- */
/* LOGIN                                                                   */
/* -------------------------------------------------------------------------- */
export async function login(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ValidationError("Identifiants invalides");

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new ValidationError("Identifiants invalides");

  const token = jwt.sign(
    { id: user.id, email: user.email, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, email: user.email, is_admin: user.is_admin },
    access_token: token,
    token_type: "Bearer",
    expires_in: JWT_EXPIRES_IN,
    token, // ajouté pour cohérence avec signup()
  };
}

/* -------------------------------------------------------------------------- */
/*  VERIFY TOKEN (pour checkAuth)                                           */
/* -------------------------------------------------------------------------- */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET); // retourne le payload décodé
  } catch (err) {
    throw new ValidationError("Token invalide ou expiré");
  }
}
