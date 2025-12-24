
import { PrismaClient } from '../src/generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

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

  // 2. FX Rates
  const fxRates = [
    { from: 'MXN', to: 'CAD', rate: 0.080 },
    { from: 'COP', to: 'CAD', rate: 0.00035 },
    { from: 'USD', to: 'CAD', rate: 1.35 },
  ]

  await prisma.fXRate.deleteMany({})
  for (const r of fxRates) {
    await prisma.fXRate.create({
      data: { from_currency: r.from, to_currency: r.to, rate: r.rate, date: new Date() }
    })
  }

  // 3. Template
  let template = await prisma.template.findFirst({ where: { name: 'Standard Store Opening' } })
  if (!template) {
    template = await prisma.template.create({
      data: {
        name: 'Standard Store Opening',
        version: '1.0',
        phases: {
          create: [
            {
              name: '0. Intake',
              order: 0,
              tasks: {
                create: [
                  { name: 'Approve Budget', duration_days: 5, role_responsible: 'ADMIN' },
                  { name: 'Sign Letter of Intent', duration_days: 7, role_responsible: 'PM' },
                ]
              }
            },
            {
              name: '1. Site & Lease',
              order: 1,
              tasks: {
                create: [
                  { name: 'Site Survey', duration_days: 7, role_responsible: 'PM' },
                  { name: 'Lease Negotiation', duration_days: 21, role_responsible: 'ADMIN' },
                  { name: 'Sign Lease', duration_days: 3, role_responsible: 'ADMIN' },
                ]
              }
            },
            {
              name: '2. Design & Permits',
              order: 2,
              tasks: {
                create: [
                  { name: 'Layout Design', duration_days: 14, role_responsible: 'PM' },
                  { name: 'Submit for Permits', duration_days: 30, role_responsible: 'PM' },
                ]
              }
            },
            {
              name: '3. Construction',
              order: 3,
              tasks: {
                create: [
                  { name: 'General Contractor Tender', duration_days: 14, role_responsible: 'PM' },
                  { name: 'Construction Works', duration_days: 45, role_responsible: 'PM' },
                ]
              }
            },
             {
              name: '4. Equip & IT',
              order: 4,
              tasks: {
                create: [
                   { name: 'Order POS', duration_days: 14, role_responsible: 'IT' },
                   { name: 'Install Network', duration_days: 5, role_responsible: 'IT' },
                ]
              }
            },
             {
              name: '5. Supply Chain',
              order: 5,
              tasks: {
                create: [
                   { name: 'Vendor Setup', duration_days: 10, role_responsible: 'PM' },
                   { name: 'Initial Order', duration_days: 7, role_responsible: 'PM' },
                ]
              }
            },
             {
              name: '6. Hiring & Training',
              order: 6,
              tasks: {
                create: [
                   { name: 'Hire Store Manager', duration_days: 21, role_responsible: 'PM' },
                   { name: 'Staff Training', duration_days: 14, role_responsible: 'PM' },
                ]
              }
            },
             {
              name: '7. Opening',
              order: 7,
              tasks: {
                create: [
                   { name: 'Soft Open', duration_days: 3, role_responsible: 'PM' },
                   { name: 'Grand Open', duration_days: 1, role_responsible: 'PM' },
                ]
              }
            }
          ]
        }
      }
    })
  }

  // 4. Stores
  const storesData = [
    { name: 'Mexico City Flagship', country: 'MX', city: 'Mexico City', timezone: 'America/Mexico_City', open_date: new Date('2025-06-01') },
    { name: 'Bogota Centro', country: 'CO', city: 'Bogota', timezone: 'America/Bogota', open_date: new Date('2025-07-15') },
    { name: 'Cancun Resort Kiosk', country: 'MX', city: 'Cancun', timezone: 'America/Cancun', open_date: new Date('2025-08-01') },
  ]

  for (const s of storesData) {
    const existingStore = await prisma.store.findFirst({ where: { name: s.name } })
    if (!existingStore) {
      const store = await prisma.store.create({
        data: {
          name: s.name,
          country: s.country,
          city: s.city,
          timezone: s.timezone,
          planned_open_date: s.open_date,
          status: 'PLANNING',
          template_version: template.version,
        }
      })

      // Generate Tasks
      const phases = await prisma.templatePhase.findMany({
        where: { template_id: template.id },
        include: { tasks: true }
      })

      const projectStart = new Date(s.open_date)
      projectStart.setDate(projectStart.getDate() - 120)

      let currentOffset = 0

      for (const phase of phases) {
        for (const tTask of phase.tasks) {
          const startDate = new Date(projectStart)
          startDate.setDate(startDate.getDate() + currentOffset)

          const dueDate = new Date(startDate)
          dueDate.setDate(dueDate.getDate() + tTask.duration_days)

          await prisma.task.create({
            data: {
              store_id: store.id,
              title: tTask.name,
              phase: phase.name,
              status: 'NOT_STARTED',
              start_date: startDate,
              due_date: dueDate,
            }
          })

          currentOffset += tTask.duration_days
        }
      }
    }
  }

  // 5. Ingredients
  const ingredientsData = [
    { name: 'Wheat Flour', unit: 'g', category: 'Dry Goods' },
    { name: 'Ground Beef', unit: 'g', category: 'Meat' },
    { name: 'Cheddar Cheese', unit: 'g', category: 'Dairy' },
    { name: 'Tomato', unit: 'g', category: 'Produce' },
    { name: 'Lettuce', unit: 'g', category: 'Produce' },
    { name: 'Burger Bun', unit: 'unit', category: 'Bakery' },
    { name: 'Ketchup', unit: 'ml', category: 'Condiments' },
    { name: 'Mayo', unit: 'ml', category: 'Condiments' },
    { name: 'Salt', unit: 'g', category: 'Spices' },
    { name: 'Pepper', unit: 'g', category: 'Spices' },
    { name: 'Coca Cola', unit: 'ml', category: 'Beverage' },
    { name: 'Water Bottle', unit: 'unit', category: 'Beverage' },
    { name: 'Chicken Breast', unit: 'g', category: 'Meat' },
    { name: 'Rice', unit: 'g', category: 'Dry Goods' },
    { name: 'Beans', unit: 'g', category: 'Dry Goods' },
    { name: 'Onion', unit: 'g', category: 'Produce' },
    { name: 'Garlic', unit: 'g', category: 'Produce' },
    { name: 'Oil', unit: 'ml', category: 'Dry Goods' },
    { name: 'Sugar', unit: 'g', category: 'Dry Goods' },
    { name: 'Milk', unit: 'ml', category: 'Dairy' },
  ]

  const ingredientMap = new Map()

  for (const i of ingredientsData) {
    const existing = await prisma.ingredient.findFirst({ where: { name: i.name } })
    if (existing) {
      ingredientMap.set(i.name, existing)
    } else {
      const created = await prisma.ingredient.create({
        data: { name: i.name, unit_type: i.unit, category: i.category }
      })
      ingredientMap.set(i.name, created)
    }
  }

  // 6. Grocery Prices
  await prisma.groceryPrice.deleteMany({})

  const retailers = {
    'MX': ['Walmart', 'Chedraui'],
    'CO': ['Exito', 'Jumbo']
  }

  const samplePrices = [
    { i: 'Ground Beef', mx: 180, co: 25000, size: 1000, unit: 'g' },
    { i: 'Wheat Flour', mx: 25, co: 4500, size: 1000, unit: 'g' },
    { i: 'Cheddar Cheese', mx: 200, co: 30000, size: 500, unit: 'g' },
    { i: 'Burger Bun', mx: 50, co: 8000, size: 8, unit: 'unit' },
    { i: 'Tomato', mx: 30, co: 4000, size: 1000, unit: 'g' },
    { i: 'Coca Cola', mx: 35, co: 5000, size: 2000, unit: 'ml' },
  ]

  for (const p of samplePrices) {
    const ing = ingredientMap.get(p.i)
    if (!ing) continue

    await prisma.groceryPrice.create({
      data: {
        country: 'MX',
        retailer: retailers['MX'][0],
        ingredient_id: ing.id,
        package_size: p.size,
        package_unit: p.unit,
        price: p.mx,
        currency: 'MXN',
        normalized_price_per_unit: p.mx / p.size,
        as_of: new Date(),
      }
    })

    await prisma.groceryPrice.create({
      data: {
        country: 'CO',
        retailer: retailers['CO'][0],
        ingredient_id: ing.id,
        package_size: p.size,
        package_unit: p.unit,
        price: p.co,
        currency: 'COP',
        normalized_price_per_unit: p.co / p.size,
        as_of: new Date(),
      }
    })
  }

  // 7. Recipes
  const recipes = [
    {
      name: 'Classic Burger', items: [
        { i: 'Burger Bun', q: 1, u: 'unit' },
        { i: 'Ground Beef', q: 150, u: 'g' },
        { i: 'Cheddar Cheese', q: 20, u: 'g' },
        { i: 'Tomato', q: 30, u: 'g' },
      ]
    },
    {
      name: 'Cheeseburger Combo', items: [
        { i: 'Burger Bun', q: 1, u: 'unit' },
        { i: 'Ground Beef', q: 150, u: 'g' },
        { i: 'Cheddar Cheese', q: 40, u: 'g' },
        { i: 'Coca Cola', q: 500, u: 'ml' },
      ]
    },
  ]

  for (const r of recipes) {
    const existing = await prisma.recipe.findFirst({ where: { name: r.name } })
    if (existing) {
        await prisma.recipeLine.deleteMany({ where: { recipe_id: existing.id }})
        await prisma.recipe.delete({ where: { id: existing.id }})
    }

    const recipe = await prisma.recipe.create({
      data: {
        name: r.name,
        menu_item: r.name,
        version: '1.0',
        target_cost_pct: 0.30,
      }
    })

    for (const item of r.items) {
      const ing = ingredientMap.get(item.i)
      if (ing) {
        await prisma.recipeLine.create({
          data: {
            recipe_id: recipe.id,
            ingredient_id: ing.id,
            quantity: item.q,
            unit: item.u
          }
        })
      }
    }
  }

  // 8. Competitor Prices
  await prisma.competitorPrice.deleteMany({})
  const compPrices = [
      { country: 'MX', brand: 'Burger King', menu_item: 'Whopper', price: 99.00, currency: 'MXN', as_of: new Date() },
      { country: 'MX', brand: 'McDonalds', menu_item: 'Big Mac', price: 109.00, currency: 'MXN', as_of: new Date() },
      { country: 'MX', brand: 'Carls Jr', menu_item: 'Famous Star', price: 115.00, currency: 'MXN', as_of: new Date() },

      { country: 'CO', brand: 'El Corral', menu_item: 'Corralisima', price: 25000.00, currency: 'COP', as_of: new Date() },
      { country: 'CO', brand: 'McDonalds', menu_item: 'Big Mac', price: 21000.00, currency: 'COP', as_of: new Date() },
      { country: 'CO', brand: 'Presto', menu_item: 'Super Presto', price: 19000.00, currency: 'COP', as_of: new Date() },
  ]
  for (const p of compPrices) {
      await prisma.competitorPrice.create({ data: p })
  }

  console.log('Seeding finished.')
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
