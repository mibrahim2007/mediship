import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#0d9488",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20%",
      }}
    >
      <span style={{ color: "white", fontSize: 280, fontWeight: 800, fontFamily: "sans-serif", lineHeight: 1 }}>
        M
      </span>
    </div>,
    { width: 512, height: 512 }
  )
}
