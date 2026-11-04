import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeColorManager } from "@/components/ui/ThemeColorManager";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "DERMAYU — Sistem Mitigasi & Pantauan Banjir Indramayu",
  description:
    "Platform peringatan dini tinggi muka air (TMA), respons darurat, dan koordinasi evakuasi banjir terpadu di Kabupaten Indramayu.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dermayu",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600;1,700;1,900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = window.location.pathname;
                  var isGreen = p === '/warga/dashboard' || p === '/dashboard' || p === '/warga' || p.indexOf('/login') === 0 || p.indexOf('/register') === 0;
                  var color = isGreen ? '#38746D' : '#ffffff';
                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', 'theme-color');
                    document.head.appendChild(meta);
                  }
                  meta.setAttribute('content', color);
                  var apple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
                  if (!apple) {
                    apple = document.createElement('meta');
                    apple.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
                    document.head.appendChild(apple);
                  }
                  apple.setAttribute('content', isGreen ? 'black-translucent' : 'default');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900 selection:bg-[#38746D] selection:text-white">
        <ThemeColorManager />
        {children}
      </body>
    </html>
  );
}
