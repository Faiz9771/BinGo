import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DustbinData } from '../types/dustbin';
import { Card } from './ui/card';
import { Map, Satellite } from 'lucide-react';
import { Button } from './ui/button';

interface RouteSegment {
  distance: number;
  duration: number;
  geometry: [number, number][];
  instructions?: string[];
}

interface RouteMapProps {
  route: DustbinData[];
  currentStep: number;
  roadRoutes?: RouteSegment[];
  loadingRoutes?: boolean;
}

// Default center for Pune city
const defaultCenter: [number, number] = [18.5204, 73.8567];

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, number: number, size: number = 25) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.5}px;
      ">${number}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to fit map bounds
function FitBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

export function RouteMap({ route, currentStep, roadRoutes = [], loadingRoutes = false }: RouteMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Validate route data
  if (!route || !Array.isArray(route) || route.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-gray-500">
          <p>No route data available</p>
        </div>
      </Card>
    );
  }

  // Error boundary for map
  if (mapError) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-red-600">
          <p>Error loading map: {mapError}</p>
          <Button onClick={() => setMapError(null)} className="mt-4">Retry</Button>
        </div>
      </Card>
    );
  }

  // Calculate map center and bounds
  const { center, bounds } = useMemo(() => {
    if (route.length === 0) {
      return { center: defaultCenter, bounds: null };
    }

    // Include all route points (both dustbin locations and road geometry)
    const allPoints: [number, number][] = route.map(d => [d.coordinates.lat, d.coordinates.lng]);
    roadRoutes.forEach(roadRoute => {
      allPoints.push(...roadRoute.geometry);
    });

    const lats = allPoints.map(p => p[0]);
    const lngs = allPoints.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Center point
    const center: [number, number] = [
      (minLat + maxLat) / 2,
      (minLng + maxLng) / 2
    ];

    // Bounds for fitBounds
    const bounds = new L.LatLngBounds(
      [minLat - 0.01, minLng - 0.01],
      [maxLat + 0.01, maxLng + 0.01]
    );

    return { center, bounds };
  }, [route, roadRoutes]);

  // Create path for polyline - use road routes if available, otherwise straight lines
  const getPathForSegment = (index: number): [number, number][] => {
    try {
      if (index === 0) {
        if (!route[0] || !route[0].coordinates) return [];
        return [[route[0].coordinates.lat, route[0].coordinates.lng]];
      }
      
      if (!route[index - 1] || !route[index] || !route[index - 1].coordinates || !route[index].coordinates) {
        return [];
      }
      
      // Use road route geometry if available
      if (roadRoutes[index - 1] && roadRoutes[index - 1].geometry && roadRoutes[index - 1].geometry.length > 0) {
        return roadRoutes[index - 1].geometry;
      }
      
      // Fallback to straight line
      return [
        [route[index - 1].coordinates.lat, route[index - 1].coordinates.lng],
        [route[index].coordinates.lat, route[index].coordinates.lng]
      ];
    } catch (error) {
      console.error('Error getting path for segment:', error);
      return [];
    }
  };

  // Get marker color based on status
  const getMarkerColor = (index: number): string => {
    if (index < currentStep) return '#10b981'; // Green - completed
    if (index === currentStep) return '#f59e0b'; // Orange - current
    return '#3b82f6'; // Blue - pending
  };

  // Tile layer URLs
  const tileLayers = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    roadmap: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Satellite className="w-5 h-5" />
            Route Visualization - Pune City (Satellite View)
          </h3>
          <p className="text-sm text-gray-500">
            {loadingRoutes ? 'Loading road routes...' : roadRoutes.length > 0 ? 'Real road-based navigation' : 'Free satellite map with optimized collection route'}
          </p>
      </div>
        <div className="flex gap-2">
          <Button
            variant={mapType === 'roadmap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapType('roadmap')}
          >
            <Map className="w-4 h-4 mr-2" />
            Map
          </Button>
          <Button
            variant={mapType === 'satellite' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapType('satellite')}
          >
            <Satellite className="w-4 h-4 mr-2" />
            Satellite
          </Button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border" style={{ height: '500px' }}>
        <MapContainer
          center={center}
          zoom={route.length > 0 ? 13 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          key={`map-${route.length}-${currentStep}`}
        >
          <FitBounds bounds={bounds} />
          
          {/* Tile Layer - Satellite or Roadmap */}
          <TileLayer
            attribution={mapType === 'satellite' 
              ? '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.esri.com/">Esri</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
            url={tileLayers[mapType]}
          />

          {/* Route Polylines - Use actual road routes if available */}
          {route.length > 1 && (
            <>
              {/* Completed route segments (green) */}
              {currentStep > 0 && (
                <>
                  {Array.from({ length: currentStep }, (_, i) => {
                    const path = getPathForSegment(i + 1);
                    return (
                      <Polyline
                        key={`completed-${i}`}
                        positions={path}
                        pathOptions={{
                          color: '#10b981',
                          weight: 5,
                          opacity: 0.8
                        }}
                      />
                    );
                  })}
                </>
              )}
              
              {/* Remaining route segments (blue) */}
              {currentStep < route.length && (
                <>
                  {Array.from({ length: route.length - currentStep }, (_, i) => {
                    const segmentIndex = currentStep + i;
                    const path = getPathForSegment(segmentIndex + 1);
                    return (
            <Polyline
                        key={`remaining-${segmentIndex}`}
                        positions={path}
                        pathOptions={{
                          color: '#3b82f6',
                          weight: 4,
                          opacity: 0.6
                        }}
                      />
                    );
                  })}
                </>
              )}
              
              {/* Direction arrows on remaining route */}
              {currentStep < route.length - 1 && roadRoutes.length > currentStep && (
                <>
                  {roadRoutes.slice(currentStep).flatMap((roadRoute, routeIdx) => {
                    const segmentIndex = currentStep + routeIdx;
                    const path = getPathForSegment(segmentIndex + 1);
                    
                    // Add arrows every 5th point
                    const arrows: JSX.Element[] = [];
                    for (let idx = 5; idx < path.length - 1; idx += 5) {
                      const point = path[idx];
                      const prevPoint = path[idx - 1];
                      
                      // Calculate bearing
                      const lat1 = prevPoint[0] * Math.PI / 180;
                      const lat2 = point[0] * Math.PI / 180;
                      const dLng = (point[1] - prevPoint[1]) * Math.PI / 180;
                      const y = Math.sin(dLng) * Math.cos(lat2);
                      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
                      const bearing = Math.atan2(y, x) * 180 / Math.PI;
                      
                      arrows.push(
                        <Marker
                          key={`arrow-${segmentIndex}-${idx}`}
                          position={point}
                          icon={L.divIcon({
                            className: 'route-arrow',
                            html: `<div style="
                              transform: rotate(${bearing}deg);
                              font-size: 16px;
                              color: #3b82f6;
                              text-shadow: 1px 1px 2px white;
                            ">➤</div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                          })}
                        />
                      );
                    }
                    return arrows;
                  })}
                </>
              )}
            </>
          )}

          {/* Markers */}
          {route.map((dustbin, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const markerSize = isCurrent ? 30 : 25;
            const position: [number, number] = [dustbin.coordinates.lat, dustbin.coordinates.lng];
            
            return (
              <Marker
                key={dustbin.id}
                position={position}
                icon={createCustomIcon(getMarkerColor(index), index + 1, markerSize)}
                eventHandlers={{
                  click: () => setSelectedMarker(selectedMarker === index ? null : index)
                }}
              >
                {selectedMarker === index && (
                  <Popup onClose={() => setSelectedMarker(null)}>
                    <div className="p-2 min-w-[200px]">
                      <div className="font-semibold text-sm mb-1">{dustbin.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{dustbin.location}</div>
                      <div className="text-xs mb-1">
                        <span className="font-medium">Fill Level: </span>
                        <span className={dustbin.fillPercentage >= 80 ? 'text-red-600' : 
                                         dustbin.fillPercentage >= 60 ? 'text-yellow-600' : 
                                         'text-green-600'}>
                          {dustbin.fillPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs mb-1">
                        <span className="font-medium">Status: </span>
                        <span className={
                          dustbin.status === 'critical' ? 'text-red-600' :
                          dustbin.status === 'warning' ? 'text-yellow-600' :
                          'text-green-600'
                        }>
                          {dustbin.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        Stop #{index + 1} of {route.length}
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
      </div>
    </Card>
  );
}
