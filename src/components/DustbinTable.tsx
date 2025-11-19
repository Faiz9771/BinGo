import { DustbinData } from '../types/dustbin';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { MapPin, Clock } from 'lucide-react';

interface DustbinTableProps {
  dustbins: DustbinData[];
}

export function DustbinTable({ dustbins }: DustbinTableProps) {
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

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const sortedDustbins = [...dustbins].sort((a, b) => b.fillPercentage - a.fillPercentage);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">All Dustbins Overview</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Fill Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Capacity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDustbins.map((dustbin) => (
            <TableRow key={dustbin.id}>
              <TableCell className="font-medium">{dustbin.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {dustbin.location}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2 min-w-[150px]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {dustbin.fillPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={dustbin.fillPercentage} 
                    className="h-2"
                    indicatorClassName={
                      dustbin.fillPercentage >= 80 ? 'bg-red-500' :
                      dustbin.fillPercentage >= 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(dustbin.status)}>
                  {dustbin.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  {formatTime(dustbin.lastUpdated)}
                </div>
              </TableCell>
              <TableCell className="text-sm">{dustbin.capacity}L</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
