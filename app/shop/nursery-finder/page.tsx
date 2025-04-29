'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'
import { FaStar, FaStarHalfAlt, FaRegStar, FaStore, FaMapMarkerAlt, FaDirections, FaPhone, FaGlobe } from 'react-icons/fa'
import { mapStyles } from './google-maps-styles'

interface Nursery {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews?: number;
  phone: string;
  website?: string;
  openNow: boolean;
  price_level?: number;
  types?: string[];
  image: string;
  images?: string[];
  open_now?: boolean;
  photos?: string[];
  lat?: number;
  lng?: number;
}

// Add GoogleMap component types
declare global {
  interface Window {
    initGoogleMap: () => void;
    google: any;
  }
}

export default function NurseryFinder() {
  const searchParams = useSearchParams()
  const plantName = searchParams?.get('plant') || 'plants'
  const scientificName = searchParams?.get('scientific') || ''
  const urlLat = searchParams?.get('lat')
  const urlLng = searchParams?.get('lng')
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [nearbyNurseries, setNearbyNurseries] = useState<Nursery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [locationError, setLocationError] = useState('')
  const [radius, setRadius] = useState(5) // in km
  const [apiStatus, setApiStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  
  // Add state for image carousels
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({})
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({})
  
  // Add Google Maps related state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleMap, setGoogleMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchCircle, setSearchCircle] = useState<any>(null);
  const [selectedNurseryId, setSelectedNurseryId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Add status tracking for Google Maps
  const [mapStatus, setMapStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [mapError, setMapError] = useState<string>('');
  
  // Function to test the Google Maps API
  const testGoogleMapsApi = async () => {
    try {
      setApiStatus('Testing API...')
      const testUrl = `/api/test-maps-api`
      const response = await fetch(testUrl)
      
      if (!response.ok) {
        const errorText = await response.text()
        setApiStatus(`API Error (${response.status}): ${errorText || response.statusText}`)
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Show the detailed API status information
        const details = data.details || {}
        setApiStatus(`Maps API Status: ${data.status} (${details.explanation || ''})`)
      } else {
        setApiStatus(`API Error: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error testing Google Maps API:', error)
      setApiStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  useEffect(() => {
    // Test the API when in development
    if (process.env.NODE_ENV === 'development') {
      testGoogleMapsApi()
    }
    
    // If lat and lng are provided in URL, use them directly
    if (urlLat && urlLng) {
      const coords = {
        lat: parseFloat(urlLat),
        lng: parseFloat(urlLng)
      }
      
      if (!isNaN(coords.lat) && !isNaN(coords.lng)) {
        console.log("Using location from URL parameters:", coords)
        setUserLocation(coords)
        fetchNearbyNurseries(coords, radius * 1000)
        return
      } else {
        console.error("Invalid coordinates in URL parameters:", { urlLat, urlLng })
        setLocationError("Invalid location coordinates were provided. Getting your current location instead.")
      }
    } else {
      console.log("No coordinates in URL, using geolocation")
    }
    
    // If no coordinates in URL or invalid, get user location
    getUserLocation()
  }, [radius, urlLat, urlLng])

  const getUserLocation = () => {
    setIsLoading(true)
    setLocationError('')
    
    if (navigator.geolocation) {
      // Set a timeout in case geolocation takes too long
      const timeoutId = setTimeout(() => {
        setLocationError('Location request timed out. Please try again or use a device with better GPS capability.')
        setIsLoading(false)
      }, 20000) // 20 second timeout
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId) // Clear the timeout
          
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          console.log(`Successfully obtained coordinates: ${userCoords.lat}, ${userCoords.lng}`)
          setUserLocation(userCoords)
          fetchNearbyNurseries(userCoords, radius * 1000) // convert km to meters
        },
        (error) => {
          clearTimeout(timeoutId) // Clear the timeout
          console.error('Geolocation error:', error)
          
          let errorMessage = 'Unable to access your location.'
          
          // Provide more specific error messages based on the error code
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services in your browser settings and try again.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again from a different location.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
            default:
              errorMessage = `Error getting location: ${error.message}`
          }
          
          setLocationError(errorMessage)
          setIsLoading(false)
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000,
          maximumAge: 0  // Don't use cached position
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser. Please try using a different browser.')
      setIsLoading(false)
    }
  }

  const fetchNearbyNurseries = async (coords: {lat: number, lng: number}, radiusInMeters: number) => {
    setIsLoading(true)
    setLocationError('')
    
    try {
      console.log(`Fetching nurseries at coordinates ${coords.lat},${coords.lng} with radius ${radiusInMeters}m`)
      const response = await fetch(`/api/nurseries?lat=${coords.lat}&lng=${coords.lng}&radius=${radiusInMeters}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'Error fetching nurseries')
      }
      
      setNearbyNurseries(result.data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching nearby nurseries:', error)
      setLocationError(error instanceof Error ? error.message : 'Failed to fetch nearby nurseries. Please try again.')
      setIsLoading(false)
    }
  }

  const openDirections = (nurseryAddress: string) => {
    if (!userLocation) return
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(nurseryAddress)}&travelmode=driving`
    window.open(url, '_blank')
  }

  const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRadius = parseInt(e.target.value)
    setRadius(newRadius)
    if (userLocation) {
      fetchNearbyNurseries(userLocation, newRadius * 1000)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />)
      }
    }
    
    return stars
  }

  const nextImage = (nurseryId: string, totalImages: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [nurseryId]: ((prev[nurseryId] || 0) + 1) % totalImages
    }))
  }

  const prevImage = (nurseryId: string, totalImages: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [nurseryId]: ((prev[nurseryId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  // When the user location function starts, also show a proper error handling
  useEffect(() => {
    // Check if we need to show the location prompt
    if (!userLocation && !isLoading && !locationError) {
      setShowLocationPrompt(true)
    } else if (userLocation) {
      setShowLocationPrompt(false)
    }
  }, [userLocation, isLoading, locationError])

  const handleNextPhoto = (nurseryId: string) => {
    setCurrentPhotoIndex(prev => (prev + 1) % (nearbyNurseries.find(n => n.id === nurseryId)?.photos?.length || 1))
  }

  const handlePrevPhoto = (nurseryId: string) => {
    setCurrentPhotoIndex(prev => (prev - 1 + (nearbyNurseries.find(n => n.id === nurseryId)?.photos?.length || 1)) % (nearbyNurseries.find(n => n.id === nurseryId)?.photos?.length || 1))
  }

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!window.google || !userLocation || !mapRef.current) return;
    
    const mapOptions = {
      center: { lat: userLocation.lat, lng: userLocation.lng },
      zoom: 13,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP
      },
      styles: mapStyles // Apply custom map styles
    };
    
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    setGoogleMap(map);
    
    // Add user marker with better styling
    new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 2
      },
      title: 'Your Location'
    });
    
    // Create circle to show search radius with custom styling
    const circle = new window.google.maps.Circle({
      strokeColor: '#22c55e',
      strokeOpacity: 0.3,
      strokeWeight: 2,
      fillColor: '#22c55e',
      fillOpacity: 0.1,
      map: map,
      center: { lat: userLocation.lat, lng: userLocation.lng },
      radius: radius * 1000 // radius in meters
    });
    
    // Store circle reference for future updates
    setSearchCircle(circle);
    
    // Add markers for nurseries
    if (nearbyNurseries.length > 0) {
      addNurseryMarkers(map);
    }
  }, [userLocation, nearbyNurseries, radius]);
  
  const addNurseryMarkers = useCallback((map: any) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];
    
    // Create bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();
    
    // Add user location to bounds
    if (userLocation) {
      bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
    }
    
    // Create info window for displaying details
    const infoWindow = new window.google.maps.InfoWindow();
    
    // Add markers for each nursery
    nearbyNurseries.forEach((nursery, index) => {
      // Extract coordinates from the Google Place
      let lat = 0;
      let lng = 0;
      
      // Try to get coordinates from the nursery object
      if (nursery.lat !== undefined && nursery.lng !== undefined) {
        lat = nursery.lat;
        lng = nursery.lng;
      } else {
        // Try to parse from distance or use default (will be skipped)
        try {
          // Extract coordinates from Google Places data if available
          const extractedCoords = extractCoordinates(nursery);
          if (extractedCoords) {
            lat = extractedCoords.lat;
            lng = extractedCoords.lng;
          }
        } catch (error) {
          console.warn(`Could not extract coordinates for ${nursery.name}`);
        }
      }
      
      if (lat === 0 && lng === 0) return; // Skip if no valid coordinates
      
      const position = { lat, lng };
      bounds.extend(position);
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: nursery.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          `),
          anchor: new window.google.maps.Point(18, 18),
          scaledSize: new window.google.maps.Size(36, 36)
        },
        optimized: true,
        zIndex: nursery.id === selectedNurseryId ? 100 : index
      });
      
      // Create info window content
      const content = `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">${nursery.name}</h3>
          <p style="margin: 0 0 5px; font-size: 13px;">${nursery.address}</p>
          <p style="margin: 0; color: #666; font-size: 12px;">
            ${nursery.distance} • Rating: ${nursery.rating}
          </p>
        </div>
      `;
      
      // Add click listener to show info window
      marker.addListener('click', () => {
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        setSelectedNurseryId(nursery.id);
        
        // Scroll to the nursery card if in list view
        if (viewMode === 'list') {
          const nurseryCard = document.getElementById(`nursery-${nursery.id}`);
          if (nurseryCard) {
            nurseryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
      
      newMarkers.push(marker);
    });
    
    // Fit map to bounds if we have markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
    
    setMarkers(newMarkers);
  }, [nearbyNurseries, userLocation, selectedNurseryId, viewMode]);
  
  // Load Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setMapStatus('loading');
    
    // If Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      setMapStatus('ready');
      return;
    }
    
    // Clean up any existing script to prevent duplicates
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
    
    // Set a timeout to detect if Google Maps fails to load
    const timeoutId = setTimeout(() => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps script loading timed out');
        setMapStatus('error');
        setMapError('Google Maps failed to load - timeout exceeded');
      }
    }, 10000); // 10 second timeout
    
    // Function to initialize map after script loads
    window.initGoogleMap = () => {
      console.log('Google Maps script loaded successfully');
      setMapLoaded(true);
      setMapStatus('ready');
      clearTimeout(timeoutId);
    };
    
    // Create script tag for Google Maps API
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    script.onerror = (event) => {
      console.error('Google Maps script failed to load', event);
      setMapStatus('error');
      setMapError('Google Maps script failed to load');
      setApiStatus('Failed to load Google Maps script');
      clearTimeout(timeoutId);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // Cleanup
      if (window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(window);
      }
      window.initGoogleMap = () => {};
      
      // Remove the script if it exists
      const scriptToRemove = document.getElementById('google-maps-script');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, []);
  
  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && userLocation && mapRef.current && viewMode === 'map') {
      initializeMap();
    }
  }, [mapLoaded, userLocation, viewMode, initializeMap]);
  
  // Update markers when nurseries change
  useEffect(() => {
    if (googleMap && nearbyNurseries.length > 0) {
      addNurseryMarkers(googleMap);
    }
  }, [nearbyNurseries, googleMap, addNurseryMarkers]);
  
  // Update map when radius changes
  useEffect(() => {
    if (googleMap && userLocation && searchCircle) {
      // Update circle radius directly using the reference
      searchCircle.setRadius(radius * 1000);
    }
  }, [radius, googleMap, userLocation, searchCircle]);
  
  // Extract coordinates from place result
  const extractCoordinates = (place: any) => {
    if (place.geometry && place.geometry.location) {
      return {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f0faf0] flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2e7d32] mb-2 flex items-center justify-center gap-2">
            <FaStore className="text-[#22c55e]" />
            Find {plantName} Near You
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover local nurseries and garden centers where you can purchase the plants you love. 
            We'll use your location to find the nearest options.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-6xl mx-auto mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">Nearby Plant Nurseries</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Google-style search box */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    placeholder="Search nurseries"
                    disabled // Not implemented yet
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* View mode toggle */}
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-700'}`}
                  >
                    List
                  </button>
                  <button 
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 text-sm font-medium ${viewMode === 'map' ? 'bg-gray-100 text-blue-600' : 'text-gray-700'}`}
                  >
                    Map
                  </button>
                </div>
                
                {/* Filters button */}
                <button className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-full text-gray-700 font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
              </div>
            </div>
            
            {/* Radius and location controls */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <FaMapMarkerAlt className="text-red-500" />
                <span className="text-gray-700 text-sm">
                  {userLocation ? 'Your location' : 'Location unavailable'}
                </span>
                <button 
                  onClick={getUserLocation}
                  className="ml-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Update
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Within:</span>
                <select 
                  id="radius" 
                  value={radius}
                  onChange={handleRadiusChange}
                  className="border border-gray-300 rounded-full text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                </select>
              </div>
            </div>
            
            {/* Location prompt dialog */}
            {showLocationPrompt && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Location access needed</p>
                    <p className="text-sm mt-1">Allow location access to see nurseries near you</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={getUserLocation}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Allow
                      </button>
                      <button
                        onClick={() => setShowLocationPrompt(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                      >
                        Not now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {locationError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                <p>{locationError}</p>
                <button 
                  onClick={getUserLocation}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Debug information - only visible during development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm font-mono">
                <p className="font-semibold">Debug Info:</p>
                {userLocation && (
                  <>
                    <p>Latitude: {userLocation.lat}</p>
                    <p>Longitude: {userLocation.lng}</p>
                    <p>URL Params: lat={urlLat}, lng={urlLng}</p>
                  </>
                )}
                <p className={apiStatus.includes('Error') ? 'text-red-600' : (apiStatus.includes('working correctly') ? 'text-green-600' : '')}>
                  {apiStatus}
                </p>
                
                {!apiStatus.includes('working correctly') && (
                  <>
                    <p className="mt-2 text-sm text-gray-700 font-normal">
                      If the API isn't working, please ensure you've enabled:
                    </p>
                    <ol className="list-decimal ml-5 mt-1 text-sm text-gray-700 font-normal">
                      <li>Places API in your Google Cloud console</li>
                      <li>Geocoding API in your Google Cloud console</li>
                      <li>Maps JavaScript API in your Google Cloud console</li>
                      <li>Directions API in your Google Cloud console</li>
                    </ol>
                  </>
                )}
                
                <div className="mt-2">
                  <button 
                    onClick={testGoogleMapsApi}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    Test Maps API
                  </button>
                </div>
              </div>
            )}
            
            {/* Map/List View Content */}
            {isLoading ? (
              <div className="py-20 text-center">
                <svg className="w-12 h-12 mx-auto text-blue-600" viewBox="0 0 24 24">
                  <g>
                    <path fill="currentColor" d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20a4.67,4.67,0,0,0,1.43-.23,3.86,3.86,0,0,0-.8-1.57,3.42,3.42,0,0,0-1.47-1A3.81,3.81,0,0,0,5.6,17.1l-.21.06A14.71,14.71,0,0,1,9,12.31,13.56,13.56,0,0,1,12.34,10,12.21,12.21,0,0,1,17,8Z">
                      <animateTransform
                          attributeName="transform"
                          attributeType="XML"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="2s"
                          repeatCount="indefinite"
                      />
                    </path>
                    <animateMotion
                        path="M0,0 a6,6 0 1,1 0,0.1"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                  </g>
                </svg>
                <p className="mt-4 text-gray-600">Finding nurseries near you...</p>
              </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                  // List View
                  nearbyNurseries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {nearbyNurseries.map(nursery => (
                        <div key={nursery.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                          <div className="relative h-48">
                            {/* Image carousel */}
                            {nursery.images && nursery.images.length > 1 ? (
                              <>
                                <Image
                                  src={nursery.images[activeImageIndex[nursery.id] || 0]}
                                  alt={nursery.name}
                                  fill
                                  className="object-cover transition-opacity duration-300"
                                />
                                
                                {/* Navigation buttons */}
                                <div className="absolute inset-0 flex items-center justify-between px-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      prevImage(nursery.id, nursery.images!.length);
                                    }}
                                    className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center"
                                    aria-label="Previous image"
                                  >
                                    ←
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      nextImage(nursery.id, nursery.images!.length);
                                    }}
                                    className="bg-black bg-opacity-30 hover:bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center"
                                    aria-label="Next image"
                                  >
                                    →
                                  </button>
                                </div>
                                
                                {/* Image indicators */}
                                <div className="absolute bottom-14 left-0 right-0 flex justify-center">
                                  {nursery.images.map((_, index) => (
                                    <div 
                                      key={index}
                                      className={`w-2 h-2 mx-1 rounded-full ${index === (activeImageIndex[nursery.id] || 0) 
                                        ? 'bg-white' 
                                        : 'bg-white bg-opacity-50'}`}
                                    />
                                  ))}
                                </div>
                              </>
                            ) : (
                              <Image
                                src={nursery.image}
                                alt={nursery.name}
                                fill
                                className="object-cover"
                              />
                            )}
                            
                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center shadow-sm">
                              <div className="flex mr-1">
                                {renderStars(nursery.rating)}
                              </div>
                              <span>{nursery.rating}</span>
                              {nursery.reviews && (
                                <span className="text-gray-500 text-xs ml-1">({nursery.reviews})</span>
                              )}
                            </div>
                            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm text-gray-700">
                              {nursery.distance}
                            </div>
                            {nursery.openNow ? (
                              <div className="absolute bottom-2 right-2 bg-[#22c55e] px-2 py-1 rounded-full text-xs font-medium shadow-sm text-white">
                                Open Now
                              </div>
                            ) : (
                              <div className="absolute bottom-2 right-2 bg-red-500 px-2 py-1 rounded-full text-xs font-medium shadow-sm text-white">
                                Closed
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">{nursery.name}</h3>
                                <p className="text-gray-600 text-sm mt-1">{nursery.address}</p>
                                
                                {/* Price level indicator */}
                                {nursery.price_level && (
                                  <div className="mt-1 text-gray-600">
                                    {'$'.repeat(nursery.price_level)} <span className="text-gray-400">{'$'.repeat(3 - nursery.price_level)}</span>
                                  </div>
                                )}
                                
                                {/* Categories/types */}
                                {nursery.types && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {nursery.types.slice(0, 2).map((type, index) => 
                                      type !== 'point_of_interest' && type !== 'establishment' && (
                                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                          {type.replace('_', ' ')}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Quick actions - more Google Maps style */}
                              <div className="flex flex-col items-center">
                                <button 
                                  onClick={() => openDirections(nursery.address)}
                                  className="mb-2 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-gray-200 transition-colors"
                                  aria-label="Get directions"
                                >
                                  <FaDirections className="text-lg" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <a 
                                href={`tel:${nursery.phone}`}
                                className="bg-[#f0faf0] text-[#2e7d32] px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1"
                              >
                                <FaPhone className="text-sm" />
                                Call
                              </a>
                              <button 
                                onClick={() => openDirections(nursery.address)}
                                className="bg-[#22c55e] text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1"
                              >
                                <FaDirections className="text-sm" />
                                Directions
                              </button>
                              <a 
                                href={nursery.website || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${nursery.website ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Website
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaStore className="text-3xl text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Nurseries Found</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-4">
                        We couldn't find any plant nurseries within {radius}km of your location. 
                        Try increasing your search radius or updating your location.
                      </p>
                      <div className="flex justify-center gap-4">
                        <select 
                          value={radius}
                          onChange={handleRadiusChange}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={2}>2 km</option>
                          <option value={5}>5 km</option>
                          <option value={10}>10 km</option>
                          <option value={20}>20 km</option>
                        </select>
                        <button 
                          onClick={getUserLocation}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Search Again
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  // Map View
                  <div className="relative overflow-hidden rounded-lg h-[500px] bg-gray-100 flex items-center justify-center">
                    {viewMode === 'map' && (
                      <div 
                        ref={mapRef} 
                        id="google-map"
                        className="absolute inset-0 z-10"
                      ></div>
                    )}
                    
                    {mapStatus === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
                        <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24">
                          <g>
                            <path fill="currentColor" d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20a4.67,4.67,0,0,0,1.43-.23,3.86,3.86,0,0,0-.8-1.57,3.42,3.42,0,0,0-1.47-1A3.81,3.81,0,0,0,5.6,17.1l-.21.06A14.71,14.71,0,0,1,9,12.31,13.56,13.56,0,0,1,12.34,10,12.21,12.21,0,0,1,17,8Z">
                              <animateTransform
                                  attributeName="transform"
                                  attributeType="XML"
                                  type="rotate"
                                  from="0 12 12"
                                  to="360 12 12"
                                  dur="2s"
                                  repeatCount="indefinite"
                              />
                            </path>
                            <animateMotion
                                path="M0,0 a6,6 0 1,1 0,0.1"
                                dur="1.5s"
                                repeatCount="indefinite"
                            />
                          </g>
                        </svg>
                        <p className="ml-3 text-gray-700">Loading map...</p>
                      </div>
                    )}
                    
                    {mapStatus === 'error' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-20 p-6">
                        <div className="text-red-500 text-5xl mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Map Loading Error</h3>
                        <p className="text-gray-600 mb-6 text-center">{mapError || 'There was an error loading the Google Maps component.'}</p>
                        <div className="text-gray-700 bg-gray-100 p-4 rounded-lg mb-4 text-sm max-w-md">
                          <p className="font-semibold mb-2">Possible solutions:</p>
                          <ul className="list-disc pl-5">
                            <li>Check if you have enabled the required Google Maps APIs in your Google Cloud Console</li>
                            <li>Verify that your API key is correctly formatted and has no restrictions that would block its use</li>
                            <li>Ensure your Google Cloud Platform billing is properly set up</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => window.location.reload()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Reload Page
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className="mt-2 text-blue-600 hover:underline"
                        >
                          Switch to List View
                        </button>
                      </div>
                    )}
                    
                    {/* Display as list of cards along with map */}
                    {viewMode === 'map' && nearbyNurseries.length > 0 && (
                      <div className="absolute right-4 top-4 bottom-16 w-64 overflow-y-auto rounded-lg bg-white shadow-lg z-20 max-h-[400px]">
                        <div className="p-3 border-b border-gray-200">
                          <h3 className="font-medium text-gray-800">
                            {nearbyNurseries.length} nurseries found
                          </h3>
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                          {nearbyNurseries.map(nursery => (
                            <div 
                              key={nursery.id}
                              id={`nursery-${nursery.id}`}
                              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedNurseryId === nursery.id ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => setSelectedNurseryId(nursery.id)}
                            >
                              <h4 className="font-medium text-gray-900 truncate">{nursery.name}</h4>
                              <p className="text-sm text-gray-600 mt-1 truncate">{nursery.address}</p>
                              <div className="flex items-center text-sm mt-1">
                                <span className="text-gray-700 mr-2">{nursery.distance}</span>
                                <div className="flex items-center">
                                  <FaStar className="text-yellow-400 w-3 h-3" />
                                  <span className="ml-1 text-gray-600">{nursery.rating}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* No results state */}
                    {viewMode === 'map' && nearbyNurseries.length === 0 && mapLoaded && !isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
                        <div className="text-center p-4 max-w-sm">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaStore className="text-2xl text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Nurseries Found</h3>
                          <p className="text-gray-600 mb-4">
                            Try increasing your search radius or updating your location.
                          </p>
                          <button 
                            onClick={getUserLocation}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Google Maps attribution */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs text-gray-700 z-20">
                      <span>Map data ©{new Date().getFullYear()} Google</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#2e7d32] mb-4">Looking to Buy Online Instead?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            If you prefer to shop from the comfort of your home, check out our online store 
            for a wide selection of plants including {plantName}.
          </p>
          <Link 
            href={`/shop?search=${encodeURIComponent(plantName)}`}
            className="bg-[#22c55e] text-white px-6 py-3 rounded-lg hover:bg-[#1ea550] transition-colors inline-flex items-center gap-2"
          >
            Shop Online
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
} 