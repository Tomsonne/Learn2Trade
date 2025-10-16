// src/components/news/NewsCard.jsx
import React from "react";
import CardBase from "../ui/CardBase";
import { formatPublished } from "/src/utils/formatDate";

export default function NewsCard({
  category = "Marché",
  title,
  excerpt,
  source,
  publishedAt,
  imageUrl,
  href,
  featured = false,
}) {
  const size = featured ? "h-28 w-28" : "h-16 w-16";
  const isExternal = href?.startsWith("http");

  return (
    <CardBase
      href={href}
      className="flex items-start gap-4"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={title ?? ""} loading="lazy" className={`${size} rounded-xl object-cover flex-none`} />
      ) : (
        <div className={`${size} rounded-xl border border-app bg-surface flex-none`} aria-hidden="true" />
      )}

      <div className="min-w-0 flex-1">
        {/* Badge catégorie sur tokens */}
        <span
          className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: "rgb(var(--primary) / 0.10)", color: "rgb(var(--primary))" }}
        >
          {category}
        </span>

        {/* Titre sur palette projet */}
        <h3 className={`font-semibold ${featured ? "text-lg" : "text-base"} text-app truncate`} title={title}>
          {title}
        </h3>

        {/* Extrait SANS prose (prose override la couleur → gris clair) */}
        {excerpt && (
          <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-2 text-xs text-muted">
          {source} {publishedAt && `• ${formatPublished(publishedAt)}`}
        </div>
      </div>
    </CardBase>
  );
}
