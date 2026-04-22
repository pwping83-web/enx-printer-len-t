/**
 * Distance Calculation Utilities
 * 
 * This module handles distance calculation between two addresses using Kakao Maps API.
 * Calculates travel cost based on distance from office (Incheon Jung-gu Unbuk-dong).
 * 
 * Key Features:
 * - Geocoding: Convert addresses to coordinates via server endpoint
 * - Haversine Formula: Calculate straight-line distance between coordinates
 * - Road Distance Estimation: Multiply by 1.3x to account for road curvature
 * - Regional Pricing: Different base rates for metro area (Seoul/Gyeonggi/Incheon) vs Busan
 */

/**
 * Calculate actual distance between two addresses using Kakao Maps API
 * 
 * @param fromAddress - Starting address (office location)
 * @param toAddress - Destination address (customer location)
 * @returns Distance in kilometers (rounded to nearest km) or null if calculation fails
 */
export async function calculateRealDistance(
  fromAddress: string,
  toAddress: string
): Promise<number | null> {
  try {
    console.log('🔍 Starting distance calculation:', { fromAddress, toAddress });

    // 1. Get coordinates for starting address
    const fromCoords = await getCoordinates(fromAddress);
    if (!fromCoords) {
      console.error('❌ Failed to geocode starting address:', fromAddress);
      return null;
    }

    // 2. Get coordinates for destination address
    const toCoords = await getCoordinates(toAddress);
    if (!toCoords) {
      console.error('❌ Failed to geocode destination address:', toAddress);
      return null;
    }

    // 3. Calculate straight-line distance using Haversine formula
    const distance = calculateHaversineDistance(
      fromCoords.lat,
      fromCoords.lng,
      toCoords.lat,
      toCoords.lng
    );

    // 4. Estimate actual road distance (1.3x multiplier for road curvature)
    const roadDistance = distance * 1.3;

    // 5. Round to nearest kilometer
    const roundedDistance = Math.round(roadDistance);

    console.log('✅ Distance calculation complete:', {
      from: fromAddress,
      to: toAddress,
      straightDistance: distance.toFixed(1) + 'km',
      estimatedRoadDistance: roadDistance.toFixed(1) + 'km',
      rounded: roundedDistance + 'km'
    });

    return roundedDistance;
  } catch (error) {
    console.error('❌ Distance calculation failed:', error);
    return null;
  }
}

/**
 * Convert address to coordinates (latitude, longitude)
 * Uses server-side Geocoding API to avoid exposing Kakao API key
 * 
 * @param address - Address string to geocode
 * @returns Coordinates object {lat, lng} or null if geocoding fails
 */
async function getCoordinates(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Call server endpoint for geocoding (Kakao Maps API on backend)
    const { projectId, publicAnonKey } = await import('/utils/supabase/info');
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-36c58641/geocode?address=${encodeURIComponent(address)}`;
    
    console.log('🌐 Calling server Geocoding API:', address);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      console.error('❌ Server response failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.success && data.lat && data.lng) {
      console.log('✅ Geocoding successful:', { 
        address: data.address_name || address, 
        lat: data.lat, 
        lng: data.lng 
      });
      return { lat: data.lat, lng: data.lng };
    }

    console.error('❌ Coordinates not found for address:', address);
    return null;
  } catch (error) {
    console.error('❌ Geocoding failed:', error);
    return null;
  }
}

/**
 * Calculate straight-line distance between two coordinates using Haversine formula
 * 
 * Haversine formula:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2( √a, √(1−a) )
 * d = R ⋅ c
 * 
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Determine region type based on address
 * 
 * @param address - Customer address
 * @returns 'metro' for Seoul/Gyeonggi/Incheon, 'busan' for Busan
 */
export function getRegion(address: string): 'metro' | 'busan' {
  const addr = address.toLowerCase();
  
  // Check if address contains Busan
  if (addr.includes('부산') || addr.includes('busan')) {
    return 'busan';
  }
  
  // Default to metro area (Seoul/Gyeonggi/Incheon)
  return 'metro';
}

/**
 * Calculate base travel cost based on region
 * 
 * Pricing structure:
 * - Metro area (Seoul/Gyeonggi/Incheon): 400,000 KRW base
 * - Busan: 800,000 KRW base
 * - Other regions: Distance-based calculation from office
 * 
 * Note: Admin can manually adjust prices in dashboard
 * 
 * @param region - Region type ('metro' or 'busan')
 * @returns Base price in Korean Won
 */
export function getBasePrice(region: 'metro' | 'busan'): number {
  if (region === 'busan') {
    return 1000000; // 1,000,000 KRW = 100만원
  }
  return 500000; // 500,000 KRW = 50만원
}

/**
 * Round amount to nearest 10,000 KRW
 * 
 * @param amount - Amount in Korean Won
 * @returns Rounded amount
 */
export function roundToTenThousand(amount: number): number {
  return Math.round(amount / 10000) * 10000;
}