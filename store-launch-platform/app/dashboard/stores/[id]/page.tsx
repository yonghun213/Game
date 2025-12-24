
import { PrismaClient } from '@/src/generated/client'
import StoreDetailClient from './StoreDetailClient'

const prisma = new PrismaClient()

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { start_date: 'asc' }
      },
      milestones: true
    }
  })

  if (!store) {
    return <div>Store not found</div>
  }

  // Serializing dates for client component
  const serializedStore = {
    ...store,
    planned_open_date: store.planned_open_date?.toISOString(),
    tasks: store.tasks.map(t => ({
      ...t,
      start_date: t.start_date?.toISOString(),
      due_date: t.due_date?.toISOString(),
      created_at: t.created_at.toISOString(),
      updated_at: t.updated_at.toISOString()
    })),
    milestones: store.milestones.map(m => ({
        ...m,
        date: m.date.toISOString()
    }))
  }

  return <StoreDetailClient store={serializedStore} />
}
