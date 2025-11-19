export interface DustbinData {
  id: string;
  name: string;
  location: string;
  fillPercentage: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  lastUpdated: number;
  status: 'normal' | 'warning' | 'critical';
  capacity: number; // in liters
  history: HistoryEntry[];
}

export interface HistoryEntry {
  timestamp: number;
  fillPercentage: number;
}

export interface RoutePoint {
  dustbinId: string;
  order: number;
  distance: number; // km from previous point
}
