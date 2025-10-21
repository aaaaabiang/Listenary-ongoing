import React from "react";
import { Chip } from "@mui/material";

type Item = {
  id?: string;
  url?: string;            // RSS
  title: string;
  author?: string;
  image?: string;
  description?: string;
  categories?: string[];
  episodesCount?: number;
  lastUpdated?: string;    // ISO
};

import { stripHtml } from '../utils/stripHtml';

export default function RecommendationRow({
  items,
  onSelect,
  isLoading = false,
}: {
  items: Item[];
  onSelect: (p: Item) => void;
  isLoading?: boolean;
}) {
  // 两行截断样式
  const twoLine = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as const,
    WebkitLineClamp: 2,
    overflow: "hidden",
  };

  const rows = isLoading
    ? (Array.from({ length: 4 }).map((_, i) => ({ id: `sk-${i}`, title: "" })) as any[])
    : (items || []).slice(0, 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {rows.map((p: Item, i: number) => {
        const cleanTitle = stripHtml(p.title || "");
        const cleanDesc = stripHtml(p.description || "");

        return (
          <div
            key={(p && (p.id || p.url)) || `row-${i}`}
            onClick={() => !isLoading && onSelect(p)}
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 20,
              padding: 20,
              borderRadius: 16,
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              cursor: isLoading ? "default" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
          >
            {/* 左侧封面 */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 12,
                overflow: "hidden",
                flexShrink: 0,
                background: "#eee",
              }}
            >
              {isLoading ? (
                <div style={{ width: "100%", height: "100%", background: "#e5e7eb" }} />
              ) : p.image ? (
                <img
                  src={p.image}
                  alt={cleanTitle}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>

            {/* 右侧信息 */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <div
                title={cleanTitle}
                style={{ ...twoLine, fontWeight: 700, fontSize: 18, marginBottom: 6 }}
              >
                {isLoading ? "\u00A0" : cleanTitle}
              </div>

              {p.author && (
                <div style={{ color: "#6b7280", marginBottom: 8, fontSize: 14 }}>
                  by {p.author}
                </div>
              )}

              <div style={{ ...twoLine, color: "#4b5563", fontSize: 15, marginBottom: 10 }}>
                {isLoading ? "\u00A0\u00A0\u00A0" : cleanDesc}
              </div>

              {!!p.categories?.length && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                  {p.categories.map((tag, idx) => (
                    <Chip
                      key={`${tag}-${idx}`}
                      label={tag}
                      size="small"
                      sx={{
                        borderRadius: "9999px",
                        backgroundColor: "rgba(33,150,243,0.15)",
                        color: "rgb(25,118,210)",
                        border: "none",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 元信息 */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  fontSize: 13,
                  color: "#6b7280",
                  marginTop: 6,
                }}
              >
                {!isLoading && (
                  <>
                    {typeof p.episodesCount === "number" && (
                      <span>Episodes: {p.episodesCount}</span>
                    )}
                    {p.lastUpdated && (
                      <span>• Updated: {new Date(p.lastUpdated).toLocaleDateString()}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
