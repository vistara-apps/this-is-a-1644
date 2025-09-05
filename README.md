# Pocket Rights

**Your legal rights, instantly accessible and shareable.**

A mobile-first web application providing on-demand, location-based legal rights information and documentation tools for interactions with law enforcement.

## 🚀 Features

### Core Features
- **Real-time State-Specific Know-Your-Rights**: Location-based legal rights information tailored to your current state
- **Bilingual Script & Action Guides**: Pre-written scripts in English and Spanish for common law enforcement scenarios
- **One-Tap Incident Recording & Sharing**: Discreet audio recording with location and timestamp data
- **Customizable Alert & Share Features**: Emergency contact notifications and incident sharing capabilities

### Technical Features
- **AI-Powered Script Generation**: OpenAI integration for contextual legal scripts
- **Secure Cloud Storage**: Supabase backend with Row Level Security
- **Decentralized File Storage**: IPFS/Pinata integration for immutable incident documentation
- **Emergency SMS Alerts**: Twilio integration for emergency contact notifications
- **Subscription Management**: Stripe integration for premium features
- **Real-time Location Services**: Google Geocoding API for accurate state detection

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend Services
- **Supabase** - Database, authentication, and file storage
- **OpenAI API** - AI-powered script generation
- **Google Geocoding API** - Location services
- **Stripe** - Payment processing
- **Twilio** - SMS notifications
- **Pinata/IPFS** - Decentralized file storage

## 📋 Prerequisites

Before setting up the project, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Accounts and API keys for the following services:
  - Supabase
  - OpenAI
  - Google Cloud (for Geocoding API)
  - Stripe
  - Twilio
  - Pinata (for IPFS)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-1644.git
cd this-is-a-1644
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your_openai_api_key

# Google Maps/Geocoding API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Twilio Configuration
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Pinata/IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key

# App Configuration
VITE_APP_NAME=Pocket Rights
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

### 4. Database Setup

#### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the database schema from `src/services/supabase.js` (the `SCHEMA_SQL` constant)
4. Create a storage bucket named `audio-recordings` for file uploads

#### Database Schema

The application uses the following tables:
- `users` - User profiles and preferences
- `recorded_incidents` - Incident documentation
- `rights_guides` - State-specific legal information
- `emergency_contacts` - User emergency contacts

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration Guide

### Service Configuration

#### Supabase
1. Create project and get URL + anon key
2. Enable Row Level Security on all tables
3. Create storage bucket for audio files
4. Configure authentication providers if needed

#### OpenAI
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Ensure you have access to GPT-3.5-turbo or GPT-4
3. Monitor usage and set billing limits

#### Google Geocoding API
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Geocoding API
3. Create API key and restrict to Geocoding API
4. Set up billing (required for production use)

#### Stripe
1. Create account at [Stripe](https://stripe.com)
2. Get publishable key from dashboard
3. Create products and prices for subscription plans
4. Set up webhooks for subscription events (production)

#### Twilio
1. Create account at [Twilio](https://twilio.com)
2. Get Account SID and Auth Token
3. Purchase phone number for SMS sending
4. Verify phone numbers in development mode

#### Pinata (IPFS)
1. Create account at [Pinata](https://pinata.cloud)
2. Get API key and secret from dashboard
3. Configure IPFS gateway settings
4. Set up billing for storage usage

## 🏗️ Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── pages/              # Page components
├── services/           # API service layer
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

### Service Layer
- **API Service** (`src/services/api.js`) - Main orchestration layer
- **Supabase Service** - Database and authentication
- **OpenAI Service** - AI script generation
- **Location Service** - GPS and geocoding
- **Stripe Service** - Payment processing
- **Twilio Service** - SMS notifications
- **IPFS Service** - Decentralized storage

### Data Flow
1. User interacts with React components
2. Components call API service methods
3. API service orchestrates multiple backend services
4. Data flows back through contexts to update UI

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different API keys for development/production
- Rotate API keys regularly

### API Security
- All Supabase operations use Row Level Security
- Stripe operations should be server-side in production
- Twilio credentials should be server-side only
- OpenAI API calls should be rate-limited

### Data Privacy
- Audio recordings are stored on IPFS for immutability
- Personal data is encrypted in Supabase
- Location data is only stored with user consent
- Emergency contacts are protected by RLS policies

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure all production API keys are configured:
- Use production Supabase project
- Use live Stripe keys
- Use production Twilio account
- Configure proper CORS settings

### Deployment Platforms

The app can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **AWS Amplify**
- **Firebase Hosting**

### Backend Requirements

For production, you'll need to implement backend endpoints for:
- Stripe webhook handling
- Twilio SMS sending
- OpenAI API proxying (optional, for security)

## 📱 Mobile Considerations

### Progressive Web App (PWA)
- Add service worker for offline functionality
- Configure web app manifest
- Implement push notifications

### Mobile Permissions
- Location access for state detection
- Microphone access for recording
- Storage access for local caching

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- Unit tests for service functions
- Integration tests for API calls
- E2E tests for critical user flows

## 📊 Monitoring

### Health Checks
The app includes a health check system:

```javascript
import { apiService } from './src/services/api'

// Check all service health
const health = await apiService.healthCheck()
console.log(health)
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Legal Disclaimer

This application provides educational information about legal rights and is not a substitute for professional legal advice. Users should consult with qualified attorneys for specific legal guidance. The app developers are not responsible for the accuracy of legal information or outcomes of its use.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in `/docs`
- Review the FAQ section

## 🔄 Changelog

### Version 1.0.0
- Initial release with core features
- Supabase backend integration
- OpenAI script generation
- Location-based rights information
- Audio recording and IPFS storage
- Emergency contact SMS alerts
- Stripe subscription management

---

**Built with ❤️ for civil rights and digital privacy**
