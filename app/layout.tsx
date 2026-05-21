import './globals.css';

export const metadata = {
  title: 'Pencil Physics Leaderboard',
  description: 'Mechanical Constraint Benchmark for LLMs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}