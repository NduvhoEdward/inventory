import './globals.css';

export const metadata = {
  title: 'Bench Inventory',
  description: 'Electronics parts inventory',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
