
import { PrismaClient } from '@/src/generated/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function LoginPage() {
  const users = await prisma.user.findMany()

  async function login(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    if (userId) {
       const c = await cookies()
       // In real app, verify password. Here, just set cookie.
       c.set('user_id', userId)
       redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Store Launch Ops</h1>
        <p className="mb-4 text-gray-600 text-center">Select a user to simulate login (MVP Mode)</p>

        <form action={login} className="space-y-4">
          <div className="space-y-2">
            {users.map(u => (
              <label key={u.id} className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="userId" value={u.email} className="mr-3" required />
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.role} - {u.email}</div>
                </div>
              </label>
            ))}
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">
            Enter Platform
          </button>
        </form>
      </div>
    </div>
  )
}
