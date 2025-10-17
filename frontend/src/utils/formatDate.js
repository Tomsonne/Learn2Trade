// src/utils/formatDate.js
const FMT_DATETIME = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",   // "6 oct. 2025"
  timeStyle: "short",    // "14:32"
  timeZone: "Europe/Paris",
});
const FMT_DATE = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeZone: "Europe/Paris",
});
const FMT_TIME = new Intl.DateTimeFormat("fr-FR", {
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function parseDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value) ? null : value;
  if (typeof value === "number") {
    // si < 10^12, on considère que c’est un timestamp en secondes
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return isNaN(d) ? null : d;
  }
  // string ISO ou autre
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

export function formatPublished(value) {
  const d = parseDateSafe(value);
  return d ? FMT_DATETIME.format(d) : "";
}

export function formatDateOnly(value) {
  const d = parseDateSafe(value);
  return d ? FMT_DATE.format(d) : "";
}

export function formatTimeOnly(value) {
  const d = parseDateSafe(value);
  return d ? FMT_TIME.format(d) : "";
}
