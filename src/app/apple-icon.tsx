import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#0d9488",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22%",
      }}
    >
      <span style={{ color: "white", fontSize: 100, fontWeight: 800, fontFamily: "sans-serif", lineHeight: 1 }}>
        M
      </span>
    </div>,
    { width: 180, height: 180 }
  )
}
