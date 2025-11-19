import { DustbinData } from '../types/dustbin';
import { Card } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface FillPercentageChartProps {
  dustbin: DustbinData;
}

export function FillPercentageChart({ dustbin }: FillPercentageChartProps) {
  const chartData = dustbin.history.map(entry => ({
    time: new Date(entry.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    fillPercentage: Number(entry.fillPercentage.toFixed(1)),
    timestamp: entry.timestamp
  }));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold">{dustbin.name} - Fill History</h3>
        <p className="text-sm text-gray-500">Last 24 hours</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`fillGradient-${dustbin.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Fill %', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="text-sm">{payload[0].payload.time}</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {payload[0].value}% Full
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="fillPercentage" 
            stroke="#3b82f6" 
            fill={`url(#fillGradient-${dustbin.id})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
