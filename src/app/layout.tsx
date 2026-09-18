import './globals.css'
import AppShell from '@/components/layout/AppShell'

export const metadata = {
  title: 'Attendance Management',
  description: 'Enterprise Employee Attendance Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  )
}