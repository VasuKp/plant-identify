import { NextRequest, NextResponse } from 'next/server';

// Use the Google Places API for real data
export async function GET(req: NextRequest) {
  try {
    // Get location from query parameters
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5000'; // Default 5km
    const keyword = searchParams.get('keyword') || 'plant nursery garden center';
    const useFallback = searchParams.get('fallback') === 'true';

    // Validate location parameters
    if (!lat || !lng) {
      console.error('Missing location parameters:', { lat, lng });
      return NextResponse.json(
        { success: false, message: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    // Validate that lat and lng are valid numbers
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      console.error('Invalid coordinates format:', { lat, lng });
      return NextResponse.json(
        { success: false, message: 'Invalid location coordinates format' },
        { status: 400 }
      );
    }

    // Log the request with validated coordinates
    console.log(`Searching for nurseries near ${latNum},${lngNum} within ${radius}m`);

    // Use Google Places API with the provided key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || useFallback) {
      console.log('Using fallback data for nurseries');
      return NextResponse.json({
        success: true,
        data: generateFallbackNurseries(latNum, lngNum)
      });
    }
    
    // Build the URL with multiple types to increase relevant results
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latNum},${lngNum}&radius=${radius}&type=garden_center|florist|store&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
    
    try {
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Google API returned an error status:', response.status);
        console.log('Using fallback data due to Google API error');
        return NextResponse.json({
          success: true,
          data: generateFallbackNurseries(latNum, lngNum)
        });
      }
      
      const data = await response.json();
      console.log('Google API status:', data.status);
      
      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        // Format Google Places API results into our structure
        const nurseries = data.results ? await Promise.all(data.results.map(async (place: any) => {
          // For each place, fetch more details to get phone, website, etc.
          let placeDetails = place;
          
          // Calculate distance using the haversine formula
          const distance = calculateDistance(latNum, lngNum, 
            place.geometry.location.lat, 
            place.geometry.location.lng);
            
          const distanceText = distance < 1 ? 
            `${(distance * 1000).toFixed(0)} m away` : 
            `${distance.toFixed(1)} km away`;
          
          // Try to get additional details for each place if needed
          if (!place.international_phone_number || !place.website) {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=international_phone_number,website,price_level,opening_hours,photos&key=${apiKey}`;
              const detailsResponse = await fetch(detailsUrl);
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                if (detailsData.status === 'OK') {
                  placeDetails = { ...place, ...detailsData.result };
                }
              }
            } catch (detailsError) {
              console.warn(`Couldn't fetch details for ${place.name}:`, detailsError);
            }
          }
          
          // Get high-quality images
          const images = [];
          if (placeDetails.photos && placeDetails.photos.length > 0) {
            for (let i = 0; i < Math.min(3, placeDetails.photos.length); i++) {
              images.push(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${placeDetails.photos[i].photo_reference}&key=${apiKey}`);
            }
          } else {
            // Default image if no photos available
            images.push('/images/default-nursery.jpg');
          }
          
          return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            distance: distanceText,
            rating: place.rating || 4.0,
            reviews: place.user_ratings_total,
            phone: placeDetails.international_phone_number || '+91 9876543210',
            website: placeDetails.website || '',
            openNow: place.opening_hours ? place.opening_hours.open_now : false,
            price_level: placeDetails.price_level,
            types: place.types,
            image: images[0], // First image as main image
            images: images.length > 1 ? images : undefined,
            photos: images,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          };
        })) : [];
        
        // If no results, return fallback data
        if (nurseries.length === 0) {
          console.log('No nurseries found, using fallback data');
          return NextResponse.json({
            success: true,
            data: generateFallbackNurseries(latNum, lngNum)
          });
        }
        
        return NextResponse.json({
          success: true,
          data: nurseries
        });
      } else {
        // Log the error from Google API
        console.error('Google API returned an error:', data.status, data.error_message);
        console.log('Using fallback data due to Google API error');
        return NextResponse.json({
          success: true,
          data: generateFallbackNurseries(latNum, lngNum)
        });
      }
    } catch (apiError) {
      console.error('Error calling Google API:', apiError);
      console.log('Using fallback data due to Google API error');
      return NextResponse.json({
        success: true,
        data: generateFallbackNurseries(latNum, lngNum)
      });
    }
  } catch (error) {
    console.error('Error fetching nurseries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch nearby nurseries' },
      { status: 500 }
    );
  }
}

// Calculate distance between two coordinates using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Generate fallback nursery data for testing when Google API fails
function generateFallbackNurseries(userLat: number, userLng: number) {
  // Generate some nearby coordinates within 5km
  const generateNearbyLocation = (baseLat: number, baseLng: number, maxDistanceKm: number = 5) => {
    // 1 degree of latitude ~ 111km
    // 1 degree of longitude ~ 111km * cos(latitude)
    const latOffset = (Math.random() * 2 - 1) * maxDistanceKm / 111;
    const lngFactor = Math.cos(deg2rad(baseLat));
    const lngOffset = (Math.random() * 2 - 1) * maxDistanceKm / (111 * lngFactor);
    
    return {
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset
    };
  };
  
  const nurseryNames = [
    "Green Thumb Plant Nursery",
    "Blooming Gardens",
    "Plant Paradise",
    "Nature's Haven Nursery",
    "Evergreen Plant Center",
    "The Garden Depot",
    "Leaf & Petal Nursery",
    "Sunshine Gardens",
    "Flora & Fauna Center",
    "Urban Botanicals"
  ];
  
  const nurseryImages = [
    "/images/fallback/nursery1.jpg",
    "/images/fallback/nursery2.jpg",
    "/images/fallback/nursery3.jpg",
    "/images/fallback/nursery4.jpg",
    "/images/fallback/nursery5.jpg"
  ];
  
  // Generate 5-8 random nurseries
  const count = 5 + Math.floor(Math.random() * 4);
  const fallbackNurseries = [];
  
  for (let i = 0; i < count; i++) {
    const location = generateNearbyLocation(userLat, userLng);
    const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
    const distanceText = distance < 1 ? 
      `${(distance * 1000).toFixed(0)} m away` : 
      `${distance.toFixed(1)} km away`;
    
    // Generate random images for each nursery
    const images = [];
    const imageCount = 1 + Math.floor(Math.random() * 3); // 1-3 images
    for (let j = 0; j < imageCount; j++) {
      const randomImageIndex = Math.floor(Math.random() * nurseryImages.length);
      images.push(nurseryImages[randomImageIndex]);
    }
    
    fallbackNurseries.push({
      id: `fallback-${i+1}`,
      name: nurseryNames[i % nurseryNames.length],
      address: `${Math.floor(Math.random() * 1000) + 1} Plant Street, Gardenia City`,
      distance: distanceText,
      rating: (3 + Math.random() * 2).toFixed(1),
      reviews: Math.floor(Math.random() * 100) + 5,
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      website: Math.random() > 0.3 ? `https://example.com/nursery${i+1}` : '',
      openNow: Math.random() > 0.2, // 80% chance of being open
      price_level: Math.floor(Math.random() * 3) + 1,
      types: ["garden_center", "store", "point_of_interest", "establishment"],
      image: images[0],
      images: images,
      photos: images,
      lat: location.lat,
      lng: location.lng
    });
  }
  
  return fallbackNurseries;
} 