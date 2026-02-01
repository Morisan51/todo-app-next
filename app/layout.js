import "./globals.css";

export const metadata = {
  title: "My TODO",
  description: "シンプルなTODOアプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
