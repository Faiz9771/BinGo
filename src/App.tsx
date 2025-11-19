import { useDustbinData } from './hooks/useDustbinData';
import { DashboardStats } from './components/DashboardStats';
import { DustbinCard } from './components/DustbinCard';
import { FillPercentageChart } from './components/FillPercentageChart';
import { RouteSimulation } from './components/RouteSimulation';
import { DustbinTable } from './components/DustbinTable';
import { DataStatus } from './components/DataStatus';
import { LocationInfo } from './components/LocationInfo';
import { QuickGuide } from './components/QuickGuide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2, Trash2, Info } from 'lucide-react';
import { ScrollArea } from './components/ui/scroll-area';

export default function App() {
  const { dustbins, loading, error } = useDustbinData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Error loading data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Smart Dustbin Dashboard</h1>
                <p className="text-sm text-gray-500">Real-time waste management monitoring - Pune City</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DataStatus dustbins={dustbins} />
          <LocationInfo />
        </div>

        {/* Stats */}
        <DashboardStats dustbins={dustbins} />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="route">Route Planning</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <QuickGuide />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dustbins.map((dustbin) => (
                <DustbinCard key={dustbin.id} dustbin={dustbin} />
              ))}
            </div>

            <DustbinTable dustbins={dustbins} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-6 pr-4">
                {dustbins.map((dustbin) => (
                  <FillPercentageChart key={dustbin.id} dustbin={dustbin} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Route Planning Tab */}
          <TabsContent value="route" className="mt-6">
            <RouteSimulation dustbins={dustbins} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-gray-600">
          Smart Dustbin Management System - Last updated: {new Date().toLocaleString()}
        </div>
      </footer>
    </div>
  );
}
