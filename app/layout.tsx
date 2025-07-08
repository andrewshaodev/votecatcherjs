import './globals.css'

export const metadata = {
  title: 'Votecatcher',
  description: 'An open-source tool to automate signature validation for ballot initiatives using OCR and fuzzy matching.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container" style={{ padding: '50px 0 100px 0' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
