
# OnePoint ALO - Planning Document

## Requirements
- Privacy-first mobile app for converting user needs into completed outcomes
- Authentication with email/password and biometric support
- Dashboard with dynamic greeting, stats, quick actions, AI suggestions
- Create Need functionality with photo upload
- AI Chat powered by OpenAI
- Voice Assistant with speech-to-text and OpenAI integration
- Provider discovery and job management
- Settings with privacy controls
- Unified purple/violet glassmorphism design

## Design
- Dark slate background (220 25% 10%)
- Primary purple/violet (262 83% 58%)
- Secondary purple variants (262 50% 45%, 262 60% 65%)
- Glassmorphism cards with backdrop blur
- Modern gradient logo with purple theme
- Top navigation bar
- Rounded corners (1rem radius)
- Smooth animations and transitions

## Tasks

### Phase 1: Core Infrastructure (COMPLETED)
- [x] Design system with glassmorphism theme (300 LOC × 10 = 3000 tokens)
- [x] Authentication pages and context (400 LOC × 10 = 4000 tokens)
- [x] Dashboard with dynamic greeting (300 LOC × 10 = 3000 tokens)
- [x] Navigation structure (100 LOC × 10 = 1000 tokens)
- [x] Settings page with all sections (500 LOC × 10 = 5000 tokens)
- [x] Supabase database schema (200 LOC × 10 = 2000 tokens)

### Phase 2: Fix API Keys & Core Features (COMPLETED)
- [x] Fix Supabase anon key (10 LOC × 10 = 100 tokens)
- [x] Create Need modal with image upload (400 LOC × 10 = 4000 tokens)
- [x] AI Chat with OpenAI integration (500 LOC × 10 = 5000 tokens)
- [x] Provider listing and discovery (300 LOC × 10 = 3000 tokens)
- [x] Needs list with status tracking (300 LOC × 10 = 3000 tokens)

### Phase 3: Unified Purple Theme & Voice Assistant (IN PROGRESS)
- [ ] Update design system to unified purple theme (50 LOC × 10 = 500 tokens)
  - Replace accent teal/cyan with purple variants
  - Update all color tokens in index.css
  - Ensure consistent purple throughout
- [ ] Create modern logo component (100 LOC × 10 = 1000 tokens)
  - Gradient purple logo with "ALO" branding
  - Add to dashboard header
  - Add to auth pages
- [ ] Voice Assistant floating button (300 LOC × 10 = 3000 tokens)
  - Bottom-right floating action button
  - Speech-to-text using Web Speech API
  - OpenAI integration for voice responses
  - Text-to-speech for AI responses
  - Animated microphone icon
- [ ] Update all components to use purple theme (100 LOC × 10 = 1000 tokens)
  - Dashboard quick actions
  - Stats cards
  - All buttons and badges
  - Remove teal/cyan references

### Phase 4: Advanced Features (OPTIONAL)
- [ ] Real-time notifications (200 LOC × 10 = 2000 tokens)
- [ ] Job acceptance flow for providers (300 LOC × 10 = 3000 tokens)
- [ ] Proof upload and verification (200 LOC × 10 = 2000 tokens)
- [ ] Payment integration stub (300 LOC × 10 = 3000 tokens)

## Discussions
- User requested unified purple color scheme (no teal/cyan)
- Need modern logo for branding
- Voice assistant with bottom-right floating button
- OpenAI API key provided for voice integration
- All features must be fully functional

## Execution Strategy

### Task 1: Unified Purple Theme
- Update CSS custom properties in index.css
- Replace --accent from teal (180 80% 50%) to purple (262 60% 65%)
- Update accent-foreground to maintain contrast
- Verify all components use semantic tokens

### Task 2: Modern Logo Component
- Create Logo.tsx component with gradient purple design
- SVG-based for scalability
- Include "ALO" text with modern typography
- Add to Navigation and Dashboard

### Task 3: Voice Assistant
- Create VoiceAssistant.tsx component
- Floating button with fixed position (bottom-right)
- Web Speech API for speech recognition
- OpenAI API for processing voice input
- Text-to-speech for responses
- Animated states (listening, processing, speaking)

### Task 4: Component Updates
- Update Dashboard quick actions to use purple
- Update all stat cards to purple theme
- Update Needs page status badges
- Update Providers page elements
- Verify Settings page consistency