import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Shield, Mic, ArrowRight, Star, Lock } from 'lucide-react'
import { useLocation } from '../contexts/LocationContext'
import { useUser } from '../contexts/UserContext'
import { useRecording } from '../contexts/RecordingContext'

const HomePage = () => {
  const { currentState, permissionGranted, requestLocation, loading } = useLocation()
  const { isAuthenticated, signIn, subscriptionStatus } = useUser()
  const { recordedIncidents } = useRecording()
  const [email, setEmail] = React.useState('')

  useEffect(() => {
    if (!permissionGranted && !loading) {
      requestLocation()
    }
  }, [])

  const handleQuickSignIn = async (e) => {
    e.preventDefault()
    if (email) {
      await signIn(email)
    }
  }

  const features = [
    {
      icon: Shield,
      title: 'Know Your Rights',
      description: 'State-specific legal rights information for police interactions',
      link: '/rights'
    },
    {
      icon: Mic,
      title: 'Quick Recording',
      description: 'Discreet incident documentation with location and timestamp',
      link: '/record'
    },
    {
      icon: MapPin,
      title: 'Location-Based',
      description: 'Automatically detects your state for relevant legal information'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pb-20 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-textPrimary mb-4">
            Pocket Rights
          </h1>
          <p className="text-xl text-textSecondary mb-8 max-w-2xl mx-auto">
            Your legal rights, instantly accessible and shareable. 
            Stay informed and protected during law enforcement interactions.
          </p>

          {/* Location Status */}
          <div className="inline-flex items-center space-x-2 bg-surface px-4 py-2 rounded-full shadow-sm mb-8">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm text-textPrimary">
              {loading ? 'Detecting location...' : 
               currentState ? `Rights for ${currentState}` : 
               'Enable location for state-specific rights'}
            </span>
          </div>
        </div>

        {/* Quick Access Card */}
        {isAuthenticated ? (
          <div className="card mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-textPrimary mb-2">
                  Welcome back! 👋
                </h2>
                <p className="text-textSecondary text-sm mb-4 sm:mb-0">
                  {subscriptionStatus === 'premium' ? '⭐ Premium Member' : 'Free Account'} • 
                  {recordedIncidents.length} recorded incidents
                </p>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <Link to="/rights" className="btn-primary flex-1 sm:flex-none">
                  View Rights
                </Link>
                <Link to="/record" className="btn-accent flex-1 sm:flex-none">
                  Start Recording
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card mb-8">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-textPrimary mb-4">
                Get Started with Pocket Rights
              </h2>
              <form onSubmit={handleQuickSignIn} className="max-w-sm mx-auto">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 input"
                    required
                  />
                  <button type="submit" className="btn-primary">
                    Sign In
                  </button>
                </div>
              </form>
              <p className="text-xs text-textSecondary mt-2">
                Quick access to your rights and recording features
              </p>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-textPrimary">{feature.title}</h3>
                </div>
                <p className="text-textSecondary text-sm mb-4">{feature.description}</p>
                {feature.link && (
                  <Link 
                    to={feature.link}
                    className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Premium Features */}
        <div className="card bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:flex-1 mb-6 lg:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-semibold text-textPrimary">Premium Features</h3>
              </div>
              <p className="text-textSecondary mb-4">
                Unlock unlimited recording, advanced scripting, and multi-language support for just $4.99/month.
              </p>
              <ul className="space-y-2 text-sm text-textPrimary">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Unlimited incident recording</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Advanced bilingual scripts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>Priority customer support</span>
                </li>
              </ul>
            </div>
            <div className="lg:ml-8">
              <Link 
                to="/subscription"
                className="btn-accent flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Upgrade to Premium</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <span className="font-medium">🚨 Emergency:</span>
            <span>Call 911 for immediate assistance</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage