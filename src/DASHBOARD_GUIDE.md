# Smart Dustbin Dashboard - Pune City

## Overview
A comprehensive React-based dashboard for managing smart dustbins across Pune city with Firebase integration, real-time monitoring, historical analytics, and intelligent route optimization.

## 🎯 Key Features

### 1. Real-time Monitoring
- Live fill percentage tracking for all dustbins
- Auto-updating data every 5 seconds
- Status indicators (Normal, Warning, Critical)
- GPS coordinates for each dustbin

### 2. Firebase Integration
- Connects to Firebase Realtime Database
- Automatically merges your 2 Firebase dustbins with mock data for simulation
- Real-time synchronization
- Fallback to mock data if Firebase connection fails

### 3. Route Optimization
- **Intelligent Routing**: Prioritizes dustbins by fill percentage
- **Visual Map**: Canvas-based route visualization showing the optimized path
- **Animated Simulation**: Step-by-step collection route playback
- **Distance Calculation**: Real distance using Haversine formula
- Collections prioritize dustbins above 60% fill level

### 4. Analytics
- Historical fill percentage charts (24-hour data)
- Trend analysis for each dustbin
- Average fill levels across all dustbins
- Interactive time-series visualizations

### 5. Pune-Specific Features
- All locations are from Pune city (FC Road, Koregaon Park, Shivajinagar, etc.)
- Coordinates centered around Pune (18.5°N, 73.8°E)
- Service area visualization

## 📂 Project Structure

```
/
├── App.tsx                          # Main application component
├── firebase/
│   ├── config.ts                    # Firebase configuration
│   └── README.md                    # Firebase setup guide
├── hooks/
│   └── useFirebaseData.ts           # Firebase data hook
├── types/
│   └── dustbin.ts                   # TypeScript interfaces
├── components/
│   ├── DashboardStats.tsx           # Overview statistics
│   ├── DustbinCard.tsx              # Individual dustbin card
│   ├── DustbinTable.tsx             # Tabular view of all dustbins
│   ├── FillPercentageChart.tsx      # Historical charts
│   ├── RouteSimulation.tsx          # Route optimization logic
│   ├── RouteMap.tsx                 # Visual route map (canvas-based)
│   ├── FirebaseStatus.tsx           # Connection status indicator
│   ├── LocationInfo.tsx             # Pune service area info
│   └── QuickGuide.tsx               # User guide component
```

## 🚀 Getting Started

### Step 1: Firebase Setup
1. Open `/firebase/config.ts`
2. Replace placeholder values with your Firebase credentials:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

### Step 2: Firebase Database Structure
Your Firebase Realtime Database should follow this structure:
```json
{
  "dustbins": {
    "dustbin_001": {
      "name": "Dustbin 1",
      "location": "FC Road, Pune",
      "fillPercentage": 75.5,
      "coordinates": {
        "lat": 18.5204,
        "lng": 73.8567
      },
      "lastUpdated": 1699372800000,
      "capacity": 100,
      "history": [...]
    },
    "dustbin_002": { ... }
  }
}
```

See `/firebase/README.md` for complete database structure details.

### Step 3: Run the Application
The dashboard is ready to use! It will:
- Connect to your Firebase database
- Load your 2 real dustbins
- Add mock Pune location data for route simulation
- Start real-time monitoring

## 🗺️ Route Simulation

### How It Works
1. Click "Start" in the Route Planning tab
2. System analyzes all dustbins and prioritizes by fill percentage
3. Dustbins above 60% are marked for collection
4. Route is optimized to minimize total distance
5. Visual map shows the path with numbered markers
6. Animation progresses through each stop

### Visual Indicators
- **Blue Marker**: Pending stop
- **Orange Marker**: Current stop (animated)
- **Green Marker**: Completed stop
- **Blue Lines**: Route path
- **Arrows**: Direction of travel

## 📊 Dashboard Tabs

### Overview
- Quick guide with status indicators
- Grid view of all dustbins
- Comprehensive table with sorting
- Firebase connection status

### Analytics
- Individual charts for each dustbin
- 24-hour historical data
- Fill percentage trends
- Interactive tooltips

### Route Planning
- Route optimization controls
- Statistics (total stops, distance, avg fill)
- Step-by-step route list
- Visual map with route lines

## 🎨 Status Indicators

- **Normal (Green)**: 0-59% fill level
- **Warning (Yellow)**: 60-79% fill level
- **Critical (Red)**: 80-100% fill level

## 🔄 Real-time Updates

The dashboard automatically:
- Fetches data from Firebase
- Updates fill percentages
- Recalculates status levels
- Maintains history for charts
- Syncs every 5 seconds (mock data simulation)

## 📍 Pune Locations Included

1. FC Road (18.5204, 73.8567)
2. Shivajinagar (18.5304, 73.8446)
3. Koregaon Park (18.5362, 73.8958)
4. Kothrud (18.5074, 73.8077)
5. Baner (18.5598, 73.7775)
6. Hadapsar (18.5089, 73.9260)
7. Wakad (18.5975, 73.7649)
8. Viman Nagar (18.5679, 73.9143)

## 🛠️ Customization Options

### Adding Google Maps (Optional)
The RouteMap component includes commented code for Google Maps integration:
1. Get a Google Maps API key
2. Install: `npm install @react-google-maps/api`
3. Uncomment the GoogleMap implementation in `/components/RouteMap.tsx`
4. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key

### Adjusting Route Logic
Edit `/components/RouteSimulation.tsx`:
- Change `calculateOptimizedRoute()` for different prioritization
- Modify threshold from 60% to another value
- Adjust simulation speed (currently 2000ms per step)

### Adding More Locations
Edit `/hooks/useFirebaseData.ts` in the `generateMockData()` function to add more Pune locations.

## 🎯 Next Steps

You can enhance the dashboard with:
- Real Google Maps integration for better visualization
- Export route to PDF functionality
- Email alerts for critical dustbins
- Weekly/monthly analytics reports
- Multi-vehicle route optimization
- Predictive fill-level forecasting
- Mobile app integration
- Driver assignment and tracking

## 📝 Notes

- The dashboard works offline with mock data
- Canvas-based map works without API keys
- Responsive design for mobile/tablet/desktop
- TypeScript for type safety
- Tailwind CSS for styling
- Recharts for analytics visualization

Enjoy your Smart Dustbin Management Dashboard! 🗑️✨
