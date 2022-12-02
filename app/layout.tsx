import '../styles/globals.css'

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-500">
      <body>{children}</body>
    </html>
  );
}

