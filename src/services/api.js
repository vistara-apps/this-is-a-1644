// Comprehensive API service that integrates all backend services
import { userService, incidentService, contactService, rightsService, storageService } from './supabase'
import { aiService } from './openai'
import { locationService } from './location'
import { paymentService } from './stripe'
import { smsService } from './twilio'
import { ipfsService } from './ipfs'

/**
 * Main API service that orchestrates all backend integrations
 * This provides a unified interface for the application to interact with all services
 */
export const apiService = {
  // User Management
  user: {
    async signUp(email, password) {
      try {
        return await userService.signUp(email, password)
      } catch (error) {
        console.error('User signup error:', error)
        throw new Error('Failed to create account. Please try again.')
      }
    },

    async signIn(email, password) {
      try {
        return await userService.signIn(email, password)
      } catch (error) {
        console.error('User signin error:', error)
        throw new Error('Invalid email or password.')
      }
    },

    async signOut() {
      try {
        return await userService.signOut()
      } catch (error) {
        console.error('User signout error:', error)
        throw new Error('Failed to sign out.')
      }
    },

    async getCurrentUser() {
      return await userService.getCurrentUser()
    },

    async getUserProfile(userId) {
      try {
        return await userService.getUserProfile(userId)
      } catch (error) {
        console.error('Get user profile error:', error)
        return null
      }
    },

    async updateProfile(userId, updates) {
      try {
        return await userService.updateUserProfile(userId, updates)
      } catch (error) {
        console.error('Update profile error:', error)
        throw new Error('Failed to update profile.')
      }
    }
  },

  // Location Services
  location: {
    async getCurrentLocation() {
      try {
        const position = await locationService.getCurrentPosition()
        const locationData = await locationService.reverseGeocode(
          position.latitude, 
          position.longitude
        )
        
        return {
          ...position,
          ...locationData
        }
      } catch (error) {
        console.error('Location error:', error)
        throw new Error('Unable to get current location. Please check permissions.')
      }
    },

    async getStateRights(state) {
      return locationService.getStateRightsData(state)
    },

    getSupportedStates() {
      return locationService.getSupportedStates()
    },

    async checkLocationPermission() {
      return await locationService.checkPermissionStatus()
    }
  },

  // Incident Management
  incidents: {
    async createIncident(incidentData, audioBlob = null) {
      try {
        let audioFilePath = null
        let ipfsData = null

        // Upload audio to IPFS if provided
        if (audioBlob) {
          ipfsData = await ipfsService.uploadAudioFile(audioBlob, {
            incidentId: incidentData.incidentId,
            userId: incidentData.user_id
          })
          
          if (ipfsData.success) {
            audioFilePath = ipfsData.ipfsHash
          }
        }

        // Create incident record in database
        const incident = await incidentService.createIncident({
          ...incidentData,
          audio_file_path: audioFilePath
        })

        // Create shareable incident card on IPFS
        if (incident && ipfsData) {
          const cardData = await ipfsService.createShareableIncidentCard(
            incident,
            { formattedAddress: incidentData.location_address },
            ipfsData.ipfsHash
          )
          
          // Update incident with shareable URL
          if (cardData.success) {
            await incidentService.updateIncident(incident.id, {
              shareable_url: ipfsService.generateShareableUrl(cardData.ipfsHash)
            })
          }
        }

        return {
          incident,
          ipfsData,
          success: true
        }
      } catch (error) {
        console.error('Create incident error:', error)
        throw new Error('Failed to save incident. Please try again.')
      }
    },

    async getUserIncidents(userId) {
      try {
        return await incidentService.getUserIncidents(userId)
      } catch (error) {
        console.error('Get incidents error:', error)
        return []
      }
    },

    async updateIncident(incidentId, updates) {
      try {
        return await incidentService.updateIncident(incidentId, updates)
      } catch (error) {
        console.error('Update incident error:', error)
        throw new Error('Failed to update incident.')
      }
    },

    async deleteIncident(incidentId) {
      try {
        return await incidentService.deleteIncident(incidentId)
      } catch (error) {
        console.error('Delete incident error:', error)
        throw new Error('Failed to delete incident.')
      }
    },

    async shareIncident(incidentId, contacts) {
      try {
        const incident = await incidentService.getIncident(incidentId)
        if (!incident) {
          throw new Error('Incident not found')
        }

        // Send SMS alerts to emergency contacts
        const smsResults = await smsService.sendIncidentLink(
          contacts,
          incident,
          incident.shareable_url
        )

        // Update incident as shared
        await incidentService.updateIncident(incidentId, {
          shared_with_contacts: true
        })

        return {
          success: true,
          smsResults,
          sharedUrl: incident.shareable_url
        }
      } catch (error) {
        console.error('Share incident error:', error)
        throw new Error('Failed to share incident.')
      }
    }
  },

  // Emergency Contacts
  contacts: {
    async getEmergencyContacts(userId) {
      try {
        return await contactService.getEmergencyContacts(userId)
      } catch (error) {
        console.error('Get contacts error:', error)
        return []
      }
    },

    async addEmergencyContact(userId, contactData) {
      try {
        // Validate phone number
        if (!smsService.isValidPhoneNumber(contactData.phone)) {
          throw new Error('Invalid phone number format')
        }

        return await contactService.addEmergencyContact(userId, contactData)
      } catch (error) {
        console.error('Add contact error:', error)
        throw new Error('Failed to add emergency contact.')
      }
    },

    async updateEmergencyContact(contactId, updates) {
      try {
        if (updates.phone && !smsService.isValidPhoneNumber(updates.phone)) {
          throw new Error('Invalid phone number format')
        }

        return await contactService.updateEmergencyContact(contactId, updates)
      } catch (error) {
        console.error('Update contact error:', error)
        throw new Error('Failed to update contact.')
      }
    },

    async deleteEmergencyContact(contactId) {
      try {
        return await contactService.deleteEmergencyContact(contactId)
      } catch (error) {
        console.error('Delete contact error:', error)
        throw new Error('Failed to delete contact.')
      }
    }
  },

  // AI-Powered Features
  ai: {
    async generateScript(scenario, state, language = 'english', context = {}) {
      try {
        return await aiService.generateScript(scenario, state, language, context)
      } catch (error) {
        console.error('Generate script error:', error)
        // Return fallback script
        return "I am exercising my right to remain silent and would like to speak with an attorney."
      }
    },

    async generateIncidentSummary(incident, language = 'english') {
      try {
        return await aiService.generateIncidentSummary(incident, language)
      } catch (error) {
        console.error('Generate summary error:', error)
        return `Incident documented on ${new Date(incident.timestamp).toLocaleString()}`
      }
    },

    async generateRightsGuide(state, language = 'english', scenarios = ['traffic', 'questioning']) {
      try {
        return await aiService.generateRightsGuide(state, language, scenarios)
      } catch (error) {
        console.error('Generate rights guide error:', error)
        return locationService.getStateRightsData(state)
      }
    }
  },

  // Payment & Subscription
  payments: {
    async createSubscription(customerEmail) {
      try {
        return await paymentService.createSubscription(customerEmail)
      } catch (error) {
        console.error('Create subscription error:', error)
        throw new Error('Failed to process payment. Please try again.')
      }
    },

    async cancelSubscription(subscriptionId) {
      try {
        return await paymentService.cancelSubscription(subscriptionId)
      } catch (error) {
        console.error('Cancel subscription error:', error)
        throw new Error('Failed to cancel subscription.')
      }
    },

    async getSubscriptionStatus(subscriptionId) {
      try {
        return await paymentService.getSubscriptionStatus(subscriptionId)
      } catch (error) {
        console.error('Get subscription status error:', error)
        return null
      }
    },

    getPricingInfo() {
      return paymentService.getPricingInfo()
    }
  },

  // Emergency Alerts
  alerts: {
    async sendEmergencyAlert(contacts, incident, location) {
      try {
        return await smsService.sendEmergencyAlert(contacts, incident, location)
      } catch (error) {
        console.error('Send emergency alert error:', error)
        throw new Error('Failed to send emergency alerts.')
      }
    },

    async sendLocationUpdate(contacts, location, message = '') {
      try {
        return await smsService.sendLocationUpdate(contacts, location, message)
      } catch (error) {
        console.error('Send location update error:', error)
        throw new Error('Failed to send location update.')
      }
    }
  },

  // File Storage & IPFS
  storage: {
    async uploadAudioFile(audioBlob, metadata = {}) {
      try {
        return await ipfsService.uploadAudioFile(audioBlob, metadata)
      } catch (error) {
        console.error('Upload audio error:', error)
        throw new Error('Failed to upload audio file.')
      }
    },

    async createShareableIncidentCard(incident, location, audioIpfsHash = null) {
      try {
        return await ipfsService.createShareableIncidentCard(incident, location, audioIpfsHash)
      } catch (error) {
        console.error('Create shareable card error:', error)
        throw new Error('Failed to create shareable incident card.')
      }
    },

    async retrieveFile(ipfsHash) {
      try {
        return await ipfsService.retrieveFile(ipfsHash)
      } catch (error) {
        console.error('Retrieve file error:', error)
        throw new Error('Failed to retrieve file.')
      }
    },

    generateShareableUrl(ipfsHash) {
      return ipfsService.generateShareableUrl(ipfsHash)
    }
  },

  // Utility Functions
  utils: {
    formatPhoneNumber(phoneNumber) {
      return smsService.formatPhoneNumber(phoneNumber)
    },

    isValidPhoneNumber(phoneNumber) {
      return smsService.isValidPhoneNumber(phoneNumber)
    },

    isValidIpfsHash(hash) {
      return ipfsService.isValidIpfsHash(hash)
    },

    formatPrice(amount, currency = 'usd') {
      return paymentService.formatPrice(amount, currency)
    },

    calculateDistance(lat1, lng1, lat2, lng2) {
      return locationService.calculateDistance(lat1, lng1, lat2, lng2)
    }
  },

  // Health Check
  async healthCheck() {
    const services = {
      supabase: false,
      openai: false,
      location: false,
      stripe: false,
      twilio: false,
      ipfs: false
    }

    try {
      // Check Supabase
      await userService.getCurrentUser()
      services.supabase = true
    } catch (error) {
      console.warn('Supabase health check failed:', error.message)
    }

    try {
      // Check OpenAI
      await aiService.generateScript('questioning', 'California', 'english')
      services.openai = true
    } catch (error) {
      console.warn('OpenAI health check failed:', error.message)
    }

    try {
      // Check Location services
      locationService.isGeolocationSupported()
      services.location = true
    } catch (error) {
      console.warn('Location health check failed:', error.message)
    }

    try {
      // Check Stripe
      paymentService.getPricingInfo()
      services.stripe = true
    } catch (error) {
      console.warn('Stripe health check failed:', error.message)
    }

    try {
      // Check Twilio
      smsService.isValidPhoneNumber('+1234567890')
      services.twilio = true
    } catch (error) {
      console.warn('Twilio health check failed:', error.message)
    }

    try {
      // Check IPFS
      ipfsService.isValidIpfsHash('QmTest')
      services.ipfs = true
    } catch (error) {
      console.warn('IPFS health check failed:', error.message)
    }

    return {
      timestamp: new Date().toISOString(),
      services,
      allHealthy: Object.values(services).every(status => status)
    }
  }
}

// Export individual services for direct access if needed
export {
  userService,
  incidentService,
  contactService,
  rightsService,
  storageService,
  aiService,
  locationService,
  paymentService,
  smsService,
  ipfsService
}

// Configuration check
export const checkConfiguration = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_TWILIO_ACCOUNT_SID',
    'VITE_TWILIO_AUTH_TOKEN',
    'VITE_PINATA_API_KEY',
    'VITE_PINATA_SECRET_API_KEY'
  ]

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    console.warn('Some features may not work properly. Check your .env file.')
  }

  return {
    configured: missing.length === 0,
    missing,
    total: requiredEnvVars.length,
    configured_count: requiredEnvVars.length - missing.length
  }
}
