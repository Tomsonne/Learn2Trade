describe('Asset model (unit)', () => {
  const { Asset } = global.Models;

  test('rejette un kind invalide', async () => {
    await expect(Asset.create({ symbol: 'BAD', kind: 'nope' })).rejects.toThrow();
  });
});
