import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Database, Wifi, WifiOff } from 'lucide-react';
import { DustbinData } from '../types/dustbin';

interface FirebaseStatusProps {
  dustbins: DustbinData[];
}

export function FirebaseStatus({ dustbins }: FirebaseStatusProps) {
  // Check if we have real Firebase data by looking for specific patterns
  // Real Firebase data would have specific IDs or patterns
  const hasFirebaseData = dustbins.some(d => !d.id.startsWith('dustbin-'));
  const firebaseCount = dustbins.filter(d => !d.id.startsWith('dustbin-')).length;
  const mockCount = dustbins.filter(d => d.id.startsWith('dustbin-')).length;

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
              {hasFirebaseData ? (
                <Badge className="bg-green-500 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Using Mock Data
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {hasFirebaseData 
                ? `${firebaseCount} Firebase dustbin${firebaseCount > 1 ? 's' : ''} + ${mockCount} mock dustbin${mockCount > 1 ? 's' : ''} for simulation`
                : 'Update credentials in /firebase/config.ts to connect'
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
