import React, { useState } from 'react'
import { Plus, Trash2, Phone, Mail } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

const AlertSettings = ({ variant = 'contact-selection' }) => {
  const { emergencyContacts, addEmergencyContact, removeEmergencyContact } = useUser()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: ''
  })

  const handleAddContact = (e) => {
    e.preventDefault()
    if (newContact.name && (newContact.phone || newContact.email)) {
      addEmergencyContact(newContact)
      setNewContact({ name: '', phone: '', email: '', relationship: '' })
      setShowAddForm(false)
    }
  }

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  if (variant === 'notification-triggers') {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Alert Triggers</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div>
              <p className="font-medium text-textPrimary">Auto-alert on recording start</p>
              <p className="text-sm text-textSecondary">Notify contacts when recording begins</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div>
              <p className="font-medium text-textPrimary">Location sharing</p>
              <p className="text-sm text-textSecondary">Share real-time location with contacts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Emergency Contacts</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add Contact</span>
        </button>
      </div>

      {emergencyContacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-textSecondary mb-4">No emergency contacts added yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-medium text-textPrimary">{contact.name}</p>
                <div className="flex items-center space-x-4 mt-1">
                  {contact.phone && (
                    <div className="flex items-center space-x-1 text-sm text-textSecondary">
                      <Phone className="h-3 w-3" />
                      <span>{formatPhone(contact.phone)}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center space-x-1 text-sm text-textSecondary">
                      <Mail className="h-3 w-3" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                </div>
                {contact.relationship && (
                  <p className="text-xs text-textSecondary mt-1">{contact.relationship}</p>
                )}
              </div>
              <button
                onClick={() => removeEmergencyContact(contact.id)}
                className="p-2 hover:bg-red-50 rounded-md transition-colors"
                title="Remove contact"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Add Emergency Contact</h4>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="input w-full"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                  className="input w-full"
                  placeholder="e.g., Spouse, Friend, Lawyer"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-textSecondary hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertSettings