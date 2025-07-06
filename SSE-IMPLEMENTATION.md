# Real-Time Flight Status Updates with Server-Sent Events (SSE)

This document explains how to use the SSE implementation for real-time flight status updates that integrates with your existing backend endpoints.

## Backend Endpoints

Your backend already provides these SSE endpoints:

1. **Get Current Flight Status**: `GET /flight-status/{flightId}`
2. **Subscribe to All Flight Updates**: `GET /flight-status/updates`
3. **Subscribe to Specific Flight Updates**: `GET /flight-status/updates/{flightId}`

## Frontend Implementation

### Hooks

#### `useFlightStatusSSE(flightId)`
Connects to a specific flight's real-time updates.

```typescript
const {
  status,         // Current flight status
  isConnected,    // Connection status
  error,          // Error message if any
  lastUpdate,     // Timestamp of last update
  reconnect,      // Function to manually reconnect
  disconnect      // Function to disconnect
} = useFlightStatusSSE(flightId);
```

**Parameters:**
- `flightId`: Flight ID or flight number to monitor

**Returns:**
- `status`: FlightStatus object with current flight data
- `isConnected`: Boolean indicating connection status
- `error`: Error message string or null
- `lastUpdate`: Date of last update or null
- `reconnect`: Function to manually reconnect
- `disconnect`: Function to disconnect

#### `useAllFlightStatusSSE()`
Connects to all flight status updates.

```typescript
const {
  statuses,       // Object with all flight statuses by ID
  isConnected,    // Connection status
  error,          // Error message if any
  lastUpdate,     // Timestamp of last update
  reconnect,      // Function to manually reconnect
  disconnect,     // Function to disconnect
  connect         // Function to start connection
} = useAllFlightStatusSSE();
```

**Returns:**
- `statuses`: Record<string, FlightStatus> with all flight statuses
- `isConnected`: Boolean indicating connection status
- `error`: Error message string or null
- `lastUpdate`: Date of last update or null
- `reconnect`: Function to manually reconnect
- `disconnect`: Function to disconnect
- `connect`: Function to start connection

### Components

#### `RealTimeFlightStatus`
Reusable component for displaying real-time flight status.

```typescript
<RealTimeFlightStatus
  flightId="AA123"              // Flight ID or flight number
  currentStatus={staticStatus}  // Optional: Initial status
  showToggle={true}            // Optional: Show enable/disable button
  compact={false}              // Optional: Compact display mode
/>
```

**Props:**
- `flightId`: Flight ID or flight number to monitor
- `currentStatus`: Optional initial FlightStatus object
- `showToggle`: Boolean to show/hide the enable/disable button
- `compact`: Boolean for compact display mode

## Usage Examples

### 1. Flight Status Page

The flight status page now includes real-time updates that work with your existing endpoints:

```typescript
// After user searches for flight status
{hasSearched && flightStatus && (
  <div className="bg-[#2b2b3c] p-6 rounded-2xl">
    {/* Static flight information */}
    <div className="flight-info">
      {/* ... existing flight info ... */}
    </div>
    
    {/* Real-time updates */}
    <RealTimeFlightStatus
      flightId={flightStatus.flightNumber}
      currentStatus={flightStatus}
      showToggle={true}
      compact={false}
    />
  </div>
)}
```

### 2. Dashboard with Live Updates

The dashboard shows real-time updates for all upcoming flights:

```typescript
// Enable live updates for all flights
const {
  statuses: flightStatuses,
  isConnected,
  error: sseError,
  lastUpdate,
  reconnect,
  disconnect,
  connect
} = useAllFlightStatusSSE();

// Display upcoming flights with real-time status
{dashboardData.upcomingFlights.map((booking) => {
  const flightNumber = booking.flight?.flight_number;
  const realtimeStatus = flightNumber && flightStatuses[flightNumber];
  
  return (
    <div key={booking.id} className="flight-card">
      <div className="flight-info">
        <p className="font-semibold">{booking.flight?.flight_number}</p>
        {realtimeStatus && (
          <span className="status-badge">
            {realtimeStatus.status}
          </span>
        )}
      </div>
      
      {/* Real-time message */}
      {realtimeStatus && realtimeStatus.remarks && (
        <p className="real-time-message">
          {realtimeStatus.remarks}
        </p>
      )}
    </div>
  );
})}
```

## Authentication

The SSE connections include authentication tokens via query parameters:

```typescript
// For specific flight updates
const url = `http://localhost:5000/flight-status/updates/${flightId}?token=${encodeURIComponent(token)}`;

// For all flight updates
const url = `http://localhost:5000/flight-status/updates?token=${encodeURIComponent(token)}`;
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Connection Errors**: Automatic reconnection with exponential backoff
2. **Authentication Errors**: Clear error messages when tokens are invalid
3. **Parse Errors**: Graceful handling of malformed SSE data
4. **Manual Retry**: Users can manually retry connections

## Features

### Automatic Reconnection
- Failed connections are retried automatically
- Uses exponential backoff (1s, 2s, 4s, 8s, 16s delays)
- Maximum 5 retry attempts before giving up
- Users can manually trigger reconnection

### Connection Management
- Proper cleanup when components unmount
- Automatic connection closing to prevent memory leaks
- Connection status indicators for user feedback

### Real-Time Updates
- Instant status updates via SSE
- Real-time status badges and messages
- Last update timestamps
- Live connection indicators

## Data Flow

1. **User Action**: User enables real-time updates
2. **Connection**: Frontend establishes SSE connection to backend
3. **Authentication**: JWT token sent via query parameter
4. **Status Updates**: Backend sends flight status changes via SSE
5. **UI Updates**: Frontend automatically updates display with new data

## SSE Message Format

The backend should send SSE messages in this format:

```json
{
  "flightId": "AA123",
  "flightNumber": "AA123",
  "status": "DELAYED",
  "timestamp": "2024-01-01T12:00:00Z",
  "message": "Flight delayed due to weather conditions",
  "airline": "American Airlines",
  "origin": "JFK",
  "destination": "LAX",
  "scheduledDeparture": "2024-01-01T14:00:00Z",
  "estimatedDeparture": "2024-01-01T14:30:00Z",
  "scheduledArrival": "2024-01-01T17:00:00Z",
  "estimatedArrival": "2024-01-01T17:30:00Z",
  "departureGate": "A12",
  "arrivalGate": "B5",
  "departureTerminal": "1",
  "arrivalTerminal": "2",
  "remarks": "Delayed due to weather conditions"
}
```

## Testing

To test the SSE implementation:

1. **Start both servers:**
   ```powershell
   # Backend
   cd flight-booking-backend; npm run start:dev
   
   # Frontend
   cd flight-booking-frontend/my-app; npm run dev
   ```

2. **Test Flight Status Page:**
   - Navigate to `/flight-status`
   - Search for a flight
   - Click "Enable Live Updates"
   - Check browser DevTools Network tab for SSE connection

3. **Test Dashboard:**
   - Navigate to `/dashboard`
   - Click "Enable Live Updates" in the Upcoming Flights section
   - Verify connection status indicator

4. **Test Error Handling:**
   - Stop the backend server while connected
   - Verify error messages and reconnection attempts
   - Restart backend and test manual reconnection

## Performance Considerations

- **Selective Connections**: Only connect when users enable real-time updates
- **Connection Pooling**: Reuse connections where possible
- **Automatic Cleanup**: Proper cleanup prevents memory leaks
- **Efficient Updates**: Only update UI when data actually changes

## Browser Support

Server-Sent Events are supported in all modern browsers:
- Chrome 6+
- Firefox 6+
- Safari 5+
- Edge 79+
- IE is not supported (consider polyfill if needed)

## Troubleshooting

### Common Issues

1. **Connection Fails**
   - Check backend server is running
   - Verify JWT token is valid
   - Check CORS settings

2. **No Updates Received**
   - Verify backend is sending SSE messages
   - Check browser Network tab for SSE connection
   - Confirm flight ID matches backend data

3. **Frequent Disconnections**
   - Check network stability
   - Verify backend keeps connections alive
   - Review server logs for errors

### Debug Tips

- Open browser DevTools Network tab
- Look for EventSource connections
- Check console for error messages
- Monitor backend logs for SSE activity
- Use the connection status indicators in the UI

## Future Enhancements

- Push notifications for important status changes
- Offline support with reconnection when online
- Real-time passenger notifications
- Integration with booking management
- Advanced filtering for specific status types 