// src/components/news/NewsCard.jsx
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
  const size = featured ? "h-36 w-36" : "h-20 w-20";
  const isExternal = typeof href === "string" && href.startsWith("http");
  const icon = iconSrcFor(category);

  return (
    <CardBase
      href={href}
      className={`flex items-start gap-4 transition-all hover:shadow-lg ${featured ? 'border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent' : ''}`}
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
          className={`${size} rounded-xl object-cover flex-none shadow-sm`}
        />
      ) : (
        <div
          className={`${size} rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/30 flex-none flex items-center justify-center`}
          aria-hidden="true"
        >
          <img src={icon} alt="" className={`${featured ? 'w-10 h-10' : 'w-8 h-8'} opacity-90`} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Badge catégorie avec logo */}
        <span
          className="mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/30 shadow-sm"
          aria-label={`catégorie ${category}`}
        >
          <img src={icon} alt="" className="w-3.5 h-3.5" />
          {category}
        </span>

        {/* Titre */}
        <h3
          className={`font-semibold ${featured ? "text-xl mb-2" : "text-base"} text-card-foreground ${featured ? 'line-clamp-2' : 'truncate'} hover:text-primary transition-colors`}
          title={title}
        >
          {title}
        </h3>

        {/* Extrait */}
        {excerpt && (
          <p className={`mt-1.5 text-sm leading-relaxed text-muted-foreground ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{source}</span>
          {publishedAt && (
            <>
              <span>•</span>
              <span>{formatPublished(publishedAt)}</span>
            </>
          )}
        </div>
      </div>
    </CardBase>
  );
}
