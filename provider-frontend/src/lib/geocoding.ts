/**
 * Simple reverse geocoding using OpenStreetMap Nominatim
 * Returns a human-readable address from coordinates
 */
export async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
      {
        headers: {
          'User-Agent': 'ReviaProviderPlatform/1.0',
        },
      }
    );
    const data = await response.json();
    
    // Extract a detailed, readable address
    const addr = data.address;
    const parts = [];

    if (addr.road) parts.push(addr.road);
    if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
    if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
    if (addr.country) parts.push(addr.country);

    if (parts.length > 0) return parts.join(', ');
    
    return data.display_name?.split(',').slice(0, 3).join(',') || 'Address details not found';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Address details not found';
  }
}
