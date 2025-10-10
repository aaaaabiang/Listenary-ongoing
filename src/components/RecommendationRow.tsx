// src/components/discovery/RecommendationRow.tsx
import React from "react";
import { Link } from "react-router-dom";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";

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

export default function RecommendationRow({
  // 标题保留可传，但默认就是 Today’s Pick
  title = "Today’s Pick",
  items,
  onSelect,
  isLoading = false,
}: {
  title?: string;
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

  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <section className="saved-section today-pick-section" style={{ marginTop: 16 }}>
      {/* 头部样式与 Saved 一致 + 望远镜图标 */}
      <div className="saved-header" style={{ alignItems: "center" }}>
        <span
          className="saved-title"
          style={{ fontSize: 20, display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <TravelExploreOutlinedIcon className="saved-icon" />
          {title}
        </span>
      </div>

      {/* 一行一张卡，共四行 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {rows.map((p: Item, i: number) => (
          <div
            key={(p && (p.id || p.url)) || `row-${i}`}
            className="saved-item"
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 16,
              padding: 16,
              borderRadius: 20,
              background: "#f5f5f5",
              cursor: isLoading ? "default" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
            onClick={() => !isLoading && onSelect(p)}
          >
            {/* 左侧封面 */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 16,
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
                  alt={p.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>

            {/* 右侧信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 标题 */}
              <div
                title={p.title}
                style={{
                  ...twoLine,
                  fontWeight: 600,
                  fontSize: 18,
                  marginBottom: 6,
                  background: isLoading ? "#e5e7eb" : "transparent",
                  borderRadius: 6,
                }}
              >
                {isLoading ? "\u00A0" : p.title}
              </div>

              {/* 作者 */}
              <div
                style={{
                  color: "#6b7280",
                  marginBottom: 6,
                  background: isLoading ? "#f3f4f6" : "transparent",
                  borderRadius: 6,
                }}
              >
                {isLoading ? "\u00A0" : p.author ? `by ${p.author}` : ""}
              </div>

              {/* 简介两行 */}
              <div
                style={{
                  ...twoLine,
                  color: "#4b5563",
                  marginBottom: 8,
                  background: isLoading ? "#f3f4f6" : "transparent",
                  borderRadius: 6,
                }}
              >
                {isLoading ? "\u00A0\u00A0\u00A0\u00A0" : p.description || ""}
              </div>

              {/* 元信息（可选显示） */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13, color: "#6b7280" }}>
                {isLoading ? (
                  <>
                    <span style={{ background: "#e5e7eb", borderRadius: 6 }}>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                    <span style={{ background: "#e5e7eb", borderRadius: 6 }}>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                  </>
                ) : (
                  <>
                    {!!p.categories?.length && (
                      <span>Tags: {p.categories.slice(0, 3).join(", ")}</span>
                    )}
                    {typeof p.episodesCount === "number" && (
                      <span>• Episodes: {p.episodesCount}</span>
                    )}
                    {p.lastUpdated && (
                      <span>• Updated: {new Date(p.lastUpdated).toLocaleDateString()}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部按钮（复用 .show-more 样式） */}
      <Link to="/search" className="show-more" style={{ display: "inline-block" }}>
        Go Discovery →
      </Link>
    </section>
  );
}
