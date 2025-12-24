
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user_id')

  if (!userCookie) {
    redirect('/')
  }

  // Fetch user details? For MVP just assuming ID is valid or storing name in cookie too (insecure but fast for MVP)
  // Let's assume user_id is enough.

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <Link href="/dashboard" className="text-xl font-bold text-slate-800">StoreLaunch</Link>
           <nav className="hidden md:flex space-x-4 text-sm font-medium text-gray-600">
             <Link href="/dashboard" className="hover:text-blue-600">Overview</Link>
             <Link href="/dashboard/stores" className="hover:text-blue-600">Stores</Link>
             <Link href="/dashboard/pricing" className="hover:text-blue-600">Pricing</Link>
           </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Logged in as {userCookie.value}</span>
          <form action={async () => {
            'use server'
            const c = await cookies()
            c.delete('user_id')
            redirect('/')
          }}>
            <button className="text-sm text-red-600 hover:text-red-800">Logout</button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
