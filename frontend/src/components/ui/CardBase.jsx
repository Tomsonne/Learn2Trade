// src/components/ui/CardBase.jsx
import React from "react";

export default function CardBase({
  href,
  onClick,
  children,
  className = "",
  ...rest // pour passer d'autres props (id, aria-*, data-*)
}) {
  const tag = href ? "a" : "div";

  const props = {
    onClick,
    className:
      "group relative w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
      className,
    ...rest,
  };

  // si lien -> ajouter href
  if (href) props.href = href;

  return React.createElement(tag, props, children);
}
