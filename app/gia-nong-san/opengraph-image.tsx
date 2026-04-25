import { ImageResponse } from "next/og";
import { getTopMovers } from "./_lib/queries";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpengraphImage() {
  const movers = await getTopMovers(5);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #04111b 0%, #0b2233 45%, #163c3a 100%)",
          color: "white",
          padding: 48,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#8ee7c6" }}>Nhà Bè Agri</div>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, maxWidth: 720 }}>Giá nông sản hôm nay</div>
            <div style={{ fontSize: 28, color: "#dbeafe" }}>Top biến động được render trực tiếp từ App Router</div>
          </div>

          <div style={{ display: "flex", gap: 18, width: "100%" }}>
            {movers.map((item, index) => (
              <div
                key={item.id}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 28,
                  padding: 24,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ fontSize: 18, color: "#94a3b8" }}>#{index + 1}</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{item.cropLabel}</div>
                <div style={{ fontSize: 20, color: "#cbd5e1" }}>{item.province}</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{item.priceVnd.toLocaleString("vi-VN")}đ</div>
                <div style={{ fontSize: 22, color: (item.changePct ?? 0) >= 0 ? "#86efac" : "#fda4af" }}>
                  {(item.changePct ?? 0) >= 0 ? "+" : ""}
                  {(item.changePct ?? 0).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
