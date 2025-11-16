#!/bin/bash

echo "🔍 Test de connexion WebSocket sur Railway..."
echo ""

response=$(curl -s -v --http1.1 \
  -H "Upgrade: websocket" \
  -H "Connection: Upgrade" \
  -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
  -H "Sec-WebSocket-Version: 13" \
  https://learn2trade-production.up.railway.app/ws 2>&1)

if echo "$response" | grep -q "101 Switching Protocols"; then
  echo "✅ WebSocket fonctionne! Railway a bien upgradé la connexion."
  exit 0
elif echo "$response" | grep -q "404"; then
  echo "❌ Erreur 404 - Le WebSocket service n'est pas encore déployé."
  echo "   Attendez que le déploiement 424a840 soit terminé sur Railway."
  exit 1
else
  echo "⚠️  Réponse inattendue:"
  echo "$response" | grep "< HTTP"
  exit 1
fi
