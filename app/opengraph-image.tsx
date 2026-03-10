import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "GodSpeaks — Divine Verses, Beautifully Rendered";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(160deg, #0C0906 0%, #1a1208 50%, #0C0906 100%)",
                    fontFamily: "serif",
                    position: "relative",
                }}
            >
                {/* Ambient glow */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 800,
                        height: 400,
                        background: "radial-gradient(ellipse, rgba(200,164,90,0.12) 0%, transparent 70%)",
                        borderRadius: "50%",
                    }}
                />

                {/* Top ornament line */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 32,
                    opacity: 0.6,
                }}>
                    <div style={{ width: 120, height: 1, background: "rgba(200,164,90,0.5)" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8A45A" }} />
                    <div style={{ width: 120, height: 1, background: "rgba(200,164,90,0.5)" }} />
                </div>

                {/* Main title */}
                <div style={{
                    display: "flex",
                    fontSize: 112,
                    fontWeight: 300,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    lineHeight: 1,
                }}>
                    <span style={{ color: "#F0E6CC" }}>God</span>
                    <span style={{ color: "#C8A45A", fontStyle: "italic", fontWeight: 400 }}>Speaks</span>
                </div>

                {/* Bottom ornament line */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    margin: "28px 0",
                    opacity: 0.6,
                }}>
                    <div style={{ width: 180, height: 1, background: "rgba(200,164,90,0.5)" }} />
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8A45A", opacity: 0.7 }} />
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#C8A45A" }} />
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8A45A", opacity: 0.7 }} />
                    <div style={{ width: 180, height: 1, background: "rgba(200,164,90,0.5)" }} />
                </div>

                {/* Subtitle */}
                <div style={{
                    fontSize: 26,
                    color: "#A89A7E",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    fontStyle: "italic",
                    fontWeight: 300,
                }}>
                    Divine verses · Beautifully rendered
                </div>

                {/* Corner frames */}
                {[
                    { top: 32, left: 32,  borderTop: "2px solid rgba(200,164,90,0.4)", borderLeft: "2px solid rgba(200,164,90,0.4)" },
                    { top: 32, right: 32, borderTop: "2px solid rgba(200,164,90,0.4)", borderRight: "2px solid rgba(200,164,90,0.4)" },
                    { bottom: 32, left: 32,  borderBottom: "2px solid rgba(200,164,90,0.4)", borderLeft: "2px solid rgba(200,164,90,0.4)" },
                    { bottom: 32, right: 32, borderBottom: "2px solid rgba(200,164,90,0.4)", borderRight: "2px solid rgba(200,164,90,0.4)" },
                ].map((style, i) => (
                    <div key={i} style={{ position: "absolute", width: 40, height: 40, ...style }} />
                ))}
            </div>
        ),
        { ...size }
    );
}
