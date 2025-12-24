
import { NextResponse } from 'next/server'
import { PrismaClient } from '@/src/generated/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Delete dependencies first?
    await prisma.taskDependency.deleteMany({
        where: {
            OR: [
                { task_id: id },
                { depends_on_id: id }
            ]
        }
    })

    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
