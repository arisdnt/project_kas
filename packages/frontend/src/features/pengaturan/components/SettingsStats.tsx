import { Store, Server, Printer, Shield, DollarSign, Clock } from 'lucide-react'

interface StatCardProps {
  title: string
  count: number
  icon: React.ReactNode
  colorClass: string
}

function StatCard({ title, count, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`p-2 ${colorClass} rounded-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-lg font-semibold text-gray-900">{count} Item</p>
        </div>
      </div>
    </div>
  )
}

export function SettingsStats() {
  const statsData = [
    {
      title: "Info Toko",
      count: 4,
      icon: <Store className="h-5 w-5 text-green-600" />,
      colorClass: "bg-green-100"
    },
    {
      title: "Sistem",
      count: 4,
      icon: <Server className="h-5 w-5 text-blue-600" />,
      colorClass: "bg-blue-100"
    },
    {
      title: "Perangkat",
      count: 2,
      icon: <Printer className="h-5 w-5 text-purple-600" />,
      colorClass: "bg-purple-100"
    },
    {
      title: "Keamanan",
      count: 2,
      icon: <Shield className="h-5 w-5 text-orange-600" />,
      colorClass: "bg-orange-100"
    },
    {
      title: "Keuangan",
      count: 3,
      icon: <DollarSign className="h-5 w-5 text-yellow-600" />,
      colorClass: "bg-yellow-100"
    },
    {
      title: "Waktu",
      count: 1,
      icon: <Clock className="h-5 w-5 text-indigo-600" />,
      colorClass: "bg-indigo-100"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          count={stat.count}
          icon={stat.icon}
          colorClass={stat.colorClass}
        />
      ))}
    </div>
  )
}

export default SettingsStats