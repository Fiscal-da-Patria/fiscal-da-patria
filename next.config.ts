import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages (preset "Next.js (Static HTML Export)"): gera `out/`.
  // `cacheComponents`/PPR não são compatíveis com export estático.
  output: "export",
  images: {
    // O otimizador de imagens do Next exige servidor; no static export, use o original.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.camara.leg.br",
        pathname: "/internet/deputado/**",
      },
    ],
  },
};

export default nextConfig;
