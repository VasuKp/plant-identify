import { NextResponse } from 'next/server';

/**
 * API route to test if the Google Maps API key is configured correctly
 * This tests both the Places and Maps JavaScript APIs
 */
export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        status: 'MISSING_API_KEY',
        message: 'Google Maps API key is not configured',
        details: {
          explanation: 'Please add a valid Google Maps API key to your .env.local file'
        }
      });
    }
    
    // Test the Places API by searching for plant nurseries near a fixed location
    const testLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${testLocation.lat},${testLocation.lng}&radius=5000&type=garden_center&key=${apiKey}`;
    
    const placesResponse = await fetch(placesUrl, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!placesResponse.ok) {
      return NextResponse.json({
        success: false,
        status: 'HTTP_ERROR',
        message: `HTTP error: ${placesResponse.status}`,
        details: {
          explanation: `API returned HTTP status: ${placesResponse.status} ${placesResponse.statusText}`,
          recommendations: [
            'Check your API key for correct formatting',
            'Verify API key permissions in Google Cloud Console',
            'Make sure your API key allows use from your domain or IP address'
          ]
        }
      });
    }
    
    const placesData = await placesResponse.json();
    
    // Check if Google Maps API returned a valid response
    if (placesData.status === 'REQUEST_DENIED') {
      return NextResponse.json({
        success: false,
        status: 'REQUEST_DENIED',
        message: placesData.error_message || 'Google Maps API request was denied',
        details: {
          explanation: 'Your API key may be invalid or missing required APIs',
          errorMessage: placesData.error_message,
          recommendations: [
            'Ensure your API key has Places API enabled',
            'Check billing status for your Google Cloud project',
            'Verify API key restrictions (if any) allow access from your domain'
          ]
        }
      });
    }
    
    if (placesData.status === 'OVER_QUERY_LIMIT') {
      return NextResponse.json({
        success: false,
        status: 'OVER_QUERY_LIMIT',
        message: 'Google Maps API query limit exceeded',
        details: {
          explanation: 'You have exceeded your daily quota or per-second limit',
          recommendations: [
            'Consider enabling billing for your Google Cloud project',
            'Implement better caching to reduce API calls',
            'Try again later when limits reset'
          ]
        }
      });
    }
    
    if (placesData.status === 'INVALID_REQUEST') {
      return NextResponse.json({
        success: false,
        status: 'INVALID_REQUEST',
        message: 'Invalid request to Google Maps API',
        details: {
          explanation: 'The API request was malformed',
          errorMessage: placesData.error_message,
          recommendations: [
            'Check the documentation for correct API usage',
            'Verify parameter formats and requirements'
          ]
        }
      });
    }
    
    // If we got here, the Places API is working
    const isPlacesWorking = ['OK', 'ZERO_RESULTS'].includes(placesData.status);
    
    // Now test Geocoding API which is often needed for address searches
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${testLocation.lat},${testLocation.lng}&key=${apiKey}`;
    const geocodingResponse = await fetch(geocodingUrl, { cache: 'no-store' });
    const geocodingData = await geocodingResponse.json();
    
    const isGeocodingWorking = ['OK', 'ZERO_RESULTS'].includes(geocodingData.status);
    
    // Overall API status
    const isWorking = isPlacesWorking && isGeocodingWorking;
    
    return NextResponse.json({
      success: isWorking,
      status: isWorking ? 'OK' : 'PARTIAL_FAILURE',
      message: isWorking 
        ? 'Google Maps API is working correctly' 
        : 'Some Google Maps APIs are not working correctly',
      details: {
        explanation: isWorking 
          ? 'Your Google Maps configuration is valid and operational' 
          : 'Some APIs are working, but others are not',
        placesApiStatus: {
          status: placesData.status,
          working: isPlacesWorking,
          resultsFound: placesData.results?.length || 0,
          errorMessage: placesData.error_message
        },
        geocodingApiStatus: {
          status: geocodingData.status,
          working: isGeocodingWorking,
          resultsFound: geocodingData.results?.length || 0,
          errorMessage: geocodingData.error_message
        },
        recommendations: !isWorking ? [
          'Make sure you have enabled these APIs in Google Cloud Console:',
          '- Places API',
          '- Maps JavaScript API',
          '- Geocoding API',
          '- Directions API'
        ] : []
      }
    });
    
  } catch (error) {
    console.error('Error testing Google Maps API:', error);
    
    return NextResponse.json({
      success: false,
      status: 'ERROR',
      message: 'Error testing Google Maps API',
      details: {
        explanation: error instanceof Error ? error.message : 'Unknown error occurred',
        recommendations: [
          'Check your network connection',
          'Verify your Google Maps API key is correctly formatted',
          'Ensure all required Google Maps APIs are enabled in your Google Cloud Console:',
          '- Places API',
          '- Maps JavaScript API',
          '- Geocoding API',
          '- Directions API'
        ]
      }
    }, { status: 500 });
  }
} 