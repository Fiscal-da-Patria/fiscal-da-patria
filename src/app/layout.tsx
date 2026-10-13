import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadados do card que aparece no WhatsApp / Telegram / X.
 * `metadataBase` é obrigatório para o crawler montar a URL ABSOLUTA da imagem OG.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://fiscaldapatria.org.br"),
  title: "Fiscal da Pátria — Veja como seu deputado votou",
  description:
    "Veja como seu deputado votou no prato de comida e na blindagem de políticos. Auditoria cívica das votações nominais da Câmara dos Deputados, em linguagem popular e sempre com link para a fonte oficial.",
  applicationName: "Fiscal da Pátria",
  authors: [{ name: "Fiscal da Pátria" }],
  keywords: [
    "votações Câmara dos Deputados",
    "como votou meu deputado",
    "transparência pública",
    "dados abertos",
    "auditoria cívica",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Fiscal da Pátria",
    description:
      "Veja como seu deputado votou no prato de comida e na blindagem de políticos. Só fatos da Câmara, sem pedido de voto.",
    url: "/",
    siteName: "Fiscal da Pátria",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fiscal da Pátria — Veja como seu deputado votou no prato de comida e na blindagem de políticos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiscal da Pátria — Veja como seu deputado votou",
    description:
      "No prato de comida, no salário livre de IR e na blindagem de políticos: veja como cada deputado votou. Dados oficiais da Câmara.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

/** Cor da barra do navegador no Android/iOS (mesma identidade cívica). */
export const viewport: Viewport = {
  themeColor: "#0f2f1d",
  colorScheme: "light dark",
};

// Aplica o tema ANTES do primeiro paint (evita "flash" branco).
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem('fiscal-tema');var e=t?t==='escuro':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',e);r.style.colorScheme=e?'dark':'light';}catch(_){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-fundo-neutro text-titulo">
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        {children}
      </body>
    </html>
  );
}

