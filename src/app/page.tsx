import Link from 'next/link'

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Dashboard</h1>
      
      {/* Grid displays up to 5 columns on extra large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
         
         <Link href="/attendance" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
           <h2 className="text-lg font-bold text-gray-800 mb-2">Daily Attendance &rarr;</h2>
           <p className="text-gray-600 text-sm">Quickly mark Present, Half Day, or Absent for the current date.</p>
         </Link>
         
         <Link href="/weekly-review" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
           <h2 className="text-lg font-bold text-gray-800 mb-2">Weekly Review &rarr;</h2>
           <p className="text-gray-600 text-sm">Review 7-day grid trends, override days, and lock the week securely.</p>
         </Link>

         <Link href="/employees" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
           <h2 className="text-lg font-bold text-gray-800 mb-2">Employees &rarr;</h2>
           <p className="text-gray-600 text-sm">Manage staff profiles, daily salaries, and organizational categories.</p>
         </Link>

         <Link href="/categories" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
           <h2 className="text-lg font-bold text-gray-800 mb-2">Categories &rarr;</h2>
           <p className="text-gray-600 text-sm">Configure organizational roles and structural employee groupings.</p>
         </Link>

         <Link href="/reports" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
           <h2 className="text-lg font-bold text-gray-800 mb-2">Reports & PDFs &rarr;</h2>
           <p className="text-gray-600 text-sm">Generate custom date-range payroll calculations and export PDFs.</p>
         </Link>
         
      </div>
    </div>
  )
}