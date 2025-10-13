export const glossaryTerms = [
  {
    term: "Chandeliers (Bougies japonaises)",
    definition:
      "Représentation visuelle de l’évolution du prix sur une période (UT). Chaque bougie affiche l’ouverture (O), le plus haut (H), le plus bas (L) et la clôture (C). Le corps montre la distance entre ouverture et clôture ; les mèches montrent les extrêmes atteints.",
    usage:
      "Cherche des bougies de retournement (marteau, étoile filante) proches de supports/résistances pour des signaux plus fiables.",
  },
  {
    term: "Corps & Mèches",
    definition:
      "Le corps (rectangle) représente l’ouverture et la clôture ; les mèches (lignes fines) indiquent les plus hauts et plus bas de la période. Un long corps = mouvement fort ; longues mèches = rejet/indécision.",
    usage:
      "Une longue mèche basse sur support peut indiquer un rejet des prix bas → possible rebond.",
  },
  {
    term: "UT / Timeframe",
    definition:
      "L’unité de temps de tes graphiques (ex. 1h, 4h, 12h, 1j). Les signaux sur UT élevée (daily/weekly) sont plus fiables mais plus rares ; sur UT courte ils sont plus fréquents mais plus bruités.",
    usage:
      "Analyse d’abord une UT élevée pour la tendance globale, puis affine ton entrée sur une UT plus courte.",
  },
  {
    term: "Tendance",
    definition:
      "Direction dominante du marché (haussière, baissière, latérale). Une tendance haussière affiche des sommets et des creux de plus en plus hauts ; l’inverse en tendance baissière.",
    usage:
      "Trade dans le sens de la tendance dominante ; évite d’acheter à contre-tendance sauf setup clair.",
  },
  {
    term: "Support",
    definition:
      "Zone de prix où la demande est suffisante pour freiner voire inverser une baisse. Les acheteurs y défendent le niveau.",
    usage:
      "Repère plusieurs points de contact pour valider un support. Un support cassé peut devenir résistance.",
  },
  {
    term: "Résistance",
    definition:
      "Zone de prix où l’offre est suffisante pour freiner voire inverser une hausse. Les vendeurs y défendent le niveau.",
    usage:
      "Prends des profits partiels à proximité d’une résistance majeure ; une résistance cassée peut devenir support.",
  },
  {
    term: "Ligne de tendance (Trendline)",
    definition:
      "Droite qui relie plusieurs creux (tendance haussière) ou sommets (tendance baissière). Sert de support/résistance dynamique.",
    usage:
      "Plus il y a de points de contact, plus la trendline est crédible. Un break + retest peut offrir une entrée propre.",
  },
  {
    term: "Moyenne mobile simple (SMA)",
    definition:
      "Moyenne arithmétique des clôtures sur N périodes. Lisse le prix pour mieux voir la tendance.",
    usage:
      "SMA20 (court terme), SMA50 (moyen terme). SMA20 au-dessus de SMA50 = biais haussier.",
  },
  {
    term: "Moyenne mobile exponentielle (EMA)",
    definition:
      "Moyenne mobile pondérée qui donne plus de poids aux dernières clôtures. Réagit plus vite que la SMA.",
    usage:
      "EMA20/EMA50 utiles pour capter rapidement les changements de momentum et les pullbacks.",
  },
  {
    term: "Croisement de MAs (Golden/Death Cross)",
    definition:
      "Golden Cross : MA courte qui croise au-dessus d’une MA longue (signal haussier). Death Cross : croisement inverse (signal baissier).",
    usage:
      "Combine avec la tendance de fond et les volumes ; évite de l’utiliser seul en range.",
  },
  {
    term: "RSI (Relative Strength Index)",
    definition:
      "Oscillateur de momentum (0–100) qui mesure la vitesse/ampleur des mouvements. Classiquement paramétré à 14 périodes.",
    usage:
      "RSI > 70 = zone de surachat (risque de correction). RSI < 30 = zone de survente (potentiel de rebond). Cherche des divergences.",
  },
  {
    term: "Divergence RSI",
    definition:
      "Décalage entre le prix et le RSI (ex. prix fait un nouveau plus bas mais RSI ne confirme pas). Peut annoncer un affaiblissement de la tendance.",
    usage:
      "Divergence haussière près d’un support = setup de rebond ; divergence baissière près d’une résistance = prudence.",
  },
  {
    term: "Breakout (Cassure)",
    definition:
      "Franchissement d’un support/résistance/figure. Un breakout valide est souvent accompagné de volume.",
    usage:
      "Attends un retest (pullback) de la zone cassée pour une entrée plus sûre. Méfie-toi des faux breakouts (pièges).",
  },
  {
    term: "Pullback / Retest",
    definition:
      "Retour du prix vers un niveau cassé (support/résistance) pour le tester comme nouveau rôle (SR flip).",
    usage:
      "Entrer sur le retest améliore le ratio risque/rendement, stop juste sous/au-dessus du niveau.",
  },
  {
    term: "Volatilité (ATR)",
    definition:
      "L’ATR (Average True Range) mesure la volatilité moyenne. Ne donne pas la direction, mais l’amplitude des mouvements.",
    usage:
      "Place ton stop au-delà d’un multiple d’ATR pour éviter de te faire sortir par ‘bruit’. Ajuste la taille de position.",
  },
  {
    term: "Volume",
    definition:
      "Quantité échangée pendant une période. Un mouvement valide est souvent soutenu par une hausse de volume.",
    usage:
      "Breakout + volume fort = signal plus fiable. Hausse sans volume = méfiance (risque de faux signal).",
  },
  {
    term: "Stop-Loss",
    definition:
      "Ordre qui clôture la position si le prix atteint un niveau défini, pour limiter la perte maximale.",
    usage:
      "Place-le là où ton idée n’est plus valide (sous un support, au-delà d’une mèche clé). Risque par trade ≤ 1–2%.",
  },
  {
    term: "Take-Profit",
    definition:
      "Ordre qui sécurise automatiquement les gains à un prix cible.",
    usage:
      "Fixe plusieurs objectifs (TP1/TP2/TP3) pour sécuriser progressivement, surtout près des résistances.",
  },
  {
    term: "Ratio Risque/Rendement (RR)",
    definition:
      "Rapport entre la perte potentielle (jusqu’au SL) et le gain potentiel (jusqu’au TP).",
    usage:
      "Vise un RR ≥ 1:2. Même avec 50% de trades gagnants, tu restes profitable avec une bonne gestion du risque.",
  },
  {
    term: "Range",
    definition:
      "Marché latéral entre un support et une résistance horizontaux. Les cassures en sortie de range peuvent être puissantes.",
    usage:
      "Acheter en bas du range, vendre en haut (tant que le range tient). Sur cassure confirmée, bascule en stratégie tendance.",
  },
];
