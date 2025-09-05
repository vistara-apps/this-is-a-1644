import React, { createContext, useContext, useState, useEffect } from 'react'

const LocationContext = createContext()

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

// Mock state data for demonstration
const stateData = {
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
  }
}

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null)
  const [currentState, setCurrentState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      setLocation({ latitude, longitude })
      setPermissionGranted(true)

      // Mock reverse geocoding - in production, use Google Geocoding API
      const mockState = await mockReverseGeocode(latitude, longitude)
      setCurrentState(mockState)

    } catch (err) {
      console.error('Error getting location:', err)
      setError('Unable to get location. Please enable location services.')
    } finally {
      setLoading(false)
    }
  }

  // Mock function to simulate reverse geocoding
  const mockReverseGeocode = async (lat, lng) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock state based on rough coordinates
    if (lat >= 32.5 && lat <= 42 && lng >= -124.4 && lng <= -114.1) {
      return 'California'
    } else if (lat >= 40.4 && lat <= 45.0 && lng >= -79.8 && lng <= -71.8) {
      return 'New York'
    } else if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
      return 'Texas'
    } else {
      return 'California' // Default fallback
    }
  }

  const getStateData = () => {
    return currentState ? stateData[currentState] : null
  }

  useEffect(() => {
    // Check if location permission was previously granted
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(permission => {
          if (permission.state === 'granted') {
            requestLocation()
          }
        })
        .catch(console.error)
    }
  }, [])

  const value = {
    location,
    currentState,
    loading,
    error,
    permissionGranted,
    requestLocation,
    getStateData
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}