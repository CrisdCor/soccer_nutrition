import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default de Next es 1mb; el bucket player-photos permite hasta 5mb
    // (ver migración create_player_photos_bucket), así que la subida de
    // fotos vía Server Action necesita ese mismo tope aquí.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
