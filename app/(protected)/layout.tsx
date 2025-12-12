import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { SessionProvider } from '@/components/SessionProvider'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <SessionProvider session={session}>
      <Navbar />
      <main className="page-container bg-light">{children}</main>
    </SessionProvider>
  )
}


