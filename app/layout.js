import './globals.css';

export const metadata = {
  title: 'My Inventory',
  description: 'Your tools, components and equipment, organised in collections',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
