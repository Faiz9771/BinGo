import { DustbinData } from '../types/dustbin';
import { Card } from './ui/card';
import { Trash2, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface DashboardStatsProps {
  dustbins: DustbinData[];
}

export function DashboardStats({ dustbins }: DashboardStatsProps) {
  const totalDustbins = dustbins.length;
  const criticalDustbins = dustbins.filter(d => d.status === 'critical').length;
  const warningDustbins = dustbins.filter(d => d.status === 'warning').length;
  const avgFillPercentage = dustbins.length > 0
    ? dustbins.reduce((sum, d) => sum + d.fillPercentage, 0) / dustbins.length
    : 0;

  const stats = [
    {
      title: 'Total Dustbins',
      value: totalDustbins,
      icon: Trash2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Critical Level',
      value: criticalDustbins,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Warning Level',
      value: warningDustbins,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Avg Fill Level',
      value: `${avgFillPercentage.toFixed(1)}%`,
      icon: Activity,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
