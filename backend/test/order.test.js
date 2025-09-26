describe('Position model (unit)', () => {
  const { User, Asset, Position } = global.Models;

  test('crée une position composite (user_id, asset_id)', async () => {
    const user = await User.create({ email: 'p@test.com', password_hash: 'x' });
    const asset = await Asset.create({ symbol: 'ETHUSD', kind: 'crypto' });

    const pos = await Position.create({
      user_id: user.id,
      asset_id: asset.id,
      quantity: '1.0000000000',
      avg_price: '2500.00000000',
    });

    expect(String(pos.quantity)).toBe('1.0000000000');
    expect(String(pos.avg_price)).toBe('2500.00000000');
  });
});
