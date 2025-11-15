// src/components/InteractiveCourseSection.jsx
import { useState } from "react";
import {
  BookOpen,
  Lock,
  CheckCircle,
  Trophy,
  Star,
  TrendingUp,
  BarChart3,
  Award,
  Target,
  Zap,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import { useCourseProgress } from "../hooks/useCourseProgress";

// Composant LessonCard - Affiche le contenu théorique d'une leçon
function LessonCard({ lesson, onStartQuiz, onBack }) {
  const Icon = lesson.icon;

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-card-foreground mb-1">
            {lesson.title}
          </h2>
          <p className="text-muted-foreground">{lesson.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full ${
              lesson.difficulty === "Débutant"
                ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
            }`}>
              {lesson.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
              {lesson.duration}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
              +{lesson.points} points
            </span>
          </div>
        </div>
      </div>

      {/* Contenu théorique */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-card-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Contenu du cours
        </h3>
        {lesson.content.theory.map((section, index) => (
          <div
            key={index}
            className="bg-accent/50 border border-border rounded-xl p-4"
          >
            <h4 className="font-semibold text-accent-foreground mb-2">
              {index + 1}. {section.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.text}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          onClick={onStartQuiz}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Trophy className="w-5 h-5" />
          Commencer le quiz ({lesson.content.quiz.length} questions)
        </button>
      </div>
    </div>
  );
}

// Composant Quiz - Questions interactives
function Quiz({ questions, onComplete, onBack, lessonTitle }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation) return; // Déjà répondu
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    setAnsweredQuestions([
      ...answeredQuestions,
      {
        question: currentQuestion.question,
        correct: answerIndex === currentQuestion.correctAnswer,
      },
    ]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(score, questions.length);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground mb-1">
            Quiz: {lessonTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} sur {questions.length}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Score actuel</div>
          <div className="text-2xl font-bold text-primary">
            {score}/{questions.length}
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="bg-accent/50 border border-border rounded-xl p-6">
        <h3 className="text-lg font-medium text-accent-foreground mb-4">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswer;
            const showCorrect = showExplanation && isCorrectAnswer;
            const showIncorrect = showExplanation && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : showIncorrect
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      showCorrect
                        ? "border-green-500 bg-green-500"
                        : showIncorrect
                        ? "border-red-500 bg-red-500"
                        : isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {showCorrect && <Check className="w-4 h-4 text-white" />}
                    {showIncorrect && <X className="w-4 h-4 text-white" />}
                    {!showExplanation && isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      showCorrect
                        ? "text-green-700 dark:text-green-300 font-medium"
                        : showIncorrect
                        ? "text-red-700 dark:text-red-300"
                        : "text-card-foreground"
                    }`}
                  >
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explication */}
      {showExplanation && (
        <div
          className={`border-2 rounded-xl p-4 ${
            isCorrect
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-red-500 bg-red-50 dark:bg-red-950/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCorrect ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isCorrect ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <X className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold mb-1 ${
                  isCorrect
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {isCorrect ? "Correct !" : "Incorrect"}
              </h4>
              <p
                className={`text-sm ${
                  isCorrect
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au cours
        </button>
        {showExplanation && (
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            {isLastQuestion ? "Terminer le quiz" : "Question suivante"}
          </button>
        )}
      </div>
    </div>
  );
}

const LESSONS = [
  {
    id: "rsi_basics",
    title: "RSI - Les Fondamentaux",
    icon: BarChart3,
    description: "Maîtrisez les bases du RSI pour identifier les zones de survente et surachat",
    difficulty: "Débutant",
    duration: "15 min",
    points: 50,
    badge: "rsi_novice",
    content: {
      theory: [
        {
          title: "Qu'est-ce que le RSI ?",
          text: "Le RSI (Relative Strength Index) est un oscillateur de momentum qui mesure la vitesse et l'ampleur des mouvements de prix. Il oscille entre 0 et 100.",
        },
        {
          title: "Les zones clés",
          text: "RSI > 70 = Zone de surachat (le prix pourrait baisser). RSI < 30 = Zone de survente (le prix pourrait monter). RSI 30-70 = Zone neutre.",
        },
        {
          title: "Comment l'utiliser ?",
          text: "Attendez que le RSI entre en zone extrême (<30 ou >70), puis cherchez une confirmation (chandelier d'inversion, volume) avant d'entrer en position.",
        },
      ],
      quiz: [
        {
          question: "Que signifie un RSI à 25 ?",
          options: [
            "Le prix est suracheté, il va probablement baisser",
            "Le prix est survendu, il pourrait rebondir",
            "Le prix est dans une zone neutre",
            "Le RSI ne donne aucune indication",
          ],
          correctAnswer: 1,
          explanation:
            "Un RSI à 25 est en zone de survente (<30), ce qui indique que le prix a beaucoup baissé et pourrait rebondir. C'est un signal d'achat potentiel.",
        },
        {
          question: "Quel est le meilleur moment pour acheter avec le RSI ?",
          options: [
            "Quand le RSI est à 75",
            "Quand le RSI descend sous 30 puis remonte au-dessus de 35",
            "Quand le RSI est à 50",
            "Quand le RSI monte au-dessus de 70",
          ],
          correctAnswer: 1,
          explanation:
            "Le meilleur signal d'achat RSI est quand il descend en survente (<30) puis remonte au-dessus de 35, confirmant le retournement haussier.",
        },
        {
          question: "Sur quel timeframe le RSI est-il le plus fiable ?",
          options: [
            "1 minute",
            "5 minutes",
            "1 heure à 4 heures",
            "Le timeframe n'a pas d'importance",
          ],
          correctAnswer: 2,
          explanation:
            "Le RSI est plus fiable sur des timeframes moyens (1H-4H) car il filtre le bruit du marché. Sur des timeframes très courts (1m, 5m), il y a trop de faux signaux.",
        },
      ],
    },
  },
  {
    id: "rsi_advanced",
    title: "RSI - Techniques Avancées",
    icon: Zap,
    description: "Divergences RSI et stratégies avancées pour anticiper les retournements",
    difficulty: "Intermédiaire",
    duration: "20 min",
    points: 75,
    badge: "rsi_expert",
    content: {
      theory: [
        {
          title: "Les Divergences RSI",
          text: "Une divergence se produit quand le prix et le RSI ne sont pas d'accord. C'est un signal puissant de retournement imminent.",
        },
        {
          title: "Divergence Haussière",
          text: "Le prix fait un plus bas, mais le RSI fait un plus haut. Cela indique que la pression vendeuse s'affaiblit = retournement haussier probable.",
        },
        {
          title: "Divergence Baissière",
          text: "Le prix fait un plus haut, mais le RSI fait un plus bas. Cela indique que la pression acheteuse s'affaiblit = retournement baissier probable.",
        },
      ],
      quiz: [
        {
          question:
            "BTC fait 40k puis 38k (plus bas). Le RSI fait 28 puis 32 (plus haut). Que se passe-t-il ?",
          options: [
            "Divergence haussière - signal d'achat",
            "Divergence baissière - signal de vente",
            "Pas de divergence",
            "Signal neutre",
          ],
          correctAnswer: 0,
          explanation:
            "C'est une divergence haussière classique : le prix baisse mais le RSI monte. Cela montre que la pression vendeuse s'affaiblit. C'est un excellent signal d'achat.",
        },
        {
          question: "Pourquoi les divergences RSI sont-elles puissantes ?",
          options: [
            "Elles sont faciles à repérer",
            "Elles anticipent les retournements avant tout le monde",
            "Elles ne donnent jamais de faux signaux",
            "Elles fonctionnent sur tous les timeframes",
          ],
          correctAnswer: 1,
          explanation:
            "Les divergences sont puissantes car elles permettent d'anticiper les retournements AVANT que le prix ne change de direction. Vous entrez avant la masse.",
        },
        {
          question: "Comment confirmer une divergence RSI ?",
          options: [
            "Attendre simplement la divergence",
            "Divergence + chandelier d'inversion + cassure de structure",
            "Divergence + volume faible",
            "La divergence suffit, pas besoin de confirmation",
          ],
          correctAnswer: 1,
          explanation:
            "Il faut TOUJOURS confirmer : divergence + pattern chandelier (hammer, shooting star) + cassure du dernier sommet/creux. Sans confirmation, taux de faux signaux élevé.",
        },
      ],
    },
  },
  {
    id: "ma_basics",
    title: "Moyennes Mobiles - Les Fondamentaux",
    icon: TrendingUp,
    description:
      "Comprenez comment utiliser les MA20 et MA50 pour identifier les tendances",
    difficulty: "Débutant",
    duration: "15 min",
    points: 50,
    badge: "ma_novice",
    content: {
      theory: [
        {
          title: "Qu'est-ce qu'une Moyenne Mobile ?",
          text: "Une Moyenne Mobile (MA) lisse les fluctuations de prix pour montrer la tendance générale. La MA20 = moyenne des 20 derniers prix de clôture.",
        },
        {
          title: "MA20 vs MA50",
          text: "MA20 (courte) = suit le prix de près, réagit vite. MA50 (longue) = tendance générale, moins sensible au bruit. Leur croisement donne des signaux puissants.",
        },
        {
          title: "Golden Cross & Death Cross",
          text: "Golden Cross = MA20 croise MA50 vers le haut = signal d'achat puissant. Death Cross = MA20 croise MA50 vers le bas = signal de vente.",
        },
      ],
      quiz: [
        {
          question: "Que signifie un Golden Cross ?",
          options: [
            "MA20 croise MA50 vers le bas",
            "MA20 croise MA50 vers le haut",
            "Le prix croise la MA20",
            "Les deux MA sont parallèles",
          ],
          correctAnswer: 1,
          explanation:
            "Un Golden Cross se produit quand la MA20 (rapide) croise la MA50 (lente) vers le HAUT. C'est un signal d'achat très puissant qui annonce souvent une grande tendance haussière.",
        },
        {
          question: "Quel est le principal avantage des Moyennes Mobiles ?",
          options: [
            "Elles donnent des signaux en avance",
            "Elles capturent les grandes tendances et filtrent le bruit",
            "Elles fonctionnent en marché latéral",
            "Elles ne donnent jamais de faux signaux",
          ],
          correctAnswer: 1,
          explanation:
            "L'avantage principal des MA est qu'elles lissent le bruit du marché et permettent de suivre les grandes tendances. Par contre, elles sont retardées (entrent après le début de tendance).",
        },
        {
          question: "Où placer son stop-loss avec une stratégie MA ?",
          options: [
            "Au-dessus de la MA20",
            "Sous la MA50 (pour un achat)",
            "50% entre MA20 et MA50",
            "Les MA ne nécessitent pas de stop-loss",
          ],
          correctAnswer: 1,
          explanation:
            "Pour un achat, placez le stop-loss 2-3% sous la MA50. Si le prix casse la MA50 vers le bas, c'est que la tendance haussière est cassée et il faut sortir.",
        },
      ],
    },
  },
  {
    id: "ma_advanced",
    title: "Moyennes Mobiles - Stratégies Avancées",
    icon: Target,
    description: "Combinez les MA avec d'autres indicateurs pour des setups gagnants",
    difficulty: "Intermédiaire",
    duration: "20 min",
    points: 75,
    badge: "ma_master",
    content: {
      theory: [
        {
          title: "MA + Volume",
          text: "Un croisement de MA est beaucoup plus fiable quand il est accompagné d'un volume élevé. Volume faible = signal faible, souvent faux breakout.",
        },
        {
          title: "MA + Support/Résistance",
          text: "Les MA agissent souvent comme support (en tendance haussière) ou résistance (en baisse). Le prix rebondit fréquemment sur la MA50 en tendance forte.",
        },
        {
          title: "Filtrer les faux signaux",
          text: "Attendez toujours une bougie de CONFIRMATION qui clôture au-dessus/en-dessous du croisement. Ne jamais entrer sur le croisement lui-même.",
        },
      ],
      quiz: [
        {
          question:
            "BTC: Golden Cross à 43k avec volume 2x supérieur à la moyenne. Que faire ?",
          options: [
            "Attendre, le volume n'a pas d'importance",
            "Entrer immédiatement en position longue",
            "Attendre une bougie de confirmation au-dessus de 43k, puis entrer",
            "Shorter car c'est un piège",
          ],
          correctAnswer: 2,
          explanation:
            "Excellent setup ! Golden Cross + volume élevé = signal très fort. MAIS attendez toujours une bougie de confirmation (qui clôture au-dessus du croisement) pour éviter les fakeouts.",
        },
        {
          question: "En tendance haussière, comment utiliser la MA50 ?",
          options: [
            "Comme résistance pour shorter",
            "Comme support pour acheter les pullbacks",
            "L'ignorer, elle n'est pas utile",
            "Comme signal de sortie uniquement",
          ],
          correctAnswer: 1,
          explanation:
            "En tendance haussière forte, la MA50 agit comme support dynamique. Quand le prix revient tester la MA50, c'est souvent un excellent point d'entrée (pullback) pour rejoindre la tendance.",
        },
        {
          question: "Que faire si les MA sont enchevêtrées (plat, qui se croisent souvent) ?",
          options: [
            "Trader tous les croisements",
            "NE PAS trader, attendre une tendance claire",
            "Utiliser un timeframe plus court",
            "Augmenter le nombre de MA",
          ],
          correctAnswer: 1,
          explanation:
            "Quand les MA sont enchevêtrées, c'est un marché LATÉRAL (range). Les stratégies MA ne fonctionnent PAS en range. Attendez qu'une tendance claire se forme (MA bien séparées).",
        },
      ],
    },
  },
];

const BADGES = {
  rsi_novice: {
    name: "RSI Novice",
    icon: Star,
    color: "text-blue-500",
    description: "Vous maîtrisez les bases du RSI",
  },
  rsi_expert: {
    name: "Expert RSI",
    icon: Zap,
    color: "text-purple-500",
    description: "Vous connaissez les divergences RSI",
  },
  ma_novice: {
    name: "MA Débutant",
    icon: TrendingUp,
    color: "text-green-500",
    description: "Vous comprenez les Moyennes Mobiles",
  },
  ma_master: {
    name: "Maître des MA",
    icon: Trophy,
    color: "text-yellow-500",
    description: "Vous maîtrisez les stratégies MA avancées",
  },
};

export default function InteractiveCourseSection() {
  const {
    progress,
    completeLesson,
    getProgressPercentage,
    isLessonUnlocked,
    resetProgress,
  } = useCourseProgress();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleLessonClick = (lesson) => {
    if (!isLessonUnlocked(lesson.id)) return;
    setSelectedLesson(lesson);
    setShowQuiz(false);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100;
    const points = Math.round((percentage / 100) * selectedLesson.points);

    // Débloquer le badge si score >= 80%
    const badge = percentage >= 80 ? selectedLesson.badge : null;

    completeLesson(selectedLesson.id, points, badge);
    setShowQuiz(false);
    setSelectedLesson(null);
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 border-2 border-primary/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/20 p-3 border border-primary/30">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">
              Formation Interactive - RSI & Moyennes Mobiles
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Apprenez à votre rythme avec des quiz interactifs. Débloquez des badges et suivez votre progression !
            </p>

            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression globale</span>
                <span className="font-medium text-card-foreground">
                  {progressPercentage}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Niveau {progress.level}</span>
                <span>{progress.totalScore} points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges débloqués */}
        {progress.unlockedBadges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Vos badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {progress.unlockedBadges.map((badgeId) => {
                const badge = BADGES[badgeId];
                const Icon = badge.icon;
                return (
                  <div
                    key={badgeId}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border"
                    title={badge.description}
                  >
                    <Icon className={`w-5 h-5 ${badge.color}`} />
                    <span className="text-sm font-medium text-card-foreground">
                      {badge.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Liste des leçons */}
      {!selectedLesson && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LESSONS.map((lesson, index) => {
            const isUnlocked = isLessonUnlocked(lesson.id);
            const isCompleted = progress.lessons[lesson.id]?.completed;
            const Icon = lesson.icon;

            return (
              <button
                key={lesson.id}
                onClick={() => handleLessonClick(lesson)}
                disabled={!isUnlocked}
                className={`relative text-left p-6 rounded-xl border-2 transition-all ${
                  isUnlocked
                    ? "border-border hover:border-primary hover:shadow-lg cursor-pointer"
                    : "border-border opacity-50 cursor-not-allowed"
                } ${isCompleted ? "bg-green-50 dark:bg-green-950/20" : "bg-card"}`}
              >
                {!isUnlocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-card-foreground">
                        Leçon {index + 1}: {lesson.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {lesson.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        lesson.difficulty === "Débutant"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                      }`}>
                        {lesson.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                        {lesson.duration}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                        +{lesson.points} points
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {progress.lessons[lesson.id].score} points gagnés
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Contenu de la leçon */}
      {selectedLesson && !showQuiz && (
        <LessonCard
          lesson={selectedLesson}
          onStartQuiz={handleStartQuiz}
          onBack={() => setSelectedLesson(null)}
        />
      )}

      {/* Quiz */}
      {selectedLesson && showQuiz && (
        <Quiz
          questions={selectedLesson.content.quiz}
          onComplete={handleQuizComplete}
          onBack={() => setShowQuiz(false)}
          lessonTitle={selectedLesson.title}
        />
      )}

      {/* Bouton reset (développement) */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={resetProgress}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Réinitialiser la progression
        </button>
      )}
    </div>
  );
}
