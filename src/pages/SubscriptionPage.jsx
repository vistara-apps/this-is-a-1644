import React, { useState } from 'react'
import { Check, Star, Shield, Mic, Globe, Users, Crown, Zap } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

const SubscriptionPage = () => {
  const { subscriptionStatus, updateSubscription, isAuthenticated, signIn } = useUser()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    
    // Mock Stripe checkout process
    setTimeout(() => {
      updateSubscription('premium')
      setLoading(false)
      alert('Successfully upgraded to Premium! 🎉')
    }, 2000)
  }

  const handleDowngrade = async () => {
    if (confirm('Are you sure you want to downgrade to the free plan?')) {
      updateSubscription('free')
      alert('Downgraded to free plan')
    }
  }

  const features = {
    free: [
      'Basic know-your-rights information',
      'Location-based state detection',
      'Limited recording (5 per month)',
      'Basic bilingual scripts',
      'Community support'
    ],
    premium: [
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

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-textPrimary mb-4">
            Choose Your Plan
          </h1>
          <p className="text-textSecondary mb-6">
            Sign in to access subscription features and upgrade options.
          </p>
          
          <form onSubmit={async (e) => {
            e.preventDefault()
            if (email) await signIn(email)
          }} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input w-full"
              required
            />
            <button type="submit" className="btn-primary w-full">
              Sign In to Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-textPrimary mb-4">
          Choose Your Protection Level
        </h1>
        <p className="text-textSecondary max-w-2xl mx-auto">
          Upgrade to Premium for unlimited recording, advanced features, and priority support 
          when you need protection most.
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="card mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            {subscriptionStatus === 'premium' ? (
              <>
                <Crown className="h-8 w-8 text-accent" />
                <div>
                  <h3 className="font-semibold text-textPrimary">Premium Member</h3>
                  <p className="text-sm text-textSecondary">Full access to all features</p>
                </div>
              </>
            ) : (
              <>
                <Shield className="h-8 w-8 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-textPrimary">Free Plan</h3>
                  <p className="text-sm text-textSecondary">Limited features available</p>
                </div>
              </>
            )}
          </div>
          
          {subscriptionStatus === 'premium' ? (
            <button
              onClick={handleDowngrade}
              className="px-4 py-2 text-textSecondary hover:text-textPrimary transition-colors"
            >
              Manage Subscription
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="btn-accent flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>{loading ? 'Processing...' : 'Upgrade Now'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Free Plan */}
        <div className="card relative">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Free Plan</h3>
            <div className="text-3xl font-bold text-textPrimary">
              $0<span className="text-base font-normal text-textSecondary">/month</span>
            </div>
            <p className="text-textSecondary mt-2">Essential rights protection</p>
          </div>
          
          <ul className="space-y-3 mb-6">
            {features.free.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-textPrimary">{feature}</span>
              </li>
            ))}
          </ul>
          
          {subscriptionStatus === 'free' && (
            <div className="text-center py-2 bg-gray-100 rounded-md">
              <span className="text-sm text-textSecondary">Current Plan</span>
            </div>
          )}
        </div>

        {/* Premium Plan */}
        <div className="card relative border-2 border-accent">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-accent text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Premium Plan</h3>
            <div className="text-3xl font-bold text-textPrimary">
              $4.99<span className="text-base font-normal text-textSecondary">/month</span>
            </div>
            <p className="text-textSecondary mt-2">Complete legal protection</p>
          </div>
          
          <ul className="space-y-3 mb-6">
            {features.premium.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-textPrimary">{feature}</span>
              </li>
            ))}
          </ul>
          
          {subscriptionStatus === 'premium' ? (
            <div className="text-center py-3 bg-accent/10 text-accent rounded-md font-medium">
              ✓ Current Plan
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="btn-accent w-full flex items-center justify-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>{loading ? 'Processing...' : 'Upgrade to Premium'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-textPrimary mb-6 text-center">
          Feature Comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-textPrimary">Feature</th>
                <th className="text-center py-3 px-4 font-medium text-textPrimary">Free</th>
                <th className="text-center py-3 px-4 font-medium text-textPrimary">Premium</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="py-3 px-4 text-textPrimary">Monthly recordings</td>
                <td className="text-center py-3 px-4 text-textSecondary">5</td>
                <td className="text-center py-3 px-4 text-accent">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-textPrimary">Emergency contacts</td>
                <td className="text-center py-3 px-4 text-textSecondary">2</td>
                <td className="text-center py-3 px-4 text-accent">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-textPrimary">Cloud storage</td>
                <td className="text-center py-3 px-4 text-textSecondary">Local only</td>
                <td className="text-center py-3 px-4 text-accent">Secure cloud</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 text-textPrimary">Customer support</td>
                <td className="text-center py-3 px-4 text-textSecondary">Community</td>
                <td className="text-center py-3 px-4 text-accent">Priority</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-textPrimary">Export capabilities</td>
                <td className="text-center py-3 px-4 text-textSecondary">Basic</td>
                <td className="text-center py-3 px-4 text-accent">Full export</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="mt-8 text-center text-xs text-textSecondary bg-gray-50 p-4 rounded-lg">
        <p>
          Subscription auto-renews monthly. Cancel anytime in your account settings. 
          All features subject to terms of service. Payment processed securely via Stripe.
        </p>
      </div>
    </div>
  )
}

export default SubscriptionPage