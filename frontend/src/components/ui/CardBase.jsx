// src/components/ui/CardBase.jsx
import React from "react";

export default function CardBase({
  href,
  onClick,
  children,
  className = "",
  ...rest
}) {
  const Tag = href ? "a" : "div";

  const classes = [
    "group relative w-full rounded-2xl",
    "border border-app bg-surface text-app",
    "p-4 shadow-sm hover:shadow-md",
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]",
    className,
  ].join(" ");

  const props = { onClick, className: classes, ...rest };

  if (href) {
    props.href = href;
    // ouverture sécurisée si lien externe
    if (/^https?:\/\//.test(href)) {
      props.target = "_blank";
      props.rel = "noopener noreferrer";
    }
  }

  return <Tag {...props}>{children}</Tag>;
}
