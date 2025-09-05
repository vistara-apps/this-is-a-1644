import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState('free') // 'free', 'premium'
  const [preferredLanguage, setPreferredLanguage] = useState('english')
  const [emergencyContacts, setEmergencyContacts] = useState([])

  // Mock user authentication
  const signIn = async (email) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser = {
      userId: 'user_123',
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setUser(mockUser)
    localStorage.setItem('pocketRights_user', JSON.stringify(mockUser))
  }

  const signOut = () => {
    setUser(null)
    setSubscriptionStatus('free')
    localStorage.removeItem('pocketRights_user')
  }

  const updateSubscription = (status) => {
    setSubscriptionStatus(status)
    localStorage.setItem('pocketRights_subscription', status)
  }

  const addEmergencyContact = (contact) => {
    const newContact = {
      id: Date.now().toString(),
      ...contact
    }
    const updatedContacts = [...emergencyContacts, newContact]
    setEmergencyContacts(updatedContacts)
    localStorage.setItem('pocketRights_emergencyContacts', JSON.stringify(updatedContacts))
  }

  const removeEmergencyContact = (contactId) => {
    const updatedContacts = emergencyContacts.filter(contact => contact.id !== contactId)
    setEmergencyContacts(updatedContacts)
    localStorage.setItem('pocketRights_emergencyContacts', JSON.stringify(updatedContacts))
  }

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pocketRights_user')
    const savedSubscription = localStorage.getItem('pocketRights_subscription')
    const savedContacts = localStorage.getItem('pocketRights_emergencyContacts')
    const savedLanguage = localStorage.getItem('pocketRights_language')

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedSubscription) {
      setSubscriptionStatus(savedSubscription)
    }
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts))
    }
    if (savedLanguage) {
      setPreferredLanguage(savedLanguage)
    }
  }, [])

  // Save language preference
  useEffect(() => {
    localStorage.setItem('pocketRights_language', preferredLanguage)
  }, [preferredLanguage])

  const value = {
    user,
    subscriptionStatus,
    preferredLanguage,
    emergencyContacts,
    signIn,
    signOut,
    updateSubscription,
    setPreferredLanguage,
    addEmergencyContact,
    removeEmergencyContact,
    isAuthenticated: !!user,
    isPremium: subscriptionStatus === 'premium'
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}