// backend/test/user.test.js
import sequelize from '../app/core/db.js';
import User from '../app/models/user.model.js';

async function testUserDB() {
  try {
    // 1. Vérifier la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK');

    // 2. Synchroniser les modèles sans drop (⚠️ pas de force:true ici)
    await sequelize.sync();

    // 3. Créer un utilisateur
    const newUser = await User.create({
      email: 'test_dbeaver@mail.com',
      password_hash: 'hashed_password',
      is_admin: false,
    });
    console.log('✅ User inséré :', newUser.toJSON());

    // 4. Relire le user depuis la DB
    const foundUser = await User.findOne({ where: { email: 'test_dbeaver@mail.com' } });
    console.log('🔍 User retrouvé :', foundUser.toJSON());

  } catch (error) {
    console.error('❌ Erreur test User:', error);
  } finally {
    await sequelize.close();
  }
}

testUserDB();
