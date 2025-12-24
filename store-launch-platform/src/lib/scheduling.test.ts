
import { calculateDate } from './scheduling'
import { addDays, addBusinessDays } from 'date-fns'
import assert from 'assert'

console.log('Running Scheduling Unit Tests...')

// Test 1: Standard Days
{
    const base = new Date('2025-01-01') // Wednesday
    const res = calculateDate(base, 5, 'STANDARD')
    const expected = addDays(base, 5) // 2025-01-06
    assert.deepStrictEqual(res, expected, 'Standard days failed')
    console.log('✓ Standard days passed')
}

// Test 2: Business Days (Wed + 2 = Fri)
{
    const base = new Date('2025-01-01') // Wednesday
    const res = calculateDate(base, 2, 'BUSINESS_DAYS_MON_FRI')
    const expected = new Date('2025-01-03') // Friday
    assert.deepStrictEqual(res, expected, 'Business days simple failed')
    console.log('✓ Business days simple passed')
}

// Test 3: Business Days (Fri + 1 = Mon)
{
    const base = new Date('2025-01-03') // Friday
    const res = calculateDate(base, 1, 'BUSINESS_DAYS_MON_FRI')
    const expected = new Date('2025-01-06') // Monday
    assert.deepStrictEqual(res, expected, 'Business days weekend skip failed')
    console.log('✓ Business days weekend skip passed')
}

console.log('All Unit Tests Passed!')
