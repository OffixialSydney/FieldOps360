import './globals.css';

export const metadata = { title: 'FieldOps 360', description: 'Field service management' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body>{children}</body>
    </html>
  );
}
