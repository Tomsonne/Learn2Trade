// app/services/user.service.js
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { ValidationError } from "../utils/errors.js"; // tu peux créer une classe custom pour gérer les erreurs

// ==== CRÉER USER ======
export async function createUser({ email, password, is_admin = false }) {
    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        throw new ValidationError("Email déjà utilisé");
    }

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(password, 10);

    // Sauvegarder
    const user = await User.create({
        email,
        password_hash,
        is_admin,
    });

    // On ne retourne pas le hash
    return {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
    };
}

// ==== LOGIN USER ======
export async function authenticateUser(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ValidationError("Identifiants invalides");
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        throw new ValidationError("Identifiants invalides");
    }

    // Retourne un objet (le controller pourra générer un JWT après)
    return {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
    };
}

// ==== GET USER ========
export async function getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) {
        throw new ValidationError("Utilisateur introuvable");
    }
    return {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
    };
}

export async function getUserByEmail(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ValidationError("Utilisateur introuvable");
    }
    return {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
    };
}

// ==== UPDATE USER =====
export async function updateUser(id, { email, password, is_admin }) {
    const user = await User.findByPk(id);
    if (!user) {
        throw new ValidationError("Utilisateur introuvable");
    }

    if (email) {
        const existing = await User.findOne({ where: { email } });
        if (existing && existing.id !== id) {
            throw new ValidationError("Email déjà utilisé");
        }
        user.email = email;
    }

    if (password) {
        user.password_hash = await bcrypt.hash(password, 10);
    }

    if (typeof is_admin === "boolean") {
        user.is_admin = is_admin;
    }

    await user.save();

    return {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        updated_at: user.updated_at,
    };
}

// ======================
// ==== DELETE USER =====
// ======================
export async function deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
        throw new ValidationError("Utilisateur introuvable");
    }

    await user.destroy();
    return { success: true };
}

// ======================
// ==== CHECK ADMIN =====
// ======================
export async function isAdmin(id) {
    const user = await User.findByPk(id);
    if (!user) return false;
    return user.is_admin === true;
}
