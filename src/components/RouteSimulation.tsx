import { useState, useEffect } from 'react';
import { DustbinData } from '../types/dustbin';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, RotateCcw, Navigation, TrendingUp, MapPin, ArrowRight, Compass, Clock, Trash2, Package } from 'lucide-react';
import { Progress } from './ui/progress';
import { RouteMap } from './RouteMap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface RouteSimulationProps {
  dustbins: DustbinData[];
}

interface RouteSegment {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: [number, number][]; // road coordinates
  instructions?: string[];
}

export function RouteSimulation({ dustbins }: RouteSimulationProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<DustbinData[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBinCount, setSelectedBinCount] = useState<string>('5');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showNavigation, setShowNavigation] = useState(false);
  const [roadRoutes, setRoadRoutes] = useState<RouteSegment[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Initialize default locations when component mounts or bin count changes
  useEffect(() => {
    const count = parseInt(selectedBinCount) || 5;
    if (selectedLocations.length === 0 || selectedLocations.length !== count) {
      const defaultLocations = [
        'fc-road', 'shivajinagar', 'koregaon-park', 'kothrud', 'baner',
        'hadapsar', 'wakad', 'viman-nagar', 'hinjewadi', 'aundh'
      ].slice(0, count);
      setSelectedLocations(defaultLocations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBinCount]);

  // Haversine formula to calculate distance between two coordinates
  const haversineDistance = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate total route cost (distance + priority penalty)
  const calculateRouteCost = (route: DustbinData[]): number => {
    if (route.length <= 1) return 0;
    
    let totalDistance = 0;
    let priorityPenalty = 0;
    
    for (let i = 0; i < route.length; i++) {
      if (i > 0) {
        totalDistance += haversineDistance(route[i - 1].coordinates, route[i].coordinates);
      }
      // Priority penalty: higher fill % visited later = higher penalty
      // This encourages visiting urgent bins earlier
      const priorityWeight = (route[i].fillPercentage / 100) * (i + 1);
      priorityPenalty += priorityWeight;
    }
    
    // Combine distance and priority (distance in km, priority is normalized)
    return totalDistance + (priorityPenalty * 0.1); // Weight priority penalty
  };

  // 2-opt improvement: Swap edges to reduce route cost
  const twoOptImprovement = (route: DustbinData[]): DustbinData[] => {
    if (route.length <= 2) return route;
    
    let improved = true;
    let bestRoute = [...route];
    let bestCost = calculateRouteCost(bestRoute);
    let iterations = 0;
    const maxIterations = 100; // Prevent infinite loops
    
    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      
      for (let i = 1; i < route.length - 1; i++) {
        for (let j = i + 1; j < route.length; j++) {
          // Create new route by reversing segment between i and j
          const newRoute = [
            ...bestRoute.slice(0, i),
            ...bestRoute.slice(i, j + 1).reverse(),
            ...bestRoute.slice(j + 1)
          ];
          
          const newCost = calculateRouteCost(newRoute);
          
          if (newCost < bestCost) {
            bestRoute = newRoute;
            bestCost = newCost;
            improved = true;
            break; // Restart from beginning after improvement
          }
        }
        if (improved) break;
      }
    }
    
    return bestRoute;
  };

  // Simulated Annealing for further optimization
  const simulatedAnnealing = (route: DustbinData[], initialTemp: number = 100, coolingRate: number = 0.95): DustbinData[] => {
    if (route.length <= 2) return route;
    
    let currentRoute = [...route];
    let bestRoute = [...route];
    let currentCost = calculateRouteCost(currentRoute);
    let bestCost = currentCost;
    let temperature = initialTemp;
    const minTemp = 0.1;
    const maxIterations = 200;
    let iterations = 0;
    
    while (temperature > minTemp && iterations < maxIterations) {
      iterations++;
      
      // Generate neighbor by swapping two random positions
      const i = Math.floor(Math.random() * (currentRoute.length - 1)) + 1;
      const j = Math.floor(Math.random() * (currentRoute.length - i)) + i;
      
      // Swap positions
      const newRoute = [...currentRoute];
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      
      const newCost = calculateRouteCost(newRoute);
      const delta = newCost - currentCost;
      
      // Accept if better, or accept worse with probability (simulated annealing)
      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        currentRoute = newRoute;
        currentCost = newCost;
        
        if (currentCost < bestCost) {
          bestRoute = currentRoute;
          bestCost = currentCost;
        }
      }
      
      // Cool down
      temperature *= coolingRate;
    }
    
    return bestRoute;
  };

  // Pune locations available for selection
  const puneLocations = [
    { id: 'fc-road', name: 'FC Road', location: 'FC Road, Pune', lat: 18.5204, lng: 73.8567 },
    { id: 'shivajinagar', name: 'Shivajinagar', location: 'Shivajinagar, Pune', lat: 18.5304, lng: 73.8446 },
    { id: 'koregaon-park', name: 'Koregaon Park', location: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8958 },
    { id: 'kothrud', name: 'Kothrud', location: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
    { id: 'baner', name: 'Baner', location: 'Baner, Pune', lat: 18.5598, lng: 73.7775 },
    { id: 'hadapsar', name: 'Hadapsar', location: 'Hadapsar, Pune', lat: 18.5089, lng: 73.9260 },
    { id: 'wakad', name: 'Wakad', location: 'Wakad, Pune', lat: 18.5975, lng: 73.7649 },
    { id: 'viman-nagar', name: 'Viman Nagar', location: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143 },
    { id: 'hinjewadi', name: 'Hinjewadi', location: 'Hinjewadi, Pune', lat: 18.5916, lng: 73.7309 },
    { id: 'aundh', name: 'Aundh', location: 'Aundh, Pune', lat: 18.5642, lng: 73.8069 },
  ];

  // Generate dummy dustbins for simulation based on selected locations
  const generateDummyDustbins = (count: number, locationIds: string[]): DustbinData[] => {
    // Use selected locations or default to first N locations
    const locationsToUse = locationIds.length > 0 
      ? locationIds.map(id => puneLocations.find(loc => loc.id === id)).filter(Boolean) as typeof puneLocations
      : puneLocations.slice(0, count);

    const dummyBins: DustbinData[] = [];
    for (let i = 0; i < count; i++) {
      const loc = locationsToUse[i % locationsToUse.length];
      if (!loc) continue;
      
      const fillPercentage = Math.random() * 100;
      const now = Date.now();
      
      dummyBins.push({
        id: `dummy-${i + 1}`,
        name: `${loc.name} Dustbin ${i + 1}`,
        location: loc.location,
        fillPercentage: Math.round(fillPercentage * 10) / 10,
        coordinates: { lat: loc.lat + (Math.random() - 0.5) * 0.01, lng: loc.lng + (Math.random() - 0.5) * 0.01 },
        lastUpdated: now,
        status: fillPercentage >= 80 ? 'critical' : fillPercentage >= 60 ? 'warning' : 'normal',
        capacity: 100,
        history: [
          { timestamp: now - 3600000, fillPercentage: Math.max(0, fillPercentage - 10) },
          { timestamp: now - 1800000, fillPercentage: Math.max(0, fillPercentage - 5) },
          { timestamp: now, fillPercentage }
        ]
      });
    }
    return dummyBins;
  };

  const calculateOptimizedRoute = () => {
    // Always use dummy dustbins for simulation
    let binsToRoute: DustbinData[] = [];
    
    // Determine how many dummy bins to generate
    const dummyCount = parseInt(selectedBinCount) || 5;
    
    // Generate dummy dustbins for simulation based on selected locations
    binsToRoute = generateDummyDustbins(dummyCount, selectedLocations);
    
    if (binsToRoute.length === 0) return [];
    if (binsToRoute.length === 1) return binsToRoute;
    
    // Advanced Route Optimization Algorithm:
    // Phase 1: Priority-weighted Nearest Neighbor (initial solution)
    // Phase 2: 2-opt improvement (local optimization)
    // Phase 3: Simulated Annealing (global optimization for larger sets)
    
    const route: DustbinData[] = [];
    const unvisited = [...binsToRoute];
    
    // Phase 1: Start with the bin with highest fill percentage
    unvisited.sort((a, b) => b.fillPercentage - a.fillPercentage);
    const startBin = unvisited.shift()!;
    route.push(startBin);
    
    let currentBin = startBin;
    
    // Phase 1: Nearest Neighbor with Priority Weighting
    while (unvisited.length > 0) {
      let bestNext: DustbinData | null = null;
      let bestScore = -Infinity;
      
      for (const candidate of unvisited) {
        const distance = haversineDistance(currentBin.coordinates, candidate.coordinates);
        // Enhanced scoring: balances urgency and distance
        const priorityWeight = 2.5; // Increased weight for urgency
        const urgencyScore = candidate.fillPercentage * priorityWeight;
        const distancePenalty = distance * 0.5; // Distance penalty
        const score = urgencyScore / (distancePenalty + 0.1);
        
        if (score > bestScore) {
          bestScore = score;
          bestNext = candidate;
        }
      }
      
      if (bestNext) {
        route.push(bestNext);
        currentBin = bestNext;
        const index = unvisited.indexOf(bestNext);
        unvisited.splice(index, 1);
      }
    }
    
    // Phase 2: 2-opt improvement (always run for route refinement)
    let optimizedRoute = twoOptImprovement(route);
    
    // Phase 3: Simulated Annealing (for routes with 4+ bins)
    if (optimizedRoute.length >= 4) {
      optimizedRoute = simulatedAnnealing(optimizedRoute, 50, 0.92);
    }
    
    return optimizedRoute;
  };

  const startSimulation = () => {
    try {
      const route = calculateOptimizedRoute();
      if (route.length === 0) {
        console.error('No route generated');
        return;
      }
      setOptimizedRoute(route);
      setIsSimulating(true);
      setCurrentStep(0);
      setRoadRoutes([]); // Reset road routes
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Error starting simulation. Please check console for details.');
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isSimulating && currentStep < optimizedRoute.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentStep >= optimizedRoute.length && optimizedRoute.length > 0) {
      setIsSimulating(false);
    }
  }, [isSimulating, currentStep, optimizedRoute.length]);

  // Auto-scroll navigation to current step
  useEffect(() => {
    if (showNavigation && currentStep > 0) {
      const element = document.getElementById(`nav-step-${currentStep}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, showNavigation]);

  // Fetch actual road route from OSRM (Open Source Routing Machine)
  const fetchRoadRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<RouteSegment | null> => {
    try {
      // OSRM API endpoint (free, no API key needed)
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Route fetch failed');
      
      const data = await response.json();
      
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        return null;
      }
      
      const route = data.routes[0];
      const geometry = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]); // Convert [lng, lat] to [lat, lng]
      
      // Extract instructions from steps
      const instructions: string[] = [];
      if (route.legs && route.legs[0] && route.legs[0].steps) {
        route.legs[0].steps.forEach((step: any) => {
          if (step.maneuver && step.maneuver.instruction) {
            instructions.push(step.maneuver.instruction);
          }
        });
      }
      
      return {
        distance: route.distance / 1000, // Convert meters to km
        duration: route.duration / 60, // Convert seconds to minutes
        geometry,
        instructions
      };
    } catch (error) {
      console.error('Error fetching road route:', error);
      // Fallback to straight-line distance
      const distance = haversineDistance(from, to);
      return {
        distance,
        duration: (distance / 30) * 60, // Assume 30 km/h
        geometry: [[from.lat, from.lng], [to.lat, to.lng]],
        instructions: []
      };
    }
  };

  // Fetch all road routes for the optimized route
  useEffect(() => {
    const fetchAllRoutes = async () => {
      if (optimizedRoute.length < 2) {
        setRoadRoutes([]);
        return;
      }
      
      try {
        setLoadingRoutes(true);
        const routes: RouteSegment[] = [];
        
        for (let i = 0; i < optimizedRoute.length - 1; i++) {
          try {
            const from = optimizedRoute[i].coordinates;
            const to = optimizedRoute[i + 1].coordinates;
            const route = await fetchRoadRoute(from, to);
            if (route) {
              routes.push(route);
            } else {
              // Fallback if route is null
              const distance = haversineDistance(from, to);
              routes.push({
                distance,
                duration: (distance / 30) * 60,
                geometry: [
                  [from.lat, from.lng],
                  [to.lat, to.lng]
                ],
                instructions: []
              });
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error fetching route segment ${i}:`, error);
            // Continue with fallback for this segment
            const from = optimizedRoute[i].coordinates;
            const to = optimizedRoute[i + 1].coordinates;
            const distance = haversineDistance(from, to);
            routes.push({
              distance,
              duration: (distance / 30) * 60,
              geometry: [
                [from.lat, from.lng],
                [to.lat, to.lng]
              ],
              instructions: []
            });
          }
        }
        
        setRoadRoutes(routes);
      } catch (error) {
        console.error('Error fetching routes:', error);
        setRoadRoutes([]);
      } finally {
        setLoadingRoutes(false);
      }
    };
    
    if (optimizedRoute.length > 0) {
      fetchAllRoutes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimizedRoute.length]);

  const calculateDistance = (index: number) => {
    if (index === 0) return 0;
    // Use actual road distance if available, otherwise fallback to straight-line
    if (roadRoutes[index - 1]) {
      return roadRoutes[index - 1].distance;
    }
    const prev = optimizedRoute[index - 1];
    const curr = optimizedRoute[index];
    return haversineDistance(prev.coordinates, curr.coordinates);
  };

  const calculateRoadDuration = (index: number): number => {
    if (index === 0) return 0;
    if (roadRoutes[index - 1]) {
      return roadRoutes[index - 1].duration; // in minutes
    }
    // Fallback: estimate from distance
    const distance = calculateDistance(index);
    return (distance / 30) * 60; // Assume 30 km/h
  };

  // Calculate bearing from road route geometry (more accurate)
  const calculateBearing = (index: number): number => {
    if (index === 0) return 0;
    const route = roadRoutes[index - 1];
    if (route && route.geometry.length >= 2) {
      // Use first segment of road route for bearing
      const from = route.geometry[0];
      const to = route.geometry[Math.min(5, route.geometry.length - 1)]; // Use a point a bit ahead
      
      const lat1 = from[0] * Math.PI / 180;
      const lat2 = to[0] * Math.PI / 180;
      const dLng = (to[1] - from[1]) * Math.PI / 180;
      
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      
      const bearing = Math.atan2(y, x) * 180 / Math.PI;
      return (bearing + 360) % 360;
    }
    // Fallback to straight-line bearing
    const prev = optimizedRoute[index - 1];
    const curr = optimizedRoute[index];
    const lat1 = prev.coordinates.lat * Math.PI / 180;
    const lat2 = curr.coordinates.lat * Math.PI / 180;
    const dLng = (curr.coordinates.lng - prev.coordinates.lng) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Get direction name from bearing
  const getDirection = (bearing: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  // Calculate estimated time from road route or distance
  const calculateTime = (index: number): string => {
    if (index === 0) return '0 min';
    const duration = calculateRoadDuration(index);
    if (duration < 60) {
      return `${Math.round(duration)} min`;
    }
    const h = Math.floor(duration / 60);
    const m = Math.round(duration % 60);
    return `${h}h ${m}m`;
  };

  const totalDistance = optimizedRoute.reduce((sum, _, idx) => sum + calculateDistance(idx), 0);
  const totalDuration = roadRoutes.reduce((sum, route) => sum + route.duration, 0) || (totalDistance / 30) * 60;
  const totalTime = totalDuration < 60 
    ? `${Math.round(totalDuration)} min`
    : `${Math.floor(totalDuration / 60)}h ${Math.round(totalDuration % 60)}m`;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Route Optimization Simulation
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Advanced: Priority-weighted NN + 2-opt + Simulated Annealing
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={startSimulation} 
              disabled={isSimulating}
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
            <Button 
              onClick={resetSimulation} 
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Bin Selection */}
        <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-800 block">
                    Number of Dustbins
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose how many dustbins to include in the route
                  </p>
                </div>
              </div>
              <Select value={selectedBinCount} onValueChange={(value) => {
                setSelectedBinCount(value);
                // Auto-select locations if not enough selected
                const count = parseInt(value) || 5;
                if (selectedLocations.length < count) {
                  const defaultLocations = puneLocations.slice(0, count).map(loc => loc.id);
                  setSelectedLocations(defaultLocations);
                }
              }} disabled={isSimulating}>
                <SelectTrigger className="w-full h-12 bg-white border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 shadow-sm transition-all">
                  <div className="flex items-center gap-2 w-full">
                    <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <SelectValue placeholder="Select bin count" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem 
                      key={num} 
                      value={num.toString()}
                      className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedBinCount === num.toString() 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {num}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{num} Dustbins</div>
                          <div className="text-xs text-gray-500">
                            {num === 2 ? 'Small route' : 
                             num <= 5 ? 'Medium route' : 
                             num <= 8 ? 'Large route' : 'Extended route'}
                          </div>
                        </div>
                        {selectedBinCount === num.toString() && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm min-w-[180px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="font-semibold text-gray-800">Simulation Mode</div>
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Using dummy dustbins for route simulation and testing
              </div>
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Locations for Dustbins ({selectedLocations.length} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-white">
              {puneLocations.map((loc) => {
                const isSelected = selectedLocations.includes(loc.id);
                const maxSelected = parseInt(selectedBinCount) || 5;
                const canSelect = isSelected || selectedLocations.length < maxSelected;
                
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLocations(selectedLocations.filter(id => id !== loc.id));
                      } else if (canSelect) {
                        setSelectedLocations([...selectedLocations, loc.id]);
                      }
                    }}
                    disabled={!canSelect || isSimulating}
                    className={`p-2 text-xs rounded border transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-600'
                        : canSelect
                        ? 'bg-white hover:bg-gray-50 border-gray-300'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">{loc.name}</div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                      {loc.location.split(',')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedLocations.length < parseInt(selectedBinCount || '5') && (
              <p className="text-xs text-yellow-600 mt-2">
                Select {parseInt(selectedBinCount || '5') - selectedLocations.length} more location(s)
              </p>
            )}
            {selectedLocations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs text-gray-600">Selected:</span>
                {selectedLocations.map((locId, idx) => {
                  const loc = puneLocations.find(l => l.id === locId);
                  return loc ? (
                    <span key={locId} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {loc.name}
                      <button
                        type="button"
                        onClick={() => setSelectedLocations(selectedLocations.filter(id => id !== locId))}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        disabled={isSimulating}
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

      {optimizedRoute.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <div className="text-sm text-gray-600">Total Stops</div>
              <div className="text-2xl font-semibold">{optimizedRoute.length}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                Total Distance
                {loadingRoutes && <span className="text-xs text-blue-600">(Loading routes...)</span>}
                {!loadingRoutes && roadRoutes.length > 0 && <span className="text-xs text-green-600">(Road-based)</span>}
              </div>
              <div className="text-2xl font-semibold">{totalDistance.toFixed(2)} km</div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Est. Time
              </div>
              <div className="text-2xl font-semibold">{totalTime}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Avg Fill Level</div>
              <div className="text-2xl font-semibold">
                {(optimizedRoute.reduce((sum, d) => sum + d.fillPercentage, 0) / optimizedRoute.length).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Navigation Toggle */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNavigation(!showNavigation)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              {showNavigation ? 'Hide' : 'Show'} Navigation
            </Button>
          </div>

          {isSimulating && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span>Progress</span>
                <span>{currentStep} / {optimizedRoute.length} stops</span>
              </div>
              <Progress value={(currentStep / optimizedRoute.length) * 100} className="h-2" />
            </div>
          )}

          {/* Navigation View */}
          {showNavigation && optimizedRoute.length > 0 && (
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Turn-by-Turn Navigation</h4>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto" id="navigation-scroll">
                {optimizedRoute.map((dustbin, index) => {
                  const isCurrent = index === currentStep;
                  const isCompleted = index < currentStep;
                  const distance = calculateDistance(index);
                  const bearing = calculateBearing(index);
                  const direction = index > 0 ? getDirection(bearing) : 'Start';
                  const time = calculateTime(index);
                  const routeSegment = index > 0 ? roadRoutes[index - 1] : null;

                  return (
                    <div
                      id={`nav-step-${index}`}
                      key={dustbin.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-green-50 border-green-300'
                          : isCurrent
                          ? 'bg-blue-100 border-blue-400 shadow-md ring-2 ring-blue-500'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{dustbin.name}</span>
                            {isCurrent && (
                              <Badge variant="default" className="bg-blue-500 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{dustbin.location}</div>
                          {index > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <Compass className="w-3 h-3" />
                                  <span>Head {direction} ({bearing.toFixed(0)}°)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ArrowRight className="w-3 h-3" />
                                  <span>{distance.toFixed(2)} km {routeSegment ? '(Road)' : '(Straight)'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{time}</span>
                                </div>
                              </div>
                              {routeSegment && routeSegment.instructions && routeSegment.instructions.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1 pl-4 border-l-2 border-blue-300">
                                  <div className="font-medium mb-1">Turn-by-Turn:</div>
                                  <div className="space-y-1">
                                    {routeSegment.instructions.slice(0, 3).map((instruction, idx) => (
                                      <div key={idx}>• {instruction}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {index === 0 && (
                            <div className="text-xs text-blue-600 font-medium">Starting Point</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Fill Level</div>
                          <div className={`font-semibold ${
                            dustbin.fillPercentage >= 80 ? 'text-red-600' :
                            dustbin.fillPercentage >= 60 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {dustbin.fillPercentage.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Route List View */}
          <Tabs defaultValue="list" className="mt-4">
            <TabsList>
              <TabsTrigger value="list">Route List</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              <div className="space-y-3">
                {optimizedRoute.map((dustbin, index) => (
                  <div
                    key={dustbin.id}
                    className={`p-4 border rounded-lg transition-all ${
                      currentStep > index 
                        ? 'bg-green-50 border-green-300' 
                        : currentStep === index
                        ? 'bg-blue-50 border-blue-400 shadow-md'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep > index 
                            ? 'bg-green-500 text-white' 
                            : currentStep === index
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{dustbin.name}</div>
                          <div className="text-sm text-gray-500">{dustbin.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Fill Level</div>
                          <div className="font-semibold flex items-center gap-2">
                            {dustbin.fillPercentage.toFixed(0)}%
                            {dustbin.fillPercentage >= 80 && (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        {index > 0 && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Distance</div>
                            <div className="font-semibold">
                              {calculateDistance(index).toFixed(2)} km
                              {roadRoutes[index - 1] && <span className="text-xs text-green-600 block">Road</span>}
                            </div>
                          </div>
                        )}
                        {currentStep > index && (
                          <Badge variant="default" className="bg-green-500">
                            Completed
                          </Badge>
                        )}
                        {currentStep === index && (
                          <Badge variant="default" className="bg-blue-500 animate-pulse">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="space-y-4">
                {optimizedRoute.map((dustbin, index) => {
                  const distance = calculateDistance(index);
                  const bearing = calculateBearing(index);
                  const direction = index > 0 ? getDirection(bearing) : 'Start';
                  const time = calculateTime(index);
                  const routeSegment = index > 0 ? roadRoutes[index - 1] : null;

                  return (
                    <Card key={dustbin.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentStep > index 
                            ? 'bg-green-500 text-white' 
                            : currentStep === index
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{dustbin.name}</h4>
                            <Badge variant={
                              dustbin.status === 'critical' ? 'destructive' :
                              dustbin.status === 'warning' ? 'default' :
                              'secondary'
                            }>
                              {dustbin.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">{dustbin.location}</div>
                          
                          {routeSegment && routeSegment.instructions && routeSegment.instructions.length > 0 && (
                            <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                              <div className="font-medium mb-1">Road Directions:</div>
                              <div className="space-y-1">
                                {routeSegment.instructions.slice(0, 5).map((instruction, idx) => (
                                  <div key={idx}>• {instruction}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Fill Level</div>
                              <div className="font-semibold text-lg">{dustbin.fillPercentage.toFixed(1)}%</div>
                            </div>
                            {index > 0 && (
                              <>
                                <div>
                                  <div className="text-gray-500">Distance</div>
                                  <div className="font-semibold">
                                    {distance.toFixed(2)} km
                                    {routeSegment && <span className="text-xs text-green-600 ml-1">(Road)</span>}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Direction</div>
                                  <div className="font-semibold">{direction} ({bearing.toFixed(0)}°)</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Est. Time</div>
                                  <div className="font-semibold">{time}</div>
                                </div>
                              </>
                            )}
                            {index === 0 && (
                              <div>
                                <div className="text-gray-500">Coordinates</div>
                                <div className="font-semibold text-xs">
                                  {dustbin.coordinates.lat.toFixed(4)}, {dustbin.coordinates.lng.toFixed(4)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

        {optimizedRoute.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Navigation className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click "Start" to generate optimized collection route</p>
          </div>
        )}
      </Card>

      {optimizedRoute.length > 0 && (
        <RouteMap 
          route={optimizedRoute} 
          currentStep={currentStep}
          roadRoutes={roadRoutes}
          loadingRoutes={loadingRoutes}
        />
      )}
    </div>
  );
}
