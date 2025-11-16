// app/services/websocket.service.js
import { WebSocketServer } from 'ws';
import { getCandles, getSpotPrice } from './market.service.js';
import { listNews } from './news.service.js';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.intervals = new Map();
    this.subscriptions = new Map(); // client -> Set of subscriptions
  }

  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket client connected from:', req.socket.remoteAddress);
      this.clients.add(ws);
      this.subscriptions.set(ws, new Set());

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(ws, data);
        } catch (err) {
          console.error('WebSocket message error:', err);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
        this.subscriptions.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send initial connection success
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connected successfully'
      }));
    });

    // Start global updates (news)
    this.startNewsUpdates();

    console.log('WebSocket server initialized on /ws');
  }

  async handleMessage(ws, data) {
    const { type, payload } = data;
    console.log('[WebSocket] Received message:', type, payload);

    switch (type) {
      case 'subscribe:spotPrice':
        this.subscribeToSpotPrice(ws, payload);
        break;

      case 'subscribe:marketSeries':
        this.subscribeToMarketSeries(ws, payload);
        break;

      case 'unsubscribe:spotPrice':
        this.unsubscribeFromSpotPrice(ws, payload);
        break;

      case 'unsubscribe:marketSeries':
        this.unsubscribeFromMarketSeries(ws, payload);
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${type}`
        }));
    }
  }

  subscribeToSpotPrice(ws, { symbol }) {
    if (!symbol) {
      ws.send(JSON.stringify({ type: 'error', error: 'Symbol required' }));
      return;
    }

    console.log(`[WebSocket] Subscribing to spot price for ${symbol}`);
    const subscriptionKey = `spotPrice:${symbol}`;
    const clientSubs = this.subscriptions.get(ws);

    if (clientSubs.has(subscriptionKey)) {
      console.log(`[WebSocket] Already subscribed to ${subscriptionKey}`);
      return; // Already subscribed
    }

    clientSubs.add(subscriptionKey);

    // Create interval for this subscription if it doesn't exist
    if (!this.intervals.has(subscriptionKey)) {
      console.log(`[WebSocket] Creating interval for ${subscriptionKey}, clients count: ${this.clients.size}`);
      const intervalId = setInterval(async () => {
        try {
          const price = await getSpotPrice(symbol);

          // Send to all clients subscribed to this symbol
          this.clients.forEach(client => {
            const clientSubs = this.subscriptions.get(client);
            if (clientSubs && clientSubs.has(subscriptionKey) && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'spotPrice',
                symbol,
                data: price
              }));
            }
          });
        } catch (err) {
          console.error(`Error fetching spot price for ${symbol}:`, err);
        }
      }, 5000); // Update every 5 seconds

      this.intervals.set(subscriptionKey, intervalId);
    }

    // Send immediate data
    getSpotPrice(symbol).then(price => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'spotPrice',
          symbol,
          data: price
        }));
      }
    }).catch(err => {
      console.error(`Error fetching initial spot price for ${symbol}:`, err);
    });
  }

  subscribeToMarketSeries(ws, { symbol, tf }) {
    if (!symbol || !tf) {
      ws.send(JSON.stringify({ type: 'error', error: 'Symbol and timeframe required' }));
      return;
    }

    console.log(`[WebSocket] Subscribing to market series for ${symbol}/${tf}`);
    const subscriptionKey = `marketSeries:${symbol}:${tf}`;
    const clientSubs = this.subscriptions.get(ws);

    if (clientSubs.has(subscriptionKey)) {
      return; // Already subscribed
    }

    clientSubs.add(subscriptionKey);

    // Create interval for this subscription if it doesn't exist
    if (!this.intervals.has(subscriptionKey)) {
      const intervalId = setInterval(async () => {
        try {
          const series = await getCandles({ symbol, tf, limit: 200 });

          // Send to all clients subscribed to this symbol/tf
          this.clients.forEach(client => {
            const clientSubs = this.subscriptions.get(client);
            if (clientSubs && clientSubs.has(subscriptionKey) && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'marketSeries',
                symbol,
                tf,
                data: series
              }));
            }
          });
        } catch (err) {
          console.error(`Error fetching market series for ${symbol}/${tf}:`, err);
        }
      }, 10000); // Update every 10 seconds

      this.intervals.set(subscriptionKey, intervalId);
    }

    // Send immediate data
    getCandles({ symbol, tf, limit: 200 }).then(series => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'marketSeries',
          symbol,
          tf,
          data: series
        }));
      }
    }).catch(err => {
      console.error(`Error fetching initial market series for ${symbol}/${tf}:`, err);
    });
  }

  unsubscribeFromSpotPrice(ws, { symbol }) {
    const subscriptionKey = `spotPrice:${symbol}`;
    const clientSubs = this.subscriptions.get(ws);

    if (clientSubs) {
      clientSubs.delete(subscriptionKey);
    }

    // Check if any client is still subscribed
    const stillSubscribed = Array.from(this.subscriptions.values())
      .some(subs => subs.has(subscriptionKey));

    if (!stillSubscribed && this.intervals.has(subscriptionKey)) {
      clearInterval(this.intervals.get(subscriptionKey));
      this.intervals.delete(subscriptionKey);
    }
  }

  unsubscribeFromMarketSeries(ws, { symbol, tf }) {
    const subscriptionKey = `marketSeries:${symbol}:${tf}`;
    const clientSubs = this.subscriptions.get(ws);

    if (clientSubs) {
      clientSubs.delete(subscriptionKey);
    }

    // Check if any client is still subscribed
    const stillSubscribed = Array.from(this.subscriptions.values())
      .some(subs => subs.has(subscriptionKey));

    if (!stillSubscribed && this.intervals.has(subscriptionKey)) {
      clearInterval(this.intervals.get(subscriptionKey));
      this.intervals.delete(subscriptionKey);
    }
  }

  startNewsUpdates() {
    // Update news every 5 minutes
    const updateNews = async () => {
      try {
        const news = await listNews({ limit: 20 });

        this.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'news',
              data: news
            }));
          }
        });
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };

    // Initial fetch
    updateNews();

    // Then every 5 minutes
    setInterval(updateNews, 5 * 60 * 1000);
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(data);
      }
    });
  }

  shutdown() {
    // Clear all intervals
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();

    // Close all client connections
    this.clients.forEach(client => {
      client.close();
    });
    this.clients.clear();
    this.subscriptions.clear();

    if (this.wss) {
      this.wss.close();
    }
  }
}

export default new WebSocketService();
