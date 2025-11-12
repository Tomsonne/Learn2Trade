import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMarketSeries } from '../useMarketSeries';

// Simuler la fonction fetch globale
globalThis.fetch = vi.fn();

describe('useMarketSeries Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load OHLC data and calculate indicators', async () => {
    const mockOHLCData = {
      status: 'ok',
      data: [
        { t: 1000, o: 49000, h: 51000, l: 48000, c: 50000 },
        { t: 2000, o: 50000, h: 52000, l: 49000, c: 51000 },
        { t: 3000, o: 51000, h: 53000, l: 50000, c: 52000 },
        { t: 4000, o: 52000, h: 54000, l: 51000, c: 53000 },
        { t: 5000, o: 53000, h: 55000, l: 52000, c: 54000 },
        ...Array.from({ length: 50 }, (_, i) => ({
          t: 6000 + i * 1000,
          o: 54000 + i * 100,
          h: 55000 + i * 100,
          l: 53000 + i * 100,
          c: 54500 + i * 100,
        })),
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOHLCData,
    });

    const { result } = renderHook(() =>
      useMarketSeries({ symbol: 'BTC', tf: '1h', refreshMs: 0 })
    );

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify data structure
    expect(result.current.data).toHaveLength(mockOHLCData.data.length);
    expect(result.current.error).toBeNull();

    // Verify first candle has OHLC data
    const firstCandle = result.current.data[0];
    expect(firstCandle).toHaveProperty('ts', 1000);
    expect(firstCandle).toHaveProperty('o', 49000);
    expect(firstCandle).toHaveProperty('h', 51000);
    expect(firstCandle).toHaveProperty('l', 48000);
    expect(firstCandle).toHaveProperty('c', 50000);

    // Verify indicators are calculated
    expect(firstCandle).toHaveProperty('ma20');
    expect(firstCandle).toHaveProperty('ma50');
    expect(firstCandle).toHaveProperty('rsi');

    // Indicators should be null for early candles (not enough data)
    expect(firstCandle.ma20).toBeNull();
    expect(firstCandle.rsi).toBeNull();

    // Later candles should have calculated indicators
    const laterCandle = result.current.data[30];
    expect(laterCandle.ma20).toBeDefined();
    expect(laterCandle.rsi).toBeDefined();
    expect(typeof laterCandle.ma20).toBe('number');
    expect(typeof laterCandle.rsi).toBe('number');
  });

  it('should handle API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useMarketSeries({ symbol: 'BTC', tf: '1h', refreshMs: 0 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toEqual([]);
  });

  it('should handle API response with error status', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'error',
        error: { message: 'Invalid symbol' },
      }),
    });

    const { result } = renderHook(() =>
      useMarketSeries({ symbol: 'INVALID', tf: '1h', refreshMs: 0 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Invalid symbol');
    expect(result.current.data).toEqual([]);
  });

  it('should override last candle close with spot price if provided', async () => {
    const mockData = {
      status: 'ok',
      data: [
        { t: 1000, o: 50000, h: 51000, l: 49000, c: 50500 },
        { t: 2000, o: 50500, h: 52000, l: 50000, c: 51000 },
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const spotPrice = 52500;

    const { result } = renderHook(() =>
      useMarketSeries({ symbol: 'BTC', tf: '1h', spotPrice, refreshMs: 0 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Last candle should have spotPrice as close
    const lastCandle = result.current.data[result.current.data.length - 1];
    expect(lastCandle.c).toBe(spotPrice);

    // First candle should remain unchanged
    const firstCandle = result.current.data[0];
    expect(firstCandle.c).toBe(50500);
  });

  it('should use correct limit based on timeframe', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', data: [] }),
    });

    renderHook(() =>
      useMarketSeries({ symbol: 'BTC', tf: '1d', refreshMs: 0 })
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const fetchCall = fetch.mock.calls[0][0];
    expect(fetchCall).toContain('limit=200'); // 1d should use 200
  });

  it('should fetch with correct API endpoint and parameters', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', data: [] }),
    });

    renderHook(() =>
      useMarketSeries({ symbol: 'ETH', tf: '15m', refreshMs: 0 })
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const fetchCall = fetch.mock.calls[0][0];
    expect(fetchCall).toContain('symbol=ETH');
    expect(fetchCall).toContain('interval=15m');
    expect(fetchCall).toContain('limit=500'); // 15m should use 500
  });

  it('should reload data when dependencies change', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', data: [] }),
    });

    const { rerender } = renderHook(
      ({ symbol, tf }) => useMarketSeries({ symbol, tf, refreshMs: 0 }),
      {
        initialProps: { symbol: 'BTC', tf: '1h' },
      }
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Change symbol
    rerender({ symbol: 'ETH', tf: '1h' });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    // Verify new call has ETH
    const lastCall = fetch.mock.calls[1][0];
    expect(lastCall).toContain('symbol=ETH');
  });
});
