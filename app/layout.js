import "./globals.css";

export const metadata = {
  title: "Sinem & Harun - Fotoğraf Paylaşımı",
  description: "Bu özel günümüzden anıları paylaşın",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
