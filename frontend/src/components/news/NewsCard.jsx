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
  return (
    <CardBase href={href} className="flex items-start gap-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className={`${featured ? "h-28 w-28" : "h-16 w-16"} rounded-xl object-cover`}
          loading="lazy"
        />
      ) : (
        <div className={`${featured ? "h-28 w-28" : "h-16 w-16"} rounded-xl bg-slate-100`} />
      )}

      <div className="min-w-0 flex-1">
        <span className="mb-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {category}
        </span>

        <h3 className={`font-semibold text-slate-900 ${featured ? "text-lg" : "text-base"} truncate`}>
          {title}
        </h3>

        {excerpt && <p className="mt-1 text-sm text-slate-600 line-clamp-2">{excerpt}</p>}

        <div className="mt-2 text-xs text-slate-500">
          {source} {publishedAt && `• ${formatPublished(publishedAt)}`}
        </div>
      </div>
    </CardBase>
  );
}
