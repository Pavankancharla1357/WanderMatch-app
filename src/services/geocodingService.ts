/**
 * Geocoding Service using Nominatim (OpenStreetMap)
 */

export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

export const geocodeLocation = async (query: string): Promise<GeocodeResult | null> => {
  if (!query) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'TripBridge-Travel-App'
        }
      }
    );

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
