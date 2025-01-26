'use client';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to your admin dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        {['Total Orders', 'Total Sales', 'Active Users', 'Products'].map((title) => (
          <div key={title} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold mt-2">0</p>
            <div className="mt-2 text-sm text-gray-600">No data available</div>
          </div>
        ))}
      </div>
    </div>
  );
}