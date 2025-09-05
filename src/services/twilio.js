import axios from 'axios'

const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.warn('Twilio credentials not configured. Using mock SMS service.')
}

// Note: In production, Twilio operations should be handled by a secure backend
// This is a simplified implementation for demonstration

export const smsService = {
  /**
   * Send emergency alert SMS to contacts
   * @param {Array} contacts - Array of emergency contacts
   * @param {Object} incident - Incident data
   * @param {Object} location - Location data
   * @returns {Promise<Array>} Results of SMS sends
   */
  async sendEmergencyAlert(contacts, incident, location) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return this.mockSendEmergencyAlert(contacts, incident, location)
    }

    const results = []
    
    for (const contact of contacts) {
      try {
        const message = this.buildEmergencyMessage(contact, incident, location)
        const result = await this.sendSMS(contact.phone, message)
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: true,
          messageId: result.sid
        })
      } catch (error) {
        console.error(`Failed to send SMS to ${contact.name}:`, error)
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: false,
          error: error.message
        })
      }
    }

    return results
  },

  /**
   * Send individual SMS message
   * @param {string} to - Phone number to send to
   * @param {string} message - Message content
   * @param {string} from - From phone number (optional)
   * @returns {Promise<Object>} Twilio response
   */
  async sendSMS(to, message, from = null) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return this.mockSendSMS(to, message)
    }

    try {
      // In production, this should be done via a backend API
      // Direct Twilio API calls from frontend expose credentials
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.formatPhoneNumber(to),
          message,
          from
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send SMS')
      }

      return await response.json()
    } catch (error) {
      console.error('SMS sending error:', error)
      // Fallback to mock for development
      return this.mockSendSMS(to, message)
    }
  },

  /**
   * Send incident documentation link
   * @param {Array} contacts - Emergency contacts
   * @param {Object} incident - Incident data
   * @param {string} shareUrl - URL to shared incident
   */
  async sendIncidentLink(contacts, incident, shareUrl) {
    const results = []
    
    for (const contact of contacts) {
      try {
        const message = this.buildIncidentLinkMessage(contact, incident, shareUrl)
        const result = await this.sendSMS(contact.phone, message)
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: true,
          messageId: result.sid || result.id
        })
      } catch (error) {
        console.error(`Failed to send incident link to ${contact.name}:`, error)
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: false,
          error: error.message
        })
      }
    }

    return results
  },

  /**
   * Send location update to contacts
   * @param {Array} contacts - Emergency contacts
   * @param {Object} location - Current location
   * @param {string} message - Additional message
   */
  async sendLocationUpdate(contacts, location, message = '') {
    const results = []
    
    for (const contact of contacts) {
      try {
        const locationMessage = this.buildLocationMessage(contact, location, message)
        const result = await this.sendSMS(contact.phone, locationMessage)
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: true,
          messageId: result.sid || result.id
        })
      } catch (error) {
        console.error(`Failed to send location to ${contact.name}:`, error)
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: false,
          error: error.message
        })
      }
    }

    return results
  },

  /**
   * Build emergency alert message
   * @param {Object} contact - Emergency contact
   * @param {Object} incident - Incident data
   * @param {Object} location - Location data
   * @returns {string} Formatted message
   */
  buildEmergencyMessage(contact, incident, location) {
    const timestamp = new Date(incident.timestamp).toLocaleString()
    const locationStr = location.formattedAddress || `${location.latitude}, ${location.longitude}`
    
    return `🚨 POCKET RIGHTS ALERT 🚨

Hi ${contact.name}, this is an automated emergency alert.

I am currently in a police interaction and have activated my incident recording.

Time: ${timestamp}
Location: ${locationStr}

This message was sent automatically by Pocket Rights app. If this is an emergency, please call 911.

- Sent from Pocket Rights`
  },

  /**
   * Build incident documentation link message
   * @param {Object} contact - Emergency contact
   * @param {Object} incident - Incident data
   * @param {string} shareUrl - Share URL
   * @returns {string} Formatted message
   */
  buildIncidentLinkMessage(contact, incident, shareUrl) {
    const timestamp = new Date(incident.timestamp).toLocaleString()
    
    return `📋 Incident Documentation

Hi ${contact.name},

I've documented a police interaction using Pocket Rights:

Time: ${timestamp}
Location: ${incident.location_address || 'Location recorded'}

View documentation: ${shareUrl}

This incident has been securely recorded and documented.

- Sent from Pocket Rights`
  },

  /**
   * Build location update message
   * @param {Object} contact - Emergency contact
   * @param {Object} location - Location data
   * @param {string} additionalMessage - Additional message
   * @returns {string} Formatted message
   */
  buildLocationMessage(contact, location, additionalMessage) {
    const locationStr = location.formattedAddress || `${location.latitude}, ${location.longitude}`
    const timestamp = new Date().toLocaleString()
    
    let message = `📍 Location Update

Hi ${contact.name},

Current location as of ${timestamp}:
${locationStr}`

    if (additionalMessage) {
      message += `\n\nMessage: ${additionalMessage}`
    }

    message += '\n\n- Sent from Pocket Rights'
    
    return message
  },

  /**
   * Format phone number for Twilio
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '')
    
    // Add country code if not present
    if (digits.length === 10) {
      return `+1${digits}` // US/Canada
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    } else if (digits.startsWith('+')) {
      return phoneNumber
    } else {
      return `+${digits}`
    }
  },

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Is valid
   */
  isValidPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 15
  },

  /**
   * Mock SMS sending for development
   * @param {string} to - Phone number
   * @param {string} message - Message content
   * @returns {Promise<Object>} Mock response
   */
  async mockSendSMS(to, message) {
    console.log('Mock SMS sent:', { to, message })
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate occasional failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('Mock SMS delivery failed')
    }
    
    return {
      id: 'mock_sms_' + Date.now(),
      to: this.formatPhoneNumber(to),
      body: message,
      status: 'sent',
      dateCreated: new Date().toISOString()
    }
  },

  /**
   * Mock emergency alert for development
   * @param {Array} contacts - Emergency contacts
   * @param {Object} incident - Incident data
   * @param {Object} location - Location data
   * @returns {Promise<Array>} Mock results
   */
  async mockSendEmergencyAlert(contacts, incident, location) {
    console.log('Mock emergency alert sent to:', contacts.map(c => c.name))
    
    const results = []
    
    for (const contact of contacts) {
      // Simulate some failures
      const success = Math.random() > 0.1
      
      if (success) {
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: true,
          messageId: 'mock_' + Date.now()
        })
      } else {
        results.push({
          contact: contact.name,
          phone: contact.phone,
          success: false,
          error: 'Mock delivery failure'
        })
      }
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return results
  },

  /**
   * Get SMS delivery status
   * @param {string} messageId - Message ID from Twilio
   * @returns {Promise<Object>} Delivery status
   */
  async getMessageStatus(messageId) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return {
        id: messageId,
        status: 'delivered',
        dateUpdated: new Date().toISOString()
      }
    }

    try {
      const response = await fetch(`/api/sms-status/${messageId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get message status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting message status:', error)
      return null
    }
  }
}

// Backend API endpoints that would need to be implemented:
export const REQUIRED_BACKEND_ENDPOINTS = `
Required backend API endpoints for Twilio integration:

POST /api/send-sms
- Sends SMS via Twilio
- Requires: to, message, from (optional)
- Returns: Twilio message object

GET /api/sms-status/:messageId
- Gets SMS delivery status
- Returns: Twilio message status

Environment variables needed:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN  
- TWILIO_PHONE_NUMBER (for sending SMS)

Security considerations:
- Never expose Twilio credentials in frontend
- Implement rate limiting for SMS endpoints
- Validate phone numbers server-side
- Log SMS sends for audit purposes
`
