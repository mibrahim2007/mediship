import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MediShip — Medical Supply & Distribution",
    short_name: "MediShip",
    description: "ERP for medical supply and distribution field reps",
    start_url: "/sales/new",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    icons: [
      { src: "/icon",       sizes: "any", type: "image/png", purpose: "any" },
      { src: "/icon",       sizes: "any", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "any", type: "image/png" },
    ],
  }
}
