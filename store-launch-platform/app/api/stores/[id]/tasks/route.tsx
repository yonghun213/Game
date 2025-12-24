
import { NextResponse } from 'next/server'
import { PrismaClient } from '@/src/generated/client'

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { title, start_date, due_date, phase, role_responsible } = body

  if (!title || !start_date || !due_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const task = await prisma.task.create({
      data: {
        store_id: id,
        title,
        start_date: new Date(start_date),
        due_date: new Date(due_date),
        phase: phase || 'Ad-hoc',
        // role_responsible: role_responsible // Not in Task model yet? TemplateTask has it. Task has owner_id.
        // Task schema has description, etc. Let's stick to basic fields.
        status: 'NOT_STARTED'
      }
    })
    return NextResponse.json(task)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
