/**
 * Routing Service using OpenRouteService
 */

export interface RouteStats {
  distance: number; // in meters
  duration: number; // in seconds
}

export interface RouteData {
  stats: RouteStats;
  geometry: [number, number][]; // [[lat, lng], ...]
}

const API_KEY = (import.meta as any).env.VITE_OPENROUTE_API_KEY;
const CACHE_NAME = 'ors-route-cache';

export const getRoute = async (start: [number, number], end: [number, number]): Promise<RouteData | null> => {
  if (!API_KEY) {
    console.warn('OpenRouteService API Key is missing. Routing will be unavailable.');
    return null;
  }

  const cacheKey = `route-${start.join(',')}-${end.join(',')}`;
  
  // Try cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Basic TTL check (7 days)
      if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`,
      {
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ORS API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const route: RouteData = {
        stats: {
          distance: feature.properties.summary.distance,
          duration: feature.properties.summary.duration
        },
        geometry: feature.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]) // Flip to [lat, lng]
      };

      // Store in cache
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: route
      }));

      return route;
    }

    return null;
  } catch (error) {
    console.error('Routing error:', error);
    return null;
  }
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};
