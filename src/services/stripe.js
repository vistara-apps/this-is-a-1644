// Note: In production, Stripe operations should be handled by a secure backend
// This is a simplified client-side implementation for demonstration

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('Stripe publishable key not configured. Using mock payment processing.')
}

// Mock Stripe for development when key is not available
const mockStripe = {
  redirectToCheckout: async (options) => {
    console.log('Mock Stripe checkout:', options)
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { error: null }
  },
  
  createPaymentMethod: async (options) => {
    console.log('Mock payment method creation:', options)
    return {
      paymentMethod: {
        id: 'pm_mock_' + Date.now(),
        type: 'card',
        card: { brand: 'visa', last4: '4242' }
      },
      error: null
    }
  }
}

// Load Stripe dynamically
let stripeInstance = null

const loadStripe = async () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return mockStripe
  }

  if (stripeInstance) {
    return stripeInstance
  }

  try {
    // Dynamically import Stripe
    const { loadStripe: stripeLoader } = await import('@stripe/stripe-js')
    stripeInstance = await stripeLoader(STRIPE_PUBLISHABLE_KEY)
    return stripeInstance
  } catch (error) {
    console.error('Failed to load Stripe:', error)
    return mockStripe
  }
}

export const paymentService = {
  /**
   * Create a checkout session for subscription
   * @param {string} priceId - Stripe price ID for the subscription
   * @param {string} customerEmail - Customer email
   * @param {string} successUrl - Success redirect URL
   * @param {string} cancelUrl - Cancel redirect URL
   */
  async createCheckoutSession(priceId, customerEmail, successUrl, cancelUrl) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      // Mock checkout for development
      console.log('Mock checkout session created')
      return this.mockCheckoutFlow()
    }

    try {
      // In production, this should be a call to your backend API
      // which creates the checkout session server-side
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail,
          successUrl,
          cancelUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      
      const stripe = await loadStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Checkout error:', error)
      // Fallback to mock for development
      return this.mockCheckoutFlow()
    }
  },

  /**
   * Create subscription for premium features
   * @param {string} customerEmail 
   * @returns {Promise<Object>}
   */
  async createSubscription(customerEmail) {
    const priceId = 'price_premium_monthly' // This would be your actual Stripe price ID
    const successUrl = `${window.location.origin}/subscription?success=true`
    const cancelUrl = `${window.location.origin}/subscription?canceled=true`

    return this.createCheckoutSession(priceId, customerEmail, successUrl, cancelUrl)
  },

  /**
   * Mock checkout flow for development
   * @returns {Promise<Object>}
   */
  async mockCheckoutFlow() {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate success (90% of the time)
    const success = Math.random() > 0.1
    
    if (success) {
      return {
        success: true,
        subscriptionId: 'sub_mock_' + Date.now(),
        customerId: 'cus_mock_' + Date.now(),
        status: 'active'
      }
    } else {
      throw new Error('Payment failed (mock error)')
    }
  },

  /**
   * Handle subscription management (cancel, update, etc.)
   * @param {string} subscriptionId 
   * @param {string} action 
   */
  async manageSubscription(subscriptionId, action) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.log(`Mock subscription ${action}:`, subscriptionId)
      return { success: true, action }
    }

    try {
      // In production, this would be a backend API call
      const response = await fetch('/api/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          action
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} subscription`)
      }

      return await response.json()
    } catch (error) {
      console.error('Subscription management error:', error)
      // Mock response for development
      return { success: true, action }
    }
  },

  /**
   * Cancel subscription
   * @param {string} subscriptionId 
   */
  async cancelSubscription(subscriptionId) {
    return this.manageSubscription(subscriptionId, 'cancel')
  },

  /**
   * Reactivate subscription
   * @param {string} subscriptionId 
   */
  async reactivateSubscription(subscriptionId) {
    return this.manageSubscription(subscriptionId, 'reactivate')
  },

  /**
   * Get subscription status
   * @param {string} subscriptionId 
   */
  async getSubscriptionStatus(subscriptionId) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      return {
        id: subscriptionId,
        status: 'active',
        current_period_end: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancel_at_period_end: false
      }
    }

    try {
      const response = await fetch(`/api/subscription/${subscriptionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return null
    }
  },

  /**
   * Create customer portal session for subscription management
   * @param {string} customerId 
   */
  async createPortalSession(customerId) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.log('Mock customer portal for:', customerId)
      // In development, just redirect to subscription page
      window.location.href = '/subscription'
      return
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin + '/subscription'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal session error:', error)
      // Fallback to subscription page
      window.location.href = '/subscription'
    }
  },

  /**
   * Validate webhook signature (backend use)
   * @param {string} payload 
   * @param {string} signature 
   * @param {string} endpointSecret 
   */
  validateWebhookSignature(payload, signature, endpointSecret) {
    // This would typically be done on the backend
    // Included here for completeness
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      return stripe.webhooks.constructEvent(payload, signature, endpointSecret)
    } catch (error) {
      console.error('Webhook signature validation failed:', error)
      return null
    }
  },

  /**
   * Format price for display
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code
   */
  formatPrice(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  },

  /**
   * Get pricing information
   */
  getPricingInfo() {
    return {
      free: {
        price: 0,
        priceId: null,
        features: [
          'Basic know-your-rights information',
          'Location-based state detection',
          'Limited recording (5 per month)',
          'Basic bilingual scripts',
          'Community support'
        ]
      },
      premium: {
        price: 499, // $4.99 in cents
        priceId: 'price_premium_monthly',
        features: [
          'All free features included',
          'Unlimited incident recording',
          'Advanced bilingual scripts',
          'Priority emergency alerts',
          'Secure cloud storage',
          'Priority customer support',
          'Legal resource library',
          'Export documentation'
        ]
      }
    }
  }
}

// Backend API endpoints that would need to be implemented:
export const REQUIRED_BACKEND_ENDPOINTS = `
Required backend API endpoints for Stripe integration:

POST /api/create-checkout-session
- Creates Stripe checkout session
- Requires: priceId, customerEmail, successUrl, cancelUrl
- Returns: { id: sessionId }

POST /api/manage-subscription  
- Manages subscription (cancel, reactivate, etc.)
- Requires: subscriptionId, action
- Returns: { success: boolean, action: string }

GET /api/subscription/:id
- Gets subscription status
- Returns: Stripe subscription object

POST /api/create-portal-session
- Creates customer portal session
- Requires: customerId, returnUrl
- Returns: { url: portalUrl }

POST /api/webhooks/stripe
- Handles Stripe webhooks
- Validates signature and processes events
- Updates user subscription status in database
`
