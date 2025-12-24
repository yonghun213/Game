
import { PrismaClient } from './src/generated/client'
const prisma = new PrismaClient()

async function main() {
    const t1 = await prisma.task.findFirst({ where: { title: 'Approve Budget' } })
    const t2 = await prisma.task.findFirst({ where: { title: 'Contract Signed' } })

    console.log('Approve Budget:', t1?.id)
    console.log('Contract Signed:', t2?.id)

    if (t1 && t2) {
        const dep = await prisma.taskDependency.findFirst({
            where: {
                task_id: t2.id, // Contract Signed depends on Approve Budget
                depends_on_id: t1.id
            }
        })
        console.log('Dependency (Contract -> Approve):', dep)

        // Check reverse just in case
        const dep2 = await prisma.taskDependency.findFirst({
            where: { task_id: t1.id, depends_on_id: t2.id }
        })
        console.log('Dependency (Approve -> Contract):', dep2)
    }
}

main()
