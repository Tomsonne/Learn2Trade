export const strategies = [
  {
    id: "rsi_strategy",
    title: "Stratégie RSI Simple",
    level: "Débutant",
    description:
      "Une stratégie basée sur l'indicateur RSI pour identifier les zones de survente et surachat.",
    steps: [
      "Attendez que le RSI descende sous 30 (zone de survente)",
      "Confirmez avec le volume : il doit être élevé",
      "Entrez en position d'achat quand le RSI remonte au-dessus de 35",
      "Placez votre stop-loss 3% sous votre prix d'achat",
      "Prenez vos profits quand le RSI atteint 70 ou plus",
    ],
    risk: "Faible",
    timeframe: "1H - 4H",
    successRate: "65-70%",
  },
  {
    id: "ma_crossover",
    title: "Croisement de Moyennes Mobiles",
    level: "Débutant",
    description:
      "Stratégie trending qui utilise le croisement des moyennes mobiles 20 et 50.",
    steps: [
      "Surveillez le croisement de la MA20 et MA50",
      "Golden Cross : MA20 au-dessus de MA50 = Signal d'achat",
      "Death Cross : MA20 en dessous de MA50 = Signal de vente",
      "Confirmez avec la tendance générale du marché",
      "Stop-loss : sous la MA50 pour les achats, au-dessus pour les ventes",
    ],
    risk: "Moyen",
    timeframe: "4H - 1D",
    successRate: "60-65%",
  },
  {
    id: "support_resistance",
    title: "Trading de Support et Résistance",
    level: "Intermédiaire",
    description:
      "Identifiez et tradez les rebonds sur les niveaux de support et résistance.",
    steps: [
      "Identifiez les niveaux de support et résistance clairs",
      "Attendez que le prix approche de ces niveaux",
      "Achetez près du support avec confirmation (volume, chandelier d'inversion)",
      "Vendez près de la résistance avec confirmation",
      "Stop-loss : 1-2% au-delà du niveau cassé",
    ],
    risk: "Moyen",
    timeframe: "30M - 4H",
    successRate: "70-75%",
  },
];