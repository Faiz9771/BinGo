import { Card } from './ui/card';
import { MapPin } from 'lucide-react';

export function LocationInfo() {
  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500 rounded-lg">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium">Service Area</h3>
          <p className="text-sm text-gray-600 mt-1">
            Pune Municipal Corporation - Smart Waste Management System
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {['FC Road', 'Koregaon Park', 'Shivajinagar', 'Kothrud', 'Baner', 'Hadapsar', 'Wakad', 'Viman Nagar'].map(area => (
              <span key={area} className="text-xs bg-white px-2 py-1 rounded border border-purple-200">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
