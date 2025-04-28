/**
 * Custom Google Maps styling to match our application design
 * Makes the map lighter and highlights parks and plant-related areas in green
 */
export const mapStyles = [
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6195a0"
      }
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      {
        "lightness": "0"
      },
      {
        "saturation": "0"
      },
      {
        "color": "#f5f5f2"
      },
      {
        "gamma": "1"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "all",
    "stylers": [
      {
        "lightness": "-3"
      },
      {
        "gamma": "1.00"
      }
    ]
  },
  {
    "featureType": "landscape.natural.terrain",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#c8e6c9"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "on"
      },
      {
        "color": "#5c9c56"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [
      {
        "saturation": -100
      },
      {
        "lightness": 45
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#f5f5f5"
      },
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#787878"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "transit.station.airport",
    "elementType": "labels.icon",
    "stylers": [
      {
        "hue": "#0a00ff"
      },
      {
        "saturation": "-77"
      },
      {
        "gamma": "0.57"
      },
      {
        "lightness": "0"
      }
    ]
  },
  {
    "featureType": "transit.station.rail",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#43321e"
      }
    ]
  },
  {
    "featureType": "transit.station.rail",
    "elementType": "labels.icon",
    "stylers": [
      {
        "hue": "#ff6c00"
      },
      {
        "lightness": "4"
      },
      {
        "gamma": "0.75"
      },
      {
        "saturation": "-68"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
      {
        "color": "#e0f2f9"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#cde2e5"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "lightness": "-49"
      },
      {
        "saturation": "-53"
      },
      {
        "gamma": "0.79"
      }
    ]
  }
]; 