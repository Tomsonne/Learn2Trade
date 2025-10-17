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
  const isExternal = typeof href === "string" && href.startsWith("http");

  return (
    <CardBase
      href={href}
      className="flex items-start gap-4"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title ?? ""}
          loading="lazy"
          className={`${size} rounded-xl object-cover flex-none`}
        />
      ) : (
        <div
          className={`${size} rounded-xl border border-border bg-card flex-none`}
          aria-hidden="true"
        />
      )}

      <div className="min-w-0 flex-1">
        {/* Badge catégorie (tokens) */}
        <span
          className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/30"
          aria-label={`catégorie ${category}`}
        >
          {category}
        </span>

        {/* Titre */}
        <h3
          className={`font-semibold ${featured ? "text-lg" : "text-base"} text-card-foreground truncate`}
          title={title}
        >
          {title}
        </h3>

        {/* Extrait */}
        {excerpt && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-2 text-xs text-muted-foreground">
          {source} {publishedAt && `• ${formatPublished(publishedAt)}`}
        </div>
      </div>
    </CardBase>
  );
}
