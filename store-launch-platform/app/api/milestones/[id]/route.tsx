
import { NextResponse } from 'next/server'
import { PrismaClient } from '@/src/generated/client'
import { updateMilestone } from '@/src/lib/scheduling'

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { date } = body

  if (!date) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 })
  }

  try {
    await updateMilestone(id, new Date(date))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 })
  }
}
