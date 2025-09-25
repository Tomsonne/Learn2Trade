//logique liée aux utilisateurs.
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';

class UserService {
  static async createUser(email, password, isAdmin = false) {
    const hash = await bcrypt.hash(password, 10);
    return User.create({
      email,
      password_hash: hash,
      is_admin: isAdmin,
    });
  }

  static async getUserByEmail(email) {
    return User.findOne({ where: { email } });
  }

  static async getUserById(id) {
    return User.findByPk(id);
  }

  static async checkPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
}

export default UserService;
