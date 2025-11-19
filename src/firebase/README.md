# Firebase Setup Guide

## Configuration

Firebase has been configured with your credentials in `config.ts`. The app connects to:
- **Project**: realtime-dustbin-database
- **Database**: Firebase Realtime Database
- **Path**: `/bins`

## Database Structure

Your Firebase Realtime Database should follow this structure under the `/bins` path:

```json
{
  "bins": {
    "bin1": {
      "latest": 0,
      "history": {
        "1762520782": 7.73992,
        "1762520790": 5.6038,
        "1762520796": 7.73992
      }
    },
    "bin2": {
      "latest": 0,
      "history": {
        "1762521358": 0,
        "1762521365": 0,
        "1762521371": 66.43239
      }
    },
    "bin3": {
      "latest": 0,
      "history": {
        "1762757272": 66.6604,
        "1762757279": 66.729,
        "1762757285": 88.6124
      }
    }
  }
}
```

**Note**: The history object uses timestamps (in seconds) as keys and fill percentages as values.

## Required Fields

Each bin object should have:
- `latest` (number, 0-100): Current fill percentage. If 0 or missing, the most recent history entry will be used.
- `history` (object): **Required** - Object where keys are Unix timestamps (in seconds) and values are fill percentages (0-100)
  - Format: `{ "timestamp": percentage, ... }`
  - Example: `{ "1762520782": 7.73992, "1762520790": 5.6038 }`

**Optional fields** (will use defaults if not provided):
- `name` (string): Defaults to "Dustbin 1", "Dustbin 2", etc. based on bin ID
- `location` (string): Defaults to Pune locations based on bin ID
- `coordinates` (object): Defaults to Pune coordinates
  - `lat` (number)
  - `lng` (number)
- `capacity` (number): Defaults to 100

## Status Calculation

The dashboard automatically calculates status based on `fillPercentage`:
- **Normal** (Green): 0-59%
- **Warning** (Yellow): 60-79%
- **Critical** (Red): 80-100%

## Real-time Updates

The dashboard uses Firebase's `onValue` listener, which means:
- Data updates automatically when Firebase data changes
- No polling or manual refresh needed
- Changes are reflected immediately across all connected clients

## Error Handling

If Firebase connection fails:
- An error message will be displayed
- The dashboard will show an empty state
- Check browser console for detailed error messages

## Testing

To test the integration:
1. Make sure your Firebase Realtime Database has data under `/dustbins`
2. Run `npm run dev`
3. Check the "Firebase Connection" status card - it should show "Connected"
4. Update data in Firebase and watch it update in real-time on the dashboard

