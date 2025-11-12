// src/components/news/NewsCard.jsx
import React from "react";
import CardBase from "../ui/CardBase";
import { formatPublished } from "/src/utils/formatDate";

function iconSrcFor(category = "") {
  const c = String(category).toUpperCase();
  if (c === "BTC" || c.includes("BITCOIN")) return "/images/bitcoin.svg";
  if (c === "ETH" || c.includes("ETHEREUM")) return "/images/ethereum.svg";
  return "/images/market.svg";
}

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
  const icon = iconSrcFor(category);

  return (
    <CardBase
      href={href}
      className="flex items-start gap-4"
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {/* Media: image article OU placeholder avec logo */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title ?? ""}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          className={`${size} rounded-xl object-cover flex-none`}
        />
      ) : (
        <div
          className={`${size} rounded-xl border border-border bg-muted/30 flex-none flex items-center justify-center`}
          aria-hidden="true"
        >
          <img src={icon} alt="" className="w-7 h-7 opacity-90" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Badge catégorie avec logo */}
        <span
          className="mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/30"
          aria-label={`catégorie ${category}`}
        >
          <img src={icon} alt="" className="w-3.5 h-3.5" />
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
