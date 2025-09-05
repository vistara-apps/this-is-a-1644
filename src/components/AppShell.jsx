import React from 'react'
import { useLocation as useRouterLocation, Link } from 'react-router-dom'
import { Shield, Home, Mic, Settings, MapPin } from 'lucide-react'
import { useLocation } from '../contexts/LocationContext'
import { useUser } from '../contexts/UserContext'

const AppShell = ({ children }) => {
  const routerLocation = useRouterLocation()
  const { currentState, permissionGranted } = useLocation()
  const { isAuthenticated, subscriptionStatus } = useUser()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Rights', href: '/rights', icon: Shield },
    { name: 'Record', href: '/record', icon: Mic },
    { name: 'Settings', href: '/subscription', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-textPrimary">Pocket Rights</h1>
                <p className="text-sm text-textSecondary hidden sm:block">
                  Your legal rights, instantly accessible
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {permissionGranted && currentState && (
                <div className="flex items-center space-x-2 text-sm text-textSecondary">
                  <MapPin className="h-4 w-4" />
                  <span>{currentState}</span>
                </div>
              )}
              
              {isAuthenticated && (
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-textSecondary">
                    {subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    subscriptionStatus === 'premium' ? 'bg-accent' : 'bg-gray-400'
                  }`} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t sm:hidden">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = routerLocation.pathname === item.href
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Side Navigation - Desktop */}
      <nav className="hidden sm:fixed sm:left-0 sm:top-16 sm:bottom-0 sm:w-64 sm:bg-surface sm:border-r sm:block">
        <div className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = routerLocation.pathname === item.href
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'text-primary bg-primary/10' 
                        : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Content offset for desktop sidebar */}
      <style jsx>{`
        @media (min-width: 640px) {
          main {
            margin-left: 16rem;
          }
        }
      `}</style>
    </div>
  )
}

export default AppShell