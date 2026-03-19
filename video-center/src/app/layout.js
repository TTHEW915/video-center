import './globals.css'

export const metadata = {
  title: 'Video Distribution Center',
  description: 'Upload once, publish everywhere',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
