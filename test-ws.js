// Test WebSocket connection to Railway
import WebSocket from 'ws';

const WS_URL = 'wss://learn2trade-production.up.railway.app/ws';

console.log(`Tentative de connexion à: ${WS_URL}`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ WebSocket connecté avec succès!');
  ws.close();
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ Erreur WebSocket:', error.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`WebSocket fermé. Code: ${code}, Raison: ${reason}`);
});

setTimeout(() => {
  console.error('⏱️  Timeout - Connexion impossible');
  ws.close();
  process.exit(1);
}, 10000);
