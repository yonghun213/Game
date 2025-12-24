
import { NextResponse } from 'next/server'
import { PrismaClient } from '@/src/generated/client'
import { rescheduleTask } from '@/src/lib/scheduling'

const prisma = new PrismaClient()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { newStartDate, policy } = body

  if (!newStartDate || !policy) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    await rescheduleTask(id, new Date(newStartDate), policy)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to reschedule' }, { status: 500 })
  }
}
