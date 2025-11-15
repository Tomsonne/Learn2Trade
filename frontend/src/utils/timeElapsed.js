// Formats time elapsed since a given date
// Returns human-readable string like "2h 30m" or "3 days"
export function formatTimeElapsed(dateString) {
  if (!dateString) return "—";

  const now = new Date();
  const opened = new Date(dateString);

  if (isNaN(opened.getTime())) return "—";

  const diffMs = now - opened;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    if (diffDay === 1) return "1 jour";
    return `${diffDay} jours`;
  }

  if (diffHour > 0) {
    const remainingMin = diffMin % 60;
    if (remainingMin === 0) return `${diffHour}h`;
    return `${diffHour}h ${remainingMin}m`;
  }

  if (diffMin > 0) {
    return `${diffMin}m`;
  }

  if (diffSec > 0) {
    return `${diffSec}s`;
  }

  return "maintenant";
}
