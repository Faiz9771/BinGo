import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Database, Wifi, WifiOff } from 'lucide-react';
import { DustbinData } from '../types/dustbin';

interface DataStatusProps {
  dustbins: DustbinData[];
}

export function DataStatus({ dustbins }: DataStatusProps) {
  // Since we're now using Firebase, all data should come from Firebase
  // If dustbins array is empty, it might mean no data or connection issue
  const isConnected = dustbins.length > 0;
  
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Firebase Connection</span>
              {isConnected ? (
                <Badge className="bg-green-500 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  No Data
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isConnected 
                ? `Connected to Firebase Realtime Database - ${dustbins.length} dustbin${dustbins.length > 1 ? 's' : ''} active`
                : 'No dustbin data available. Check Firebase connection.'
              }
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total Dustbins</div>
          <div className="text-2xl font-semibold text-blue-600">{dustbins.length}</div>
        </div>
      </div>
    </Card>
  );
}
