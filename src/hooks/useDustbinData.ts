import { useState, useEffect } from 'react';
import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../firebase/init';
import { DustbinData, HistoryEntry } from '../types/dustbin';

// Helper function to calculate status based on fill percentage
const calculateStatus = (fillPercentage: number): 'normal' | 'warning' | 'critical' => {
  if (fillPercentage >= 80) return 'critical';
  if (fillPercentage >= 60) return 'warning';
  return 'normal';
};

// Transform Firebase data to DustbinData format
const transformFirebaseData = (id: string, data: any): DustbinData | null => {
  try {
    if (!data) {
      return null;
    }

    // Get fill percentage from 'latest' field, or calculate from history
    let fillPercentage = 0;
    if (typeof data.latest === 'number') {
      fillPercentage = Math.max(0, Math.min(100, data.latest));
    } else if (data.history && typeof data.history === 'object') {
      // If no latest, get the most recent from history
      const historyKeys = Object.keys(data.history).map(Number).sort((a, b) => b - a);
      if (historyKeys.length > 0) {
        const latestTimestamp = historyKeys[0].toString();
        fillPercentage = Math.max(0, Math.min(100, data.history[latestTimestamp] || 0));
      }
    }

    // Transform history object to array format
    // History format: { "timestamp": percentage, ... }
    let history: HistoryEntry[] = [];
    if (data.history && typeof data.history === 'object') {
      history = Object.entries(data.history)
        .map(([timestamp, percentage]) => {
          let ts = parseInt(timestamp);
          // If timestamp is less than year 2000 in milliseconds, assume it's in seconds
          // Year 2000 in milliseconds = 946684800000
          if (ts < 946684800000) {
            ts = ts * 1000; // Convert seconds to milliseconds
          }
          return {
            timestamp: ts,
            fillPercentage: typeof percentage === 'number' ? Math.max(0, Math.min(100, percentage)) : 0
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp ascending
        .slice(-24); // Keep last 24 entries
    }

    // If no history entries, create one from latest
    if (history.length === 0 && fillPercentage > 0) {
      history = [{
        timestamp: Date.now(),
        fillPercentage
      }];
    }

    // Get last updated from most recent history entry or use current time
    const lastUpdated = history.length > 0 
      ? history[history.length - 1].timestamp 
      : Date.now();

    // Default coordinates (you can customize these based on your bins)
    const defaultCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'bin1': { lat: 18.5204, lng: 73.8567 }, // FC Road, Pune
      'bin2': { lat: 18.5304, lng: 73.8446 }, // Shivajinagar, Pune
      'bin3': { lat: 18.5362, lng: 73.8958 }, // Koregaon Park, Pune
    };

    const coordinates = data.coordinates || defaultCoordinates[id] || { lat: 18.5204, lng: 73.8567 };

    return {
      id: id,
      name: data.name || `Dustbin ${id.replace('bin', '')}`,
      location: data.location || getDefaultLocation(id),
      fillPercentage,
      coordinates: {
        lat: coordinates.lat || 0,
        lng: coordinates.lng || 0
      },
      lastUpdated,
      status: calculateStatus(fillPercentage),
      capacity: data.capacity || 100,
      history
    };
  } catch (err) {
    console.error(`Error transforming dustbin ${id}:`, err);
    return null;
  }
};

// Helper to get default location based on bin ID
const getDefaultLocation = (id: string): string => {
  const locations: { [key: string]: string } = {
    'bin1': 'FC Road, Pune',
    'bin2': 'Shivajinagar, Pune',
    'bin3': 'Koregaon Park, Pune',
  };
  return locations[id] || 'Pune, India';
};

export const useDustbinData = () => {
  const [dustbins, setDustbins] = useState<DustbinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Reference to the bins node in Firebase
    const binsRef = ref(database, 'bins');

    // Set up real-time listener
    const unsubscribe = onValue(
      binsRef,
      (snapshot: DataSnapshot) => {
        try {
          const data = snapshot.val();
          
          if (!data) {
            // No data in Firebase
            setDustbins([]);
            setLoading(false);
            setError('No dustbin data found in Firebase');
            return;
          }

          // Transform Firebase data to our format
          const transformedDustbins: DustbinData[] = [];
          
          Object.keys(data).forEach((key) => {
            const transformed = transformFirebaseData(key, data[key]);
            if (transformed) {
              transformedDustbins.push(transformed);
            }
          });

          if (transformedDustbins.length === 0) {
            setError('No valid dustbin data found in Firebase');
          } else {
            setError(null);
          }

          setDustbins(transformedDustbins);
          setLoading(false);
        } catch (err) {
          console.error('Error processing Firebase data:', err);
          setError(err instanceof Error ? err.message : 'Failed to process data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firebase error:', err);
        setError(err.message || 'Failed to connect to Firebase');
        setLoading(false);
        setDustbins([]);
      }
    );

    // Cleanup listener on unmount
    return () => {
      off(binsRef);
    };
  }, []);

  return { dustbins, loading, error };
};
