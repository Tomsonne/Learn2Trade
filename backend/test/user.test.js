describe('User model (unit)', () => {
  const { User } = global.Models;

  test('crée un utilisateur', async () => {
    const u = await User.create({ email: 'u@test.com', password_hash: 'x' });
    expect(u.id).toBeDefined();
    expect(u.email).toBe('u@test.com');
  });
});
