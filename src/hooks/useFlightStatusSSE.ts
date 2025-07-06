import { useEffect, useRef, useState, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import { FlightStatus } from '@/types';
import { API_CONFIG } from '@/lib/config';

interface SSEFlightUpdate {
  flightId: string;
  flightNumber: string;
  airline: string;
  originId: string;
  destinationId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  status: string;
  updatedAt: string;
  message?: string;
  // Optional fields that might be present
  origin?: string;
  destination?: string;
  departureGate?: string;
  arrivalGate?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  [key: string]: any;
}

export const useFlightStatusSSE = (flightId?: string) => {
  const [status, setStatus] = useState<FlightStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const createConnection = useCallback(async () => {
    if (!flightId) return;

    try {
      const token = getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Use the existing SSE endpoint for specific flight updates
      const url = `${API_CONFIG.baseURL}/flight-status/updates/${flightId}?token=${encodeURIComponent(token)}`;
      const eventSource = new EventSource(url);

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened for flight:', flightId);
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEFlightUpdate = JSON.parse(event.data);
          
          // Convert SSE data to FlightStatus format
          const flightStatus: FlightStatus = {
            flightId: data.flightId,
            flightNumber: data.flightNumber,
            airline: data.airline,
            // Use origin/destination if available, otherwise use IDs as fallback
            origin: data.origin || data.originId,
            destination: data.destination || data.destinationId,
            status: data.status as FlightStatus['status'],
            scheduledDeparture: data.departureTime,
            estimatedDeparture: data.departureTime,
            scheduledArrival: data.arrivalTime,
            estimatedArrival: data.arrivalTime,
            statusUpdateTime: data.updatedAt,
            remarks: data.message,
          };

          setStatus(flightStatus);
          setLastUpdate(new Date());
          console.log('Flight status update received:', data);
        } catch (err) {
          console.error('Error parsing SSE message:', err);
          setError('Error parsing update data');
        }
      };

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          reconnectAttempts.current++;
          
          setError(`Connection lost. Retrying in ${delay / 1000}s... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            createConnection();
          }, delay);
        } else {
          setError('Connection failed after multiple attempts. Please refresh the page.');
        }
      };

    } catch (err) {
      console.error('Error creating SSE connection:', err);
      setError('Failed to establish connection');
      setIsConnected(false);
    }
  }, [flightId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setStatus(null);
    setError(null);
    setLastUpdate(null);
    reconnectAttempts.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      createConnection();
    }, 1000);
  }, [disconnect, createConnection]);

  useEffect(() => {
    if (flightId) {
      createConnection();
    }

    return () => {
      disconnect();
    };
  }, [flightId, createConnection, disconnect]);

  return {
    status,
    isConnected,
    error,
    lastUpdate,
    reconnect,
    disconnect,
  };
};

// Hook for all flight status updates (dashboard/bookings)
export const useAllFlightStatusSSE = () => {
  const [statuses, setStatuses] = useState<Record<string, FlightStatus>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const createConnection = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Use the existing SSE endpoint for all flight updates
      const url = `${API_CONFIG.baseURL}/flight-status/updates?token=${encodeURIComponent(token)}`;
      const eventSource = new EventSource(url);

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened for all flights');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEFlightUpdate = JSON.parse(event.data);
          
          // Convert SSE data to FlightStatus format
          const flightStatus: FlightStatus = {
            flightId: data.flightId,
            flightNumber: data.flightNumber,
            airline: data.airline,
            // Use origin/destination if available, otherwise use IDs as fallback
            origin: data.origin || data.originId,
            destination: data.destination || data.destinationId,
            status: data.status as FlightStatus['status'],
            scheduledDeparture: data.departureTime,
            estimatedDeparture: data.departureTime,
            scheduledArrival: data.arrivalTime,
            estimatedArrival: data.arrivalTime,
            statusUpdateTime: data.updatedAt,
            remarks: data.message,
          };

          setStatuses(prev => ({
            ...prev,
            [data.flightId]: flightStatus
          }));
          setLastUpdate(new Date());
          console.log('Flight status update received:', data);
        } catch (err) {
          console.error('Error parsing SSE message:', err);
          setError('Error parsing update data');
        }
      };

      eventSource.onerror = (event) => {
        console.error('All flights SSE connection error:', event);
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectAttempts.current++;
          
          setError(`Connection lost. Retrying in ${delay / 1000}s... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            createConnection();
          }, delay);
        } else {
          setError('Connection failed after multiple attempts. Please refresh the page.');
        }
      };

    } catch (err) {
      console.error('Error creating all flights SSE connection:', err);
      setError('Failed to establish connection');
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setStatuses({});
    setError(null);
    setLastUpdate(null);
    reconnectAttempts.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      createConnection();
    }, 1000);
  }, [disconnect, createConnection]);

  return {
    statuses,
    isConnected,
    error,
    lastUpdate,
    reconnect,
    disconnect,
    connect: createConnection,
  };
}; 