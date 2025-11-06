import { Link } from "react-router-dom";
import { TrendingUp, BookOpen, Target, LineChart, Github, Linkedin, Twitter } from "lucide-react";
import LandingHeader from "../components/LandingHeader";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <LandingHeader />

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Apprenez à trader, simplement.
              </h1>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                Forex + Crypto. Simulation. Temps réel. Zéro risque.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                >
                  Commencer maintenant
                </Link>
                <a
                  href="#features"
                  className="px-6 py-2.5 border-2 border-violet-600 text-violet-600 dark:text-violet-400 font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950 transition-all"
                >
                  En savoir plus
                </a>
              </div>

              {/* Social Proof */}
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>8 Cryptos</span>
                </div>
                <div className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-violet-600" />
                  <span>Temps réel</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Formation incluse</span>
                </div>
              </div>
            </div>

            {/* Right: Video */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-violet-200 dark:border-violet-900">
                <video
                  className="w-full h-auto object-cover"
                  src="/videoHomepage_faststart.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-violet-300 dark:bg-violet-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-indigo-300 dark:bg-indigo-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Fonctionnalités Principales
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour apprendre le trading sans risque
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Educational Content */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 rounded-3xl p-8 border border-violet-200 dark:border-violet-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Cours et Contenus Pédagogiques
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Apprenez les bases du trading avec nos cours interactifs, tutoriels vidéo et guides pratiques conçus pour les débutants.
              </p>
              <div className="mt-6 aspect-video bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-violet-200 dark:border-violet-800">
                <img src="/images/courses.png" alt="Cours et Contenus Pédagogiques" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Feature 2: Real-time Trading Simulation */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-3xl p-8 border border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Trading Simulé en Temps Réel
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Pratiquez le trading sur 8 cryptomonnaies avec des données de marché en direct de Binance, sans risquer votre argent.
              </p>
              <div className="mt-6 aspect-video bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-green-200 dark:border-green-800">
                <img src="/images/trade.png" alt="Trading Simulé en Temps Réel" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Feature 3: Technical Indicators */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-3xl p-8 border border-orange-200 dark:border-orange-800 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Stratégies et Indicateurs Techniques
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Maîtrisez les indicateurs RSI, moyennes mobiles (MA20/MA50) et développez vos propres stratégies de trading.
              </p>
              <div className="mt-6 aspect-video bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800">
                <img src="/images/indicator.png" alt="Stratégies et Indicateurs Techniques" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Notre Histoire
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              La genèse de SkillVest
            </p>
          </div>

          {/* Story */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Tout a commencé avec une idée simple : <strong className="text-violet-600 dark:text-violet-400">rendre le trading algorithmique accessible, compréhensible et formateur.</strong>
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Julien, ancien consultant en marketing digital, a toujours eu le goût de la stratégie — mais aussi le besoin de créer, de transformer une vision en produit concret. Sa passion pour le trading et le design d'interface l'a naturellement conduit vers le développement web et mobile, où il met aujourd'hui sa créativité au service de l'expérience utilisateur.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Thomas, lui, a toujours été attiré par la logique et la résolution de problèmes. Passionné par la structure et la fiabilité, il s'est spécialisé dans le développement backend, en construisant des systèmes d'authentification sécurisés, une logique de trading robuste et des APIs performantes.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Leur rencontre est née d'une passion commune pour le trading et la technologie. Ensemble, ils ont décidé de créer SkillVest, un projet qui unit leurs compétences pour offrir une plateforme claire, éducative et performante dédiée à la découverte et à la pratique du trading algorithmique.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Aujourd'hui, Julien et Thomas poursuivent cette mission avec la même ambition : <strong className="text-violet-600 dark:text-violet-400">rendre l'investissement intelligent plus humain, plus pédagogique et plus transparent.</strong>
              </p>
            </div>
          </div>

          {/* Team */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Julien */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">J</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Julien Pulon
              </h3>
              <p className="text-violet-600 dark:text-violet-400 text-center font-medium mb-6">
                Co-fondateur de SkillVest
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://www.linkedin.com/in/julien-pulon/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href="https://github.com/Tomsonne/Learn2Trade/tree/main"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href="https://twitter.com/julien_pulon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
              </div>
            </div>

            {/* Thomas */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">T</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Thomas Rousseau
              </h3>
              <p className="text-violet-600 dark:text-violet-400 text-center font-medium mb-6">
                Co-fondateur de SkillVest
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="https://www.linkedin.com/in/thomas-rousseau/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href="https://github.com/Tomsonne/Learn2Trade/tree/main"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
                <a
                  href="https://twitter.com/thomas_rousseau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </a>
              </div>
            </div>
          </div>

          {/* GitHub Link */}
          <div className="text-center">
            <a
              href="https://github.com/Tomsonne/Learn2Trade/tree/main"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all"
            >
              <Github className="w-6 h-6" />
              Voir le projet sur GitHub
            </a>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Portfolio Project for{" "}
              <a
                href="https://www.holbertonschool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                Holberton School
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <img
              src="/images/skillvest.png"
              alt="SkillVest Logo"
              className="h-8 w-auto"
            />
            <p className="text-gray-400 text-sm">
              © 2025 SkillVest. Tous droits réservés.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/Tomsonne/Learn2Trade/tree/main"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
