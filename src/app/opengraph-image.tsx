import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Investors Playground";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(216, 162, 61, 0.28), transparent 28%), linear-gradient(135deg, #fbf8f1 0%, #f6f2ea 52%, #efe4d1 100%)",
          color: "#1e2a2f",
          fontFamily: "Avenir Next, Helvetica Neue, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            borderRadius: 32,
            border: "1px solid rgba(30, 42, 47, 0.08)",
            background: "rgba(255, 253, 248, 0.9)",
            boxShadow: "0 16px 48px rgba(30, 42, 47, 0.08)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 76px",
            width: "100%",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#0c6b58",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "#d8a23d",
              }}
            />
            Investors Playground
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 760 }}>
            <div
              style={{
                fontSize: 82,
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: -2.5,
              }}
            >
              Build investing confidence before you risk real money.
            </div>
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.3,
                color: "#5f6b72",
                maxWidth: 700,
              }}
            >
              Practice with live ASX prices, track your portfolio, and learn in a calm simulated environment.
            </div>
          </div>

          <div style={{ display: "flex", gap: 18 }}>
            {["Live ASX pricing", "Portfolio tracking", "Risk-free practice"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  border: "1px solid rgba(12, 107, 88, 0.14)",
                  background: "rgba(12, 107, 88, 0.08)",
                  padding: "14px 22px",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#0c6b58",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
