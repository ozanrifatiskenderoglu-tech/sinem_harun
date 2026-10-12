import './globals.css';

export const metadata = {
  title: 'Sinem & Harun - Fotoğraf Paylaşımı',
  description: 'Düğün Anı Albümü',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
