// src/utils/formatDate.js
const fmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",   // ex: "6 oct. 2025"
  timeStyle: "short",    // ex: "14:32"
  timeZone: "Europe/Paris",
});

export function formatPublished(value) {
  if (!value) return "";
  const d = new Date(value);
  return fmt.format(d);  // "6 oct. 2025, 14:32"
}
