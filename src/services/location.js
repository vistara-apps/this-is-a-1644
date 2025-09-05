import axios from 'axios'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not configured. Using mock location data.')
}

// Mock state data for fallback when API is not available
const mockStateData = {
  'California': {
    abbreviation: 'CA',
    rightsGuide: {
      traffic: [
        'You have the right to remain silent',
        'You are not required to consent to searches',
        'Ask "Am I free to leave?" if not under arrest',
        'You can record the interaction in public'
      ],
      questioning: [
        'Invoke your right to remain silent clearly',
        'Ask for a lawyer if arrested',
        'Do not resist, even if you believe arrest is unlawful',
        'Remember details for later legal action'
      ]
    },
    scripts: {
      english: {
        traffic: "Officer, I'm exercising my right to remain silent. I do not consent to any searches.",
        questioning: "I am invoking my right to remain silent and would like to speak with an attorney."
      },
      spanish: {
        traffic: "Oficial, estoy ejerciendo mi derecho a permanecer en silencio. No consiento a ningún registro.",
        questioning: "Estoy invocando mi derecho a permanecer en silencio y me gustaría hablar con un abogado."
      }
    }
  },
  'New York': {
    abbreviation: 'NY',
    rightsGuide: {
      traffic: [
        'You must provide license, registration, and insurance',
        'You have the right to remain silent beyond identification',
        'You can refuse consent to vehicle searches',
        'Recording is generally permitted in public'
      ],
      questioning: [
        'Clearly state you are exercising right to remain silent',
        'Request an attorney if detained or arrested',
        'Do not physically resist officers',
        'Ask if you are free to leave'
      ]
    },
    scripts: {
      english: {
        traffic: "I'm providing my required documents. I exercise my right to remain silent and do not consent to searches.",
        questioning: "I invoke my right to remain silent and request to speak with an attorney."
      },
      spanish: {
        traffic: "Estoy proporcionando mis documentos requeridos. Ejerzo mi derecho a permanecer en silencio y no consiento registros.",
        questioning: "Invoco mi derecho a permanecer en silencio y solicito hablar con un abogado."
      }
    }
  },
  'Texas': {
    abbreviation: 'TX',
    rightsGuide: {
      traffic: [
        'Provide driver\'s license when requested',
        'You may remain silent beyond providing ID',
        'Consent to search is not required',
        'You may record if not interfering'
      ],
      questioning: [
        'Invoke right to remain silent explicitly',
        'Request counsel if under arrest',
        'Comply physically while asserting rights',
        'Ask about detention status'
      ]
    },
    scripts: {
      english: {
        traffic: "Here is my license. I'm invoking my right to remain silent and do not consent to any searches.",
        questioning: "I am invoking my right to remain silent and would like an attorney present."
      },
      spanish: {
        traffic: "Aquí está mi licencia. Estoy invocando mi derecho a permanecer en silencio y no consiento ningún registro.",
        questioning: "Estoy invocando mi derecho a permanecer en silencio y me gustaría que estuviera presente un abogado."
      }
    }
  },
  'Florida': {
    abbreviation: 'FL',
    rightsGuide: {
      traffic: [
        'Provide license and registration when requested',
        'You have the right to remain silent',
        'You can refuse consent to searches',
        'Recording in public is generally allowed'
      ],
      questioning: [
        'Clearly invoke your right to remain silent',
        'Request an attorney if arrested',
        'Do not physically resist',
        'Ask if you are free to leave'
      ]
    },
    scripts: {
      english: {
        traffic: "Here are my documents. I exercise my right to remain silent and do not consent to searches.",
        questioning: "I invoke my right to remain silent and request an attorney."
      },
      spanish: {
        traffic: "Aquí están mis documentos. Ejerzo mi derecho a permanecer en silencio y no consiento registros.",
        questioning: "Invoco mi derecho a permanecer en silencio y solicito un abogado."
      }
    }
  }
}

export const locationService = {
  /**
   * Get current position using browser geolocation
   * @param {Object} options - Geolocation options
   * @returns {Promise<Object>} Position object with coords
   */
  async getCurrentPosition(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    const finalOptions = { ...defaultOptions, ...options }

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser')
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          let errorMessage = 'Unable to get location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          
          reject(new Error(errorMessage))
        },
        finalOptions
      )
    })
  },

  /**
   * Reverse geocode coordinates to get address and state
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>} Address information including state
   */
  async reverseGeocode(latitude, longitude) {
    if (!GOOGLE_MAPS_API_KEY) {
      // Return mock data based on rough coordinates
      return this.getMockLocationData(latitude, longitude)
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: GOOGLE_MAPS_API_KEY,
            result_type: 'administrative_area_level_1|locality|street_address'
          }
        }
      )

      if (response.data.status !== 'OK' || !response.data.results.length) {
        throw new Error('No results found for coordinates')
      }

      const result = response.data.results[0]
      const addressComponents = result.address_components

      // Extract state information
      const stateComponent = addressComponents.find(
        component => component.types.includes('administrative_area_level_1')
      )

      const cityComponent = addressComponents.find(
        component => component.types.includes('locality')
      )

      const countryComponent = addressComponents.find(
        component => component.types.includes('country')
      )

      if (!stateComponent || countryComponent?.short_name !== 'US') {
        throw new Error('Location not in supported area (US only)')
      }

      return {
        state: stateComponent.long_name,
        stateAbbreviation: stateComponent.short_name,
        city: cityComponent?.long_name || 'Unknown',
        formattedAddress: result.formatted_address,
        coordinates: {
          latitude,
          longitude
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Fallback to mock data
      return this.getMockLocationData(latitude, longitude)
    }
  },

  /**
   * Get state-specific rights data
   * @param {string} state - State name
   * @returns {Object} State rights data
   */
  getStateRightsData(state) {
    return mockStateData[state] || mockStateData['California'] // Default fallback
  },

  /**
   * Get all available states
   * @returns {Array} List of supported states
   */
  getSupportedStates() {
    return Object.keys(mockStateData)
  },

  /**
   * Check if geolocation is supported
   * @returns {boolean}
   */
  isGeolocationSupported() {
    return 'geolocation' in navigator
  },

  /**
   * Check current permission status
   * @returns {Promise<string>} Permission status
   */
  async checkPermissionStatus() {
    if (!('permissions' in navigator)) {
      return 'unknown'
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Error checking permission:', error)
      return 'unknown'
    }
  },

  /**
   * Watch position changes
   * @param {Function} callback - Called with position updates
   * @param {Function} errorCallback - Called on errors
   * @param {Object} options - Watch options
   * @returns {number} Watch ID for clearing
   */
  watchPosition(callback, errorCallback, options = {}) {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation not supported'))
      return null
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      errorCallback,
      { ...defaultOptions, ...options }
    )
  },

  /**
   * Clear position watch
   * @param {number} watchId 
   */
  clearWatch(watchId) {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  },

  /**
   * Mock location data for development/fallback
   * @param {number} lat 
   * @param {number} lng 
   * @returns {Object}
   */
  getMockLocationData(lat, lng) {
    // Rough coordinate ranges for major states
    if (lat >= 32.5 && lat <= 42 && lng >= -124.4 && lng <= -114.1) {
      return {
        state: 'California',
        stateAbbreviation: 'CA',
        city: 'Los Angeles',
        formattedAddress: 'Los Angeles, CA, USA',
        coordinates: { latitude: lat, longitude: lng }
      }
    } else if (lat >= 40.4 && lat <= 45.0 && lng >= -79.8 && lng <= -71.8) {
      return {
        state: 'New York',
        stateAbbreviation: 'NY',
        city: 'New York',
        formattedAddress: 'New York, NY, USA',
        coordinates: { latitude: lat, longitude: lng }
      }
    } else if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
      return {
        state: 'Texas',
        stateAbbreviation: 'TX',
        city: 'Houston',
        formattedAddress: 'Houston, TX, USA',
        coordinates: { latitude: lat, longitude: lng }
      }
    } else if (lat >= 24.5 && lat <= 31.0 && lng >= -87.6 && lng <= -80.0) {
      return {
        state: 'Florida',
        stateAbbreviation: 'FL',
        city: 'Miami',
        formattedAddress: 'Miami, FL, USA',
        coordinates: { latitude: lat, longitude: lng }
      }
    } else {
      // Default to California
      return {
        state: 'California',
        stateAbbreviation: 'CA',
        city: 'San Francisco',
        formattedAddress: 'San Francisco, CA, USA',
        coordinates: { latitude: lat, longitude: lng }
      }
    }
  },

  /**
   * Calculate distance between two points
   * @param {number} lat1 
   * @param {number} lng1 
   * @param {number} lat2 
   * @param {number} lng2 
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  /**
   * Convert degrees to radians
   * @param {number} degrees 
   * @returns {number}
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }
}
