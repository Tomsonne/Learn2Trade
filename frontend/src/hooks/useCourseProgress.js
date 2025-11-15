// src/hooks/useCourseProgress.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "learn2trade_course_progress";

const DEFAULT_PROGRESS = {
  lessons: {
    rsi_basics: { completed: false, score: 0, badge: null },
    rsi_advanced: { completed: false, score: 0, badge: null },
    ma_basics: { completed: false, score: 0, badge: null },
    ma_advanced: { completed: false, score: 0, badge: null },
  },
  totalScore: 0,
  level: 1,
  unlockedBadges: [],
};

export function useCourseProgress() {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);

  // Charger la progression depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse progress:", e);
      }
    }
  }, []);

  // Sauvegarder la progression dans localStorage
  const saveProgress = (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  // Compléter une leçon
  const completeLesson = (lessonId, score, badge) => {
    const newProgress = { ...progress };
    newProgress.lessons[lessonId] = {
      completed: true,
      score,
      badge: badge || null,
    };

    // Calculer le score total
    const totalScore = Object.values(newProgress.lessons).reduce(
      (sum, lesson) => sum + lesson.score,
      0
    );
    newProgress.totalScore = totalScore;

    // Calculer le niveau (tous les 100 points = 1 niveau)
    newProgress.level = Math.floor(totalScore / 100) + 1;

    // Ajouter le badge si nouveau
    if (badge && !newProgress.unlockedBadges.includes(badge)) {
      newProgress.unlockedBadges.push(badge);
    }

    saveProgress(newProgress);
  };

  // Réinitialiser la progression
  const resetProgress = () => {
    saveProgress(DEFAULT_PROGRESS);
  };

  // Calculer le pourcentage de progression
  const getProgressPercentage = () => {
    const total = Object.keys(progress.lessons).length;
    const completed = Object.values(progress.lessons).filter(
      (l) => l.completed
    ).length;
    return Math.round((completed / total) * 100);
  };

  // Vérifier si une leçon est débloquée
  const isLessonUnlocked = (lessonId) => {
    const order = ["rsi_basics", "rsi_advanced", "ma_basics", "ma_advanced"];
    const index = order.indexOf(lessonId);
    if (index === 0) return true; // Première leçon toujours débloquée
    const previousLesson = order[index - 1];
    return progress.lessons[previousLesson]?.completed || false;
  };

  return {
    progress,
    completeLesson,
    resetProgress,
    getProgressPercentage,
    isLessonUnlocked,
  };
}
