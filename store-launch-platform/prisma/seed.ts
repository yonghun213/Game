
import { PrismaClient } from '../src/generated/client'
import bcrypt from 'bcryptjs'
import { generateStoreTimeline } from '../src/lib/scheduling'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with A-to-Z template...')

  // 1. Users
  const passwordHash = await bcrypt.hash('password123', 10)

  const users = [
    { email: 'admin@example.com', name: 'Alice Admin', role: 'ADMIN' },
    { email: 'pm@example.com', name: 'Pablo PM', role: 'PM' },
    { email: 'carlos@example.com', name: 'Carlos Contributor', role: 'CONTRIBUTOR' },
    { email: 'maria@example.com', name: 'Maria Contributor', role: 'CONTRIBUTOR' },
    { email: 'viewer@example.com', name: 'Victor Viewer', role: 'VIEWER' },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password_hash: passwordHash },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        password_hash: passwordHash,
      },
    })
  }

  // 2. Ingredients & Pricing (Simplified for this milestone, mostly to keep app working)
  const ingredients = [
     { name: 'Ground Beef', unit_type: 'g', category: 'Meat' },
     { name: 'Bun', unit_type: 'unit', category: 'Bakery' }
  ]

  for (const i of ingredients) {
      const ing = await prisma.ingredient.create({ data: i })
      await prisma.groceryPrice.create({
          data: {
              country: 'MX', retailer: 'Walmart', ingredient_id: ing.id, package_size: 1000, package_unit: 'g',
              price: 150, currency: 'MXN', normalized_price_per_unit: 0.15, as_of: new Date()
          }
      })
  }

  // 3. A-to-Z Template
  // Delete existing to clean up (respecting FKs)
  await prisma.templateTask.deleteMany({})
  await prisma.templatePhase.deleteMany({})
  await prisma.template.deleteMany({})

  const template = await prisma.template.create({
    data: {
      name: 'Standard Store Opening – Full A to Z',
      version: '2.0',
      is_active: true
    }
  })

  const phasesData = [
    {
      name: '0. Deal / Planning',
      order: 0,
      tasks: [
        { name: 'Approve Budget', anchor: 'OPEN_DATE', offset: -180, dur: 5, rule: 'CALENDAR_DAYS', role: 'ADMIN' },
        { name: 'Define Store Concept & Format', anchor: 'OPEN_DATE', offset: -175, dur: 5, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Contract Signed', anchor: 'CONTRACT_SIGNED', offset: 0, dur: 0, rule: 'CALENDAR_DAYS', role: 'ADMIN', is_milestone: true },
        { name: 'Site Survey / Feasibility', anchor: 'OPEN_DATE', offset: -175, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Lease Negotiation', anchor: 'OPEN_DATE', offset: -170, dur: 21, rule: 'CALENDAR_DAYS', role: 'ADMIN' },
        { name: 'Sign Lease', anchor: 'OPEN_DATE', offset: -145, dur: 1, rule: 'CALENDAR_DAYS', role: 'ADMIN' },
        { name: 'Kickoff: Master Launch Plan', anchor: 'OPEN_DATE', offset: -144, dur: 2, rule: 'CALENDAR_DAYS', role: 'PM' },
      ]
    },
    {
      name: '1. Design & Permits',
      order: 1,
      tasks: [
        { name: 'Select Architect / Designer', anchor: 'OPEN_DATE', offset: -140, dur: 5, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Schematic Layout Design', anchor: 'OPEN_DATE', offset: -135, dur: 10, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'MEP Plan', anchor: 'OPEN_DATE', offset: -125, dur: 10, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Finalize Floor Plan', anchor: 'OPEN_DATE', offset: -115, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Permit Package Prep', anchor: 'OPEN_DATE', offset: -110, dur: 10, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Submit Permits', anchor: 'OPEN_DATE', offset: -100, dur: 1, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Permit Review Loop', anchor: 'OPEN_DATE', offset: -99, dur: 30, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Permit Approved', anchor: 'OPEN_DATE', offset: -70, dur: 0, rule: 'CALENDAR_DAYS', role: 'PM', is_milestone: true },
      ]
    },
    {
      name: '2. Menu & Supply',
      order: 2,
      tasks: [
        // Anchored to Contract Signed (assumed D-180 relative to Open)
        // D-120 is Contract + 60
        { name: 'Draft Menu Selection', anchor: 'CONTRACT_SIGNED', offset: 60, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Recipe Testing', anchor: 'CONTRACT_SIGNED', offset: 67, dur: 10, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Menu Costing', anchor: 'CONTRACT_SIGNED', offset: 77, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Finalize Menu', anchor: 'CONTRACT_SIGNED', offset: 84, dur: 1, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Select Key Suppliers', anchor: 'CONTRACT_SIGNED', offset: 85, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Set Up Vendor Accounts', anchor: 'CONTRACT_SIGNED', offset: 92, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
      ]
    },
    {
      name: '3. Equipment',
      order: 3,
      tasks: [
        { name: 'Equipment List Draft', anchor: 'OPEN_DATE', offset: -120, dur: 5, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Request Quotes', anchor: 'OPEN_DATE', offset: -115, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Select Equipment Vendors', anchor: 'OPEN_DATE', offset: -108, dur: 3, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Place Equipment Orders', anchor: 'OPEN_DATE', offset: -105, dur: 2, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Confirm Delivery Windows', anchor: 'OPEN_DATE', offset: -90, dur: 2, rule: 'CALENDAR_DAYS', role: 'PM' },
      ]
    },
    {
      name: '4. Construction',
      order: 4,
      tasks: [
        { name: 'Construction Start', anchor: 'OPEN_DATE', offset: -90, dur: 0, rule: 'CALENDAR_DAYS', role: 'PM', is_milestone: true },

        { name: 'GC Selection / Contract', anchor: 'OPEN_DATE', offset: -105, dur: 10, rule: 'CALENDAR_DAYS', role: 'PM' },
        // These are anchored to CONSTRUCTION_START
        { name: 'Construction Kickoff', anchor: 'CONSTRUCTION_START', offset: 0, dur: 1, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Demolition / Prep', anchor: 'CONSTRUCTION_START', offset: 1, dur: 5, rule: 'CALENDAR_DAYS', role: 'PM', depends_on: ['Construction Kickoff'] },
        { name: 'Framing & Rough-in MEP', anchor: 'CONSTRUCTION_START', offset: 6, dur: 20, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Rough-in Inspection Scheduling', anchor: 'CONSTRUCTION_START', offset: 20, dur: 2, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Rough-in Inspections', anchor: 'CONSTRUCTION_START', offset: 22, dur: 3, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Drywall / Finishes', anchor: 'CONSTRUCTION_START', offset: 25, dur: 20, rule: 'CALENDAR_DAYS', role: 'PM' },

        // Back to OPEN_DATE for late stage stuff
        { name: 'Signage Install Plan', anchor: 'OPEN_DATE', offset: -45, dur: 10, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Equipment Install', anchor: 'OPEN_DATE', offset: -28, dur: 7, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Final Clean', anchor: 'OPEN_DATE', offset: -5, dur: 2, rule: 'CALENDAR_DAYS', role: 'PM' },
      ]
    },
    {
      name: '5. IT & Systems',
      order: 5,
      tasks: [
        { name: 'Select POS', anchor: 'OPEN_DATE', offset: -90, dur: 7, rule: 'CALENDAR_DAYS', role: 'IT' },
        { name: 'Order POS Hardware', anchor: 'OPEN_DATE', offset: -80, dur: 3, rule: 'CALENDAR_DAYS', role: 'IT' },
        { name: 'Install Network', anchor: 'OPEN_DATE', offset: -21, dur: 2, rule: 'CALENDAR_DAYS', role: 'IT' },
        { name: 'Configure POS', anchor: 'OPEN_DATE', offset: -14, dur: 7, rule: 'CALENDAR_DAYS', role: 'IT' },
      ]
    },
    {
      name: '6. Licensing',
      order: 6,
      tasks: [
        { name: 'Business License App', anchor: 'OPEN_DATE', offset: -60, dur: 10, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Health Inspection', anchor: 'OPEN_DATE', offset: -14, dur: 1, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Business License Issued', anchor: 'OPEN_DATE', offset: -3, dur: 0, rule: 'CALENDAR_DAYS', role: 'PM', is_milestone: true },
      ]
    },
    {
      name: '7. Hiring & Training',
      order: 7,
      tasks: [
        { name: 'Hire Store Manager', anchor: 'OPEN_DATE', offset: -60, dur: 14, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Hire Crew', anchor: 'OPEN_DATE', offset: -30, dur: 14, rule: 'CALENDAR_DAYS', role: 'PM' },
        // Training Week
        { name: 'Training Day 1', anchor: 'OPEN_DATE', offset: -10, dur: 1, rule: 'BUSINESS_DAYS_MON_FRI', role: 'PM' },
        { name: 'Training Day 2', anchor: 'OPEN_DATE', offset: -9, dur: 1, rule: 'BUSINESS_DAYS_MON_FRI', role: 'PM' },
        { name: 'Training Day 3', anchor: 'OPEN_DATE', offset: -8, dur: 1, rule: 'BUSINESS_DAYS_MON_FRI', role: 'PM' },
        { name: 'Training Day 4', anchor: 'OPEN_DATE', offset: -7, dur: 1, rule: 'BUSINESS_DAYS_MON_FRI', role: 'PM' },
        { name: 'Training Day 5', anchor: 'OPEN_DATE', offset: -6, dur: 1, rule: 'BUSINESS_DAYS_MON_FRI', role: 'PM' },
      ]
    },
    {
      name: '8. Opening',
      order: 8,
      tasks: [
        { name: 'Soft Open', anchor: 'OPEN_DATE', offset: -3, dur: 0, rule: 'CALENDAR_DAYS', role: 'PM', is_milestone: true },
        { name: 'Soft Opening Day 1', anchor: 'OPEN_DATE', offset: -3, dur: 1, rule: 'CALENDAR_DAYS', role: 'PM' },
        { name: 'Grand Open', anchor: 'OPEN_DATE', offset: 0, dur: 0, rule: 'CALENDAR_DAYS', role: 'PM', is_milestone: true },
        { name: 'Grand Opening Execution', anchor: 'OPEN_DATE', offset: 0, dur: 1, rule: 'CALENDAR_DAYS', role: 'PM' },
      ]
    }
  ]

  for (const p of phasesData) {
    const phase = await prisma.templatePhase.create({
      data: {
        template_id: template.id,
        name: p.name,
        order: p.order
      }
    })

    for (const t of p.tasks) {
      await prisma.templateTask.create({
        data: {
          phase_id: phase.id,
          name: t.name,
          role_responsible: t.role,
          duration_days: t.dur,
          anchor_event: t.anchor,
          offset_days: t.offset,
          workday_rule: t.rule,
          is_milestone: t.is_milestone || false,
          dependency_indices: t.depends_on ? JSON.stringify(t.depends_on) : null
        }
      })
    }
  }

  // 4. Create a Sample Store to Test Scheduling Logic
  // Clean up old stores
  await prisma.task.deleteMany({}) // tasks depend on store
  await prisma.milestone.deleteMany({}) // milestones depend on store
  await prisma.store.deleteMany({})

  const store = await prisma.store.create({
    data: {
      name: 'Mexico City Flagship',
      country: 'MX',
      city: 'Mexico City',
      timezone: 'America/Mexico_City',
      planned_open_date: new Date('2025-06-01'),
      status: 'PLANNING',
      template_version: template.version
    }
  })

  // Create Milestones
  const openDate = new Date('2025-06-01')
  const constructionDate = new Date(openDate)
  constructionDate.setDate(openDate.getDate() - 90)
  const contractDate = new Date(openDate)
  contractDate.setDate(openDate.getDate() - 180)

  const milestonesData = [
      { store_id: store.id, name: 'Planned Open Date', type: 'OPEN_DATE', date: openDate, status: 'PENDING' },
      { store_id: store.id, name: 'Construction Start', type: 'CONSTRUCTION_START', date: constructionDate, status: 'PENDING' },
      { store_id: store.id, name: 'Contract Signed', type: 'CONTRACT_SIGNED', date: contractDate, status: 'ACHIEVED' },
  ]
  for (const m of milestonesData) {
      await prisma.milestone.create({ data: m })
  }

  // Generate Tasks
  await generateStoreTimeline(store.id, template.id)

  console.log('Seed complete. Store created: ' + store.name)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
