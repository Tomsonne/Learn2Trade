import { jest } from "@jest/globals";
import Decimal from "decimal.js";

// Mock du client Binance
const mockBinanceClient = {
  prices: jest.fn(),
};

jest.unstable_mockModule("binance-api-node", () => ({
  default: {
    default: () => mockBinanceClient,
  },
}));

// Mock des modèles
const mockTrade = {
  findByPk: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
};

const mockUser = {
  findByPk: jest.fn(),
  save: jest.fn(),
};

const mockAsset = {
  findByPk: jest.fn(),
};

// Mock de la transaction Sequelize
const mockTransaction = {
  LOCK: { UPDATE: "UPDATE" },
  commit: jest.fn(),
  rollback: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn((callback) => callback(mockTransaction)),
};

jest.unstable_mockModule("../app/core/db.js", () => ({
  default: mockSequelize,
}));

jest.unstable_mockModule("../app/models/index.js", () => ({
  default: {
    Trade: mockTrade,
    User: mockUser,
    Asset: mockAsset,
  },
}));

// Import après les mocks
const { openTrade, closeTrade, getTradesByUser } = await import("../app/services/trade.service.js");

describe("Trade Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("openTrade", () => {
    test("should open BUY trade and reduce cash balance correctly", async () => {
      // Setup mocks
      const mockUserData = {
        id: "user-123",
        cash: "10000",
        save: jest.fn(),
      };

      const mockAssetData = {
        id: 1,
        symbol: "BTCUSDT",
      };

      mockUser.findByPk.mockResolvedValue(mockUserData);
      mockAsset.findByPk.mockResolvedValue(mockAssetData);
      mockBinanceClient.prices.mockResolvedValue({ BTCUSDT: "50000" });
      mockTrade.create.mockResolvedValue({
        id: "trade-123",
        user_id: "user-123",
        asset_id: 1,
        side: "BUY",
        quantity: "0.1",
        price_open: "50000",
        is_closed: false,
      });

      // Execute
      const result = await openTrade("user-123", {
        asset_id: 1,
        side: "BUY",
        quantity: "0.1",
      });

      // Verify
      expect(mockUser.findByPk).toHaveBeenCalledWith("user-123", {
        transaction: mockTransaction,
        lock: mockTransaction.LOCK.UPDATE,
      });
      expect(mockBinanceClient.prices).toHaveBeenCalledWith({ symbol: "BTCUSDT" });
      expect(mockUserData.cash).toBe("5000"); // 10000 - (50000 * 0.1)
      expect(mockUserData.save).toHaveBeenCalled();
      expect(mockTrade.create).toHaveBeenCalled();
      expect(result.quantity).toBe("0.1");
    });

    test("should throw error if insufficient cash for BUY", async () => {
      const mockUserData = {
        id: "user-123",
        cash: "1000", // Only 1000
        save: jest.fn(),
      };

      mockUser.findByPk.mockResolvedValue(mockUserData);
      mockAsset.findByPk.mockResolvedValue({ id: 1, symbol: "BTCUSDT" });
      mockBinanceClient.prices.mockResolvedValue({ BTCUSDT: "50000" });

      await expect(
        openTrade("user-123", {
          asset_id: 1,
          side: "BUY",
          quantity: "1", // Needs 50000 but has 1000
        })
      ).rejects.toThrow("Solde insuffisant");

      expect(mockUserData.save).not.toHaveBeenCalled();
      expect(mockTrade.create).not.toHaveBeenCalled();
    });

    test("should reject invalid quantity (negative or zero)", async () => {
      await expect(
        openTrade("user-123", {
          asset_id: 1,
          side: "BUY",
          quantity: "0",
        })
      ).rejects.toThrow("quantity doit être > 0");

      await expect(
        openTrade("user-123", {
          asset_id: 1,
          side: "BUY",
          quantity: "-0.5",
        })
      ).rejects.toThrow("quantity doit être > 0");
    });

    test("should reject invalid side", async () => {
      await expect(
        openTrade("user-123", {
          asset_id: 1,
          side: "INVALID",
          quantity: "1",
        })
      ).rejects.toThrow("side invalide");
    });

    test("should throw error if user not found", async () => {
      mockUser.findByPk.mockResolvedValue(null);

      await expect(
        openTrade("user-123", {
          asset_id: 1,
          side: "BUY",
          quantity: "1",
        })
      ).rejects.toThrow("Utilisateur introuvable");
    });

    test("should throw error if asset not found", async () => {
      mockUser.findByPk.mockResolvedValue({ id: "user-123", cash: "10000" });
      mockAsset.findByPk.mockResolvedValue(null);

      await expect(
        openTrade("user-123", {
          asset_id: 999,
          side: "BUY",
          quantity: "1",
        })
      ).rejects.toThrow("Actif introuvable");
    });
  });

  describe("closeTrade", () => {
    test("should close trade fully and calculate PnL correctly for profit", async () => {
      const mockTradeData = {
        id: "trade-123",
        user_id: "user-123",
        asset_id: 1,
        side: "BUY",
        quantity: "0.1",
        price_open: "50000",
        is_closed: false,
        opened_at: new Date("2025-01-01"),
        destroy: jest.fn(),
        save: jest.fn(),
      };

      const mockUserData = {
        id: "user-123",
        cash: "5000",
        save: jest.fn(),
      };

      mockTrade.findByPk.mockResolvedValue(mockTradeData);
      mockUser.findByPk.mockResolvedValue(mockUserData);
      mockAsset.findByPk.mockResolvedValue({ id: 1, symbol: "BTCUSDT" });
      mockBinanceClient.prices.mockResolvedValue({ BTCUSDT: "60000" }); // Price went up
      mockTrade.create.mockResolvedValue({
        id: "closed-trade-123",
        pnl: "1000",
        is_closed: true,
      });

      const result = await closeTrade("trade-123", "0.1");

      // PnL = (60000 - 50000) * 0.1 = 1000
      // Credit = 60000 * 0.1 = 6000
      // New cash = 5000 + 6000 = 11000
      expect(mockUserData.cash).toBe("11000");
      expect(mockUserData.save).toHaveBeenCalled();
      expect(mockTrade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pnl: "1000",
          price_close: "60000",
          is_closed: true,
        }),
        { transaction: mockTransaction }
      );
      expect(mockTradeData.destroy).toHaveBeenCalled(); // Full close
      expect(result.message).toContain("entièrement fermé");
    });

    test("should close trade partially and update remaining quantity", async () => {
      const mockTradeData = {
        id: "trade-123",
        user_id: "user-123",
        asset_id: 1,
        side: "BUY",
        quantity: "1", // Full quantity
        price_open: "50000",
        is_closed: false,
        opened_at: new Date("2025-01-01"),
        destroy: jest.fn(),
        save: jest.fn(),
      };

      const mockUserData = {
        id: "user-123",
        cash: "0",
        save: jest.fn(),
      };

      mockTrade.findByPk.mockResolvedValue(mockTradeData);
      mockUser.findByPk.mockResolvedValue(mockUserData);
      mockAsset.findByPk.mockResolvedValue({ id: 1, symbol: "BTCUSDT" });
      mockBinanceClient.prices.mockResolvedValue({ BTCUSDT: "55000" });
      mockTrade.create.mockResolvedValue({
        id: "closed-trade-123",
        quantity: "0.5",
        is_closed: true,
      });

      const result = await closeTrade("trade-123", "0.5"); // Close half

      expect(mockTradeData.quantity).toBe("0.5"); // Remaining
      expect(mockTradeData.save).toHaveBeenCalled();
      expect(mockTradeData.destroy).not.toHaveBeenCalled(); // Partial close
      expect(result.message).toContain("Fermeture partielle");
      expect(result.remaining_quantity).toBe("0.5");
    });

    test("should calculate PnL correctly for SELL trade with loss", async () => {
      const mockTradeData = {
        id: "trade-123",
        user_id: "user-123",
        asset_id: 1,
        side: "SELL",
        quantity: "0.1",
        price_open: "50000",
        is_closed: false,
        opened_at: new Date("2025-01-01"),
        destroy: jest.fn(),
        save: jest.fn(),
      };

      const mockUserData = {
        id: "user-123",
        cash: "5000",
        save: jest.fn(),
      };

      mockTrade.findByPk.mockResolvedValue(mockTradeData);
      mockUser.findByPk.mockResolvedValue(mockUserData);
      mockAsset.findByPk.mockResolvedValue({ id: 1, symbol: "BTCUSDT" });
      mockBinanceClient.prices.mockResolvedValue({ BTCUSDT: "60000" }); // Price went up (loss for SELL)
      mockTrade.create.mockResolvedValue({
        id: "closed-trade-123",
        pnl: "-1000",
        is_closed: true,
      });

      await closeTrade("trade-123", "0.1");

      // For SELL: PnL = (price_open - price_close) * qty = (50000 - 60000) * 0.1 = -1000
      expect(mockTrade.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pnl: "-1000",
        }),
        { transaction: mockTransaction }
      );
    });

    test("should throw error if trade already closed", async () => {
      mockTrade.findByPk.mockResolvedValue({
        id: "trade-123",
        is_closed: true,
      });

      await expect(closeTrade("trade-123", "0.1")).rejects.toThrow("Trade déjà clôturé");
    });

    test("should throw error if closing quantity exceeds available", async () => {
      mockTrade.findByPk.mockResolvedValue({
        id: "trade-123",
        quantity: "0.1",
        is_closed: false,
        user_id: "user-123",
        asset_id: 1,
      });
      mockUser.findByPk.mockResolvedValue({ id: "user-123", cash: "1000" });
      mockAsset.findByPk.mockResolvedValue({ id: 1, symbol: "BTCUSDT" });

      await expect(closeTrade("trade-123", "1")).rejects.toThrow("Quantité invalide");
    });
  });

  describe("getTradesByUser", () => {
    test("should return all trades for a user", async () => {
      const mockTrades = [
        {
          id: "trade-1",
          user_id: "user-123",
          quantity: "0.1",
          price_open: "50000",
          pnl: "1000",
          is_closed: true,
          setDataValue: jest.fn(),
          asset: { id: 1, symbol: "BTCUSDT" },
        },
        {
          id: "trade-2",
          user_id: "user-123",
          quantity: "0.2",
          price_open: "60000",
          pnl: "-500",
          is_closed: true,
          setDataValue: jest.fn(),
          asset: { id: 1, symbol: "BTCUSDT" },
        },
      ];

      mockTrade.findAll.mockResolvedValue(mockTrades);

      const result = await getTradesByUser({ userId: "user-123" });

      expect(mockTrade.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: "user-123" },
          order: [["opened_at", "DESC"]],
        })
      );
      expect(result).toHaveLength(2);
      expect(mockTrades[0].setDataValue).toHaveBeenCalledWith("pnl_pct", expect.any(Number));
    });

    test("should filter trades by is_closed flag", async () => {
      mockTrade.findAll.mockResolvedValue([]);

      await getTradesByUser({ userId: "user-123", is_closed: true });

      expect(mockTrade.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: "user-123", is_closed: true },
        })
      );
    });

    test("should filter trades by asset_id", async () => {
      mockTrade.findAll.mockResolvedValue([]);

      await getTradesByUser({ userId: "user-123", assetId: 1 });

      expect(mockTrade.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: "user-123", asset_id: 1 },
        })
      );
    });

    test("should calculate pnl_pct correctly", async () => {
      const mockTrades = [
        {
          id: "trade-1",
          quantity: "0.1",
          price_open: "50000", // Invested: 5000
          pnl: "500", // Profit: 500
          setDataValue: jest.fn(),
          asset: { id: 1, symbol: "BTCUSDT" },
        },
      ];

      mockTrade.findAll.mockResolvedValue(mockTrades);

      await getTradesByUser({ userId: "user-123" });

      // pnl_pct = (500 / 5000) * 100 = 10%
      expect(mockTrades[0].setDataValue).toHaveBeenCalledWith("pnl_pct", 10);
    });

    test("should throw error if userId is missing", async () => {
      await expect(getTradesByUser({})).rejects.toThrow("userId requis");
    });
  });
});
