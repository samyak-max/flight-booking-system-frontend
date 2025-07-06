import React, { useState } from 'react';
import { useFlightStatusSSE } from '@/hooks/useFlightStatusSSE';
import { FlightStatus } from '@/types';

interface RealTimeFlightStatusProps {
  flightId: string; // Can be either flightId or flightNumber
  currentStatus?: FlightStatus;
  showToggle?: boolean;
  compact?: boolean;
}

export const RealTimeFlightStatus: React.FC<RealTimeFlightStatusProps> = ({
  flightId,
  currentStatus,
  showToggle = true,
  compact = false,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  
  const {
    status: realtimeStatus,
    isConnected,
    error,
    lastUpdate,
    reconnect,
    disconnect
  } = useFlightStatusSSE(isEnabled ? flightId : undefined);

  const toggleRealTime = () => {
    if (isEnabled) {
      disconnect();
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-green-500/20 text-green-200';
      case 'DELAYED': return 'bg-yellow-500/20 text-yellow-200';
      case 'BOARDING': return 'bg-blue-500/20 text-blue-200';
      case 'DEPARTED': return 'bg-purple-500/20 text-purple-200';
      case 'IN_AIR': return 'bg-indigo-500/20 text-indigo-200';
      case 'LANDED': return 'bg-teal-500/20 text-teal-200';
      case 'ARRIVED': return 'bg-cyan-500/20 text-cyan-200';
      case 'CANCELLED': return 'bg-red-500/20 text-red-200';
      case 'DIVERTED': return 'bg-orange-500/20 text-orange-200';
      default: return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return '🕐';
      case 'DELAYED': return '⏰';
      case 'BOARDING': return '🚶';
      case 'DEPARTED': return '🛫';
      case 'IN_AIR': return '✈️';
      case 'LANDED': return '🛬';
      case 'ARRIVED': return '🏁';
      case 'CANCELLED': return '❌';
      case 'DIVERTED': return '🔄';
      default: return '❓';
    }
  };

  const displayStatus = realtimeStatus || currentStatus;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {displayStatus && (
          <>
            <span className="text-sm">{getStatusIcon(displayStatus.status)}</span>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(displayStatus.status)}`}>
              {displayStatus.status}
            </span>
          </>
        )}
        
        {showToggle && (
          <button
            onClick={toggleRealTime}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              isEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isEnabled ? '🔴' : '⚪'}
          </button>
        )}
        
        {isEnabled && (
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toggle Controls */}
      {showToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRealTime}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                isEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isEnabled ? '🔴 Live Updates ON' : '⚪ Enable Live Updates'}
            </button>
            
            {isEnabled && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            )}
          </div>
          
          {lastUpdate && isEnabled && (
            <div className="text-xs text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && isEnabled && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-3 py-2 rounded-lg flex justify-between items-center text-sm">
          <span>{error}</span>
          <button 
            onClick={reconnect}
            className="px-2 py-1 bg-yellow-500 text-black rounded text-xs hover:bg-yellow-400"
          >
            Retry
          </button>
        </div>
      )}

      {/* Status Display */}
      {displayStatus && (
        <div className="bg-[#1e1e2f] p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStatusIcon(displayStatus.status)}</span>
              <span className={`px-3 py-1 rounded text-sm ${getStatusColor(displayStatus.status)}`}>
                {displayStatus.status}
              </span>
              {realtimeStatus && (
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                  🔴 LIVE
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {displayStatus.flightNumber}
            </div>
          </div>
          
          {/* Real-time message */}
          {realtimeStatus && realtimeStatus.remarks && (
            <p className="text-green-400 text-sm font-medium">
              {realtimeStatus.remarks}
            </p>
          )}
          
          {/* Status details */}
          {displayStatus.statusUpdateTime && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {new Date(displayStatus.statusUpdateTime).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}; 