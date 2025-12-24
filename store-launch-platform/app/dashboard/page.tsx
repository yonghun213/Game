
import { PrismaClient } from '@/src/generated/client'

const prisma = new PrismaClient()

export default async function DashboardOverview() {
  const stores = await prisma.store.findMany({
    include: {
      tasks: {
        where: {
          status: 'NOT_STARTED' // Just a count example
        }
      }
    }
  })

  // Basic stats
  const totalStores = stores.length
  const activeStores = stores.filter(s => s.status !== 'OPEN' && s.status !== 'CANCELLED').length
  const storesByCountry = stores.reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Portfolio Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
           <h3 className="text-gray-500 text-sm font-medium">Total Stores</h3>
           <p className="text-3xl font-bold mt-2">{totalStores}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
           <h3 className="text-gray-500 text-sm font-medium">Active Launches</h3>
           <p className="text-3xl font-bold mt-2 text-blue-600">{activeStores}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
           <h3 className="text-gray-500 text-sm font-medium">Countries</h3>
           <p className="text-3xl font-bold mt-2">{Object.keys(storesByCountry).join(', ')}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Active Stores</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Open</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stores.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{s.country}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(s.planned_open_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${s.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      s.status === 'PLANNING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
