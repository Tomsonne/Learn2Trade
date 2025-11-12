import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSpotPrice } from '../useSpotPrice';

// Simuler la fonction fetch globale
globalThis.fetch = vi.fn();

describe('useSpotPrice Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch spot price for BTC', async () => {
    const mockResponse = {
      status: 'ok',
      data: {
        prices: {
          BTC: { usd: 50000, eur: 45000 },
          ETH: { usd: 3000, eur: 2700 },
        },
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSpotPrice({ symbol: 'BTC', refreshMs: 0 }));

    expect(result.current.price).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.price).toBe(50000));

    expect(result.current.error).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should fetch spot price for ETH', async () => {
    const mockResponse = {
      status: 'ok',
      data: {
        prices: {
          BTC: { usd: 50000, eur: 45000 },
          ETH: { usd: 3000, eur: 2700 },
        },
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSpotPrice({ symbol: 'ETH', refreshMs: 0 }));

    await waitFor(() => expect(result.current.price).toBe(3000));

    expect(result.current.error).toBeNull();
  });

  it('should normalize symbol (ETHUSDT -> ETH)', async () => {
    const mockResponse = {
      status: 'ok',
      data: {
        prices: {
          ETH: { usd: 3000, eur: 2700 },
        },
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSpotPrice({ symbol: 'ETHUSDT', refreshMs: 0 }));

    await waitFor(() => expect(result.current.price).toBe(3000));
  });

  it('should handle API errors', async () => {
    const mockResponse = {
      status: 'error',
      error: { message: 'Market data unavailable' },
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSpotPrice({ symbol: 'BTC', refreshMs: 0 }));

    await waitFor(() => expect(result.current.error).toBeTruthy());

    expect(result.current.price).toBeNull();
    expect(result.current.error).toContain('Market data unavailable');
  });

  it('should handle network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network failed'));

    const { result } = renderHook(() => useSpotPrice({ symbol: 'BTC', refreshMs: 0 }));

    await waitFor(() => expect(result.current.error).toBeTruthy());

    expect(result.current.price).toBeNull();
    expect(result.current.error).toBe('Network failed');
  });

  it('should return null when symbol not found', async () => {
    const mockResponse = {
      status: 'ok',
      data: {
        prices: {
          BTC: { usd: 50000, eur: 45000 },
        },
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSpotPrice({ symbol: 'INVALID', refreshMs: 0 }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(result.current.price).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should refetch when symbol changes', async () => {
    const mockBTC = {
      status: 'ok',
      data: { prices: { BTC: { usd: 50000, eur: 45000 } } },
    };

    const mockETH = {
      status: 'ok',
      data: { prices: { ETH: { usd: 3000, eur: 2700 } } },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBTC,
    });

    const { result, rerender } = renderHook(
      ({ symbol }) => useSpotPrice({ symbol, refreshMs: 0 }),
      { initialProps: { symbol: 'BTC' } }
    );

    await waitFor(() => expect(result.current.price).toBe(50000));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockETH,
    });

    rerender({ symbol: 'ETH' });

    await waitFor(() => expect(result.current.price).toBe(3000));

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should use default values when no params provided', async () => {
    const mockResponse = {
      status: 'ok',
      data: {
        prices: {
          BTC: { usd: 50000, eur: 45000 },
        },
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSpotPrice());

    await waitFor(() => expect(result.current.price).toBe(50000));
  });
});
