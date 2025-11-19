import { DustbinData } from '../types/dustbin';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Trash2, MapPin, Clock } from 'lucide-react';

interface DustbinCardProps {
  dustbin: DustbinData;
}

export function DustbinCard({ dustbin }: DustbinCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${
            dustbin.status === 'critical' ? 'bg-red-100' :
            dustbin.status === 'warning' ? 'bg-yellow-100' :
            'bg-green-100'
          }`}>
            <Trash2 className={`w-5 h-5 ${
              dustbin.status === 'critical' ? 'text-red-600' :
              dustbin.status === 'warning' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold">{dustbin.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin className="w-3 h-3" />
              <span>{dustbin.location}</span>
            </div>
          </div>
        </div>
        <Badge variant={getStatusColor(dustbin.status)}>
          {dustbin.status.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Fill Level</span>
            <span className="font-semibold">{dustbin.fillPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={dustbin.fillPercentage} className="h-2" indicatorClassName={getProgressColor(dustbin.fillPercentage)} />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Updated {formatTime(dustbin.lastUpdated)}</span>
        </div>

        <div className="pt-2 border-t text-sm text-gray-600">
          Capacity: {dustbin.capacity}L
        </div>
      </div>
    </Card>
  );
}
