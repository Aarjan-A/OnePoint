# OnePoint ALO - Autonomous Life Operating System

A privacy-focused, modern web app for managing real-life needs and tasks, connecting users with local service providers. Built with a stunning Revolut-inspired glassmorphic UI featuring black and navy blue gradients.

## 🎨 Design System

### Theme
- **Background**: Diagonal gradient (70% black, 30% navy blue)
- **Color Palette**: Electric blue (#3B82F6) and bright blue (#38BDF8)
- **Design Philosophy**: Ultra-transparent glassmorphism with blur effects
- **Typography**: Inter font family

### Key Features
- ✨ Animated splash screen with glowing OnePoint logo
- 🔐 Multi-method authentication (Email, Phone/OTP, Biometric)
- 📱 Responsive mobile-first design
- 🎭 Glassmorphic UI elements throughout
- 🌊 Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Supabase account (for backend)
- OpenAI API key (for AI chat, optional)

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (Optional - for AI chat)
VITE_OPENAI_API_KEY=your_openai_api_key

# Twilio (Optional - for phone auth)
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token
```

## 📦 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (customized)
│   ├── SplashScreen.tsx # Animated splash screen
│   ├── PhoneAuthDialog.tsx # Phone OTP authentication
│   ├── Logo.tsx         # OnePoint logo component
│   ├── Navigation.tsx   # Bottom navigation bar
│   ├── CreateNeedModal.tsx
│   └── VoiceAssistant.tsx
├── pages/
│   ├── AuthPage.tsx     # Authentication with multiple methods
│   ├── Dashboard.tsx    # Main dashboard with AI suggestions
│   ├── Needs.tsx        # User needs management
│   ├── Providers.tsx    # Service provider directory
│   ├── Chat.tsx         # AI-powered chat interface
│   └── Settings.tsx     # User settings and preferences
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
└── lib/
    └── supabase.ts      # Supabase client configuration
```

## 🔌 Integration Guide

### 1. Database Setup (Supabase)

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Needs table
CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  location TEXT,
  estimated_price_cents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers table
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  categories TEXT[] NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  verified_documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table (for escrow and task management)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID REFERENCES needs(id) NOT NULL,
  provider_id UUID REFERENCES providers(id) NOT NULL,
  escrow_status TEXT DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own needs" ON needs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create needs" ON needs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Everyone can view providers" ON providers FOR SELECT USING (true);
```

### 2. Authentication Setup

#### Phone Authentication (Twilio Integration)

The app includes a phone/OTP authentication dialog. To enable it:

1. **Sign up for Twilio**: https://www.twilio.com/
2. **Get your credentials**: Account SID and Auth Token
3. **Create a Supabase Edge Function** for OTP verification:

```typescript
// supabase/functions/send-otp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Twilio from "npm:twilio"

serve(async (req) => {
  const { phoneNumber } = await req.json()
  
  const client = Twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )
  
  const verification = await client.verify.v2
    .services(Deno.env.get('TWILIO_VERIFY_SERVICE_SID'))
    .verifications
    .create({ to: phoneNumber, channel: 'sms' })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

4. **Update `PhoneAuthDialog.tsx`** to call your edge function

#### Biometric Authentication

Biometric auth is UI-ready. To implement:

```typescript
// Add to AuthContext.tsx
const enableBiometric = async () => {
  if (window.PublicKeyCredential) {
    // WebAuthn implementation
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: "OnePoint ALO" },
        user: {
          id: new Uint8Array(16),
          name: user.email,
          displayName: user.full_name
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      }
    })
    // Store credential in database
  }
}
```

### 3. AI Chat Integration

The chat interface is ready for AI integration. Choose one:

#### Option A: Blink AI SDK (Recommended)

```typescript
// In src/pages/Chat.tsx
import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'your-project-id'
})

const sendMessage = async () => {
  const { text } = await blink.ai.generateText({
    prompt: input,
    model: 'gpt-4.1-mini'
  })
  
  const assistantMessage: Message = {
    role: 'assistant',
    content: text,
    timestamp: new Date(),
  }
  setMessages(prev => [...prev, assistantMessage])
}
```

#### Option B: OpenAI Direct

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant...' },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
  }),
})
```

#### Option C: WebSocket Real-time

```typescript
// For streaming responses
const ws = new WebSocket('wss://your-ai-server.com')

ws.onmessage = (event) => {
  const chunk = JSON.parse(event.data)
  setMessages(prev => {
    const updated = [...prev]
    updated[updated.length - 1].content += chunk.text
    return updated
  })
}

ws.send(JSON.stringify({ type: 'message', content: input }))
```

### 4. Real-time Features

For real-time updates (provider notifications, need status changes):

```typescript
// In Dashboard.tsx or relevant component
import { supabase } from '@/lib/supabase'

useEffect(() => {
  const channel = supabase
    .channel('needs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'needs',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Need updated:', payload)
        // Update UI accordingly
        fetchNeeds()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user])
```

## 🎯 Features Checklist

### ✅ Implemented
- [x] Stunning splash screen with animations
- [x] Revolut-inspired black/navy blue gradient background
- [x] Ultra-transparent glassmorphic UI elements
- [x] Multi-method authentication UI (Email, Phone, Biometric)
- [x] Phone/OTP authentication dialog
- [x] Modern logo in top navigation
- [x] Dashboard with AI suggestions
- [x] Needs management
- [x] Provider directory with demo data
- [x] AI chat interface (demo mode)
- [x] Complete settings page
- [x] Responsive mobile design

### 🔧 Needs Integration
- [ ] Connect phone auth to Twilio
- [ ] Implement biometric authentication
- [ ] Connect AI chat to OpenAI/Blink AI
- [ ] Set up real-time subscriptions
- [ ] Add payment processing (Stripe)
- [ ] Implement location services
- [ ] Add push notifications

## 🚢 Deployment

### Build for Production

```bash
npm run build
# or
bun run build
```

### Deploy to Netlify/Vercel

1. **Connect your repository**
2. **Set environment variables** in the deployment settings
3. **Deploy**

### Build Checklist

- [ ] All environment variables configured
- [ ] Supabase database tables created
- [ ] RLS policies enabled
- [ ] API keys added to secrets (never in code)
- [ ] Test authentication flows
- [ ] Verify all pages load correctly
- [ ] Test on mobile devices

## 🔐 Security Notes

- **Never commit API keys** - use environment variables
- **Enable RLS** on all Supabase tables
- **Use HTTPS** in production
- **Validate user input** on backend
- **Rate limit** API endpoints
- **Implement CORS** properly

## 📱 API Integration Notes

### Provider API (Future Integration)

When connecting to external provider APIs:

```typescript
// Example: Google Maps API for location
const nearbyProviders = await fetch(
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=service&key=${API_KEY}`
)

// Example: Background check API
const verifyProvider = await fetch('https://api.checkr.com/v1/candidates', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(API_KEY + ':').toString('base64')}`,
  },
  body: JSON.stringify({ email, phone })
})
```

## 🎨 Customization

### Changing Colors

Edit `src/index.css`:

```css
:root {
  --primary: 220 90% 56%;  /* Electric blue */
  --accent: 210 100% 60%;   /* Bright blue */
}
```

### Adding New Pages

1. Create page in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Navigation.tsx`

## 🐛 Troubleshooting

### Splash Screen Shows Every Time
The splash screen uses `sessionStorage`. Clear browser cache if testing.

### Glassmorphic Effect Not Showing
Ensure browser supports `backdrop-filter`. Fallback styles are included.

### Phone Auth Not Working
Check Twilio credentials and implement the edge function as shown above.

## 📄 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

This is a Blink-generated project. To contribute:
1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@onepoint-alo.com (if applicable)

---

**Built with ❤️ using Blink.new**
