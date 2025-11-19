import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Info, AlertTriangle, AlertCircle, MapPin, TrendingUp } from 'lucide-react';

export function QuickGuide() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">Quick Guide</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Status Indicators</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">NORMAL (0-59%)</Badge>
            <Badge variant="warning">WARNING (60-79%)</Badge>
            <Badge variant="destructive">CRITICAL (80-100%)</Badge>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">How Route Optimization Works</h4>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>System prioritizes dustbins with highest fill percentage</li>
            <li>Dustbins above 60% fill level are collected first</li>
            <li>Route is optimized to minimize total distance traveled</li>
            <li>Real-time updates ensure efficient collection scheduling</li>
          </ol>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Key Features</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-gray-600">Real-time monitoring</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-gray-600">GPS tracking</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-gray-600">Alert system</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-gray-600">Historical analytics</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
