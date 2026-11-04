import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import DynamicThemeColor from "@/components/DynamicThemeColor";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
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
    statusBarStyle: "default",
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
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
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
                  var isGreen = p === '/warga/dashboard' || p === '/dashboard' || p === '/warga' || p === '/petugas/dashboard' || p === '/petugas' || p.indexOf('/login') === 0 || p.indexOf('/register') === 0;
                  var color = isGreen ? '#38746D' : '#FFFFFF';
                  var appleStyle = isGreen ? 'black-translucent' : 'default';

                  var metaTheme = document.querySelectorAll('meta[name="theme-color"]');
                  if (metaTheme.length === 0) {
                    var m = document.createElement('meta');
                    m.setAttribute('name', 'theme-color');
                    m.setAttribute('content', color);
                    document.head.appendChild(m);
                  } else {
                    metaTheme.forEach(function(el) { el.setAttribute('content', color); });
                  }

                  var metaApple = document.querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]');
                  if (metaApple.length === 0) {
                    var ma = document.createElement('meta');
                    ma.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
                    ma.setAttribute('content', appleStyle);
                    document.head.appendChild(ma);
                  } else {
                    metaApple.forEach(function(el) { el.setAttribute('content', appleStyle); });
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900 selection:bg-[#38746D] selection:text-white">
        <ServiceWorkerRegister />
        <DynamicThemeColor />
        {children}
      </body>
    </html>
  );
}
