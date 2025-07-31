# MedAtlas 🏥

**Medical School & Residency Discovery Platform**

A comprehensive platform for pre-med students to discover and research medical schools, with AI-powered school list building and competitiveness analysis. Built with Next.js, TypeScript, TailwindCSS, and Supabase.

## 🚀 Features Implemented (Phase 1)

### ✅ Core Infrastructure
- **Next.js 15** with TypeScript and App Router
- **Supabase** (PostgreSQL) with Row Level Security
- **Supabase Auth** for user authentication
- **TailwindCSS** for styling with custom design system
- **Stripe** integration for premium subscriptions

### ✅ Database & API
- Complete schema implementation matching websitescope.md
- Seed data imported (10 medical schools)
- RESTful API endpoints:
  - `GET /api/places` - Paginated places with filtering
  - `GET /api/places/[slug]` - Individual place details
- Computed ranking system based on multiple scores

### ✅ UI Components
- **Explore Grid** (/) - Main browse interface
- **Filter Sidebar** - Advanced filtering with chips and toggles
- **Place Cards** - Nomad List-inspired design with metrics
- **Place Modal** - Detailed view with Scores and Guide tabs
- **Responsive Header** - Navigation with mobile menu

### ✅ Routing Structure
- `/` - Main explore page
- `/schools` - Medical schools filtered view
- `/rotations` - Rotation sites (placeholder)
- `/residencies` - Residency programs (placeholder)
- `/place/[slug]` - Deep-linkable place modals

### ✅ Features
- **Real-time search** across medical schools
- **Advanced filtering** system (tuition, research, location, etc.)
- **School List Builder** with reach/target/safety categorization
- **Competitiveness Calculator** based on MCAT/GPA and experiences
- **Acceptance Odds Analysis** with personalized estimates
- **Premium Content System** with Stripe integration
- **User Authentication** with Supabase Auth
- **Mobile-responsive design** with touch-optimized interface

## 🗄️ Database Schema

The database is now powered by Supabase PostgreSQL with comprehensive schema:

- **places** - Medical schools, rotations, and residencies
- **user_profiles** - User accounts extending Supabase Auth
- **user_stats** - MCAT, GPA, and experience tracking
- **school_list** - User's personalized school lists with categories
- **checkins** - User location tracking (now/soon/been)
- **reviews** - Community reviews with moderation
- **favorites** - Bookmarked places with notes
- **photos** - User-generated content
- **payments** - Stripe payment tracking

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account (for payments)

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/thisisalimirza/medatlas.git
   cd medatlas
   npm install
   ```

2. **Environment variables:**
   
   Update `.env.local` with your credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   # Stripe Configuration  
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # App Configuration
   NEXT_PUBLIC_URL=http://localhost:3000
   MEDATLAS_PRICE_CENTS=9900
   ```

3. **Database setup:**
   
   Run the SQL schema in Supabase SQL Editor:
   ```bash
   # Copy and run: supabase/migrations/001_initial_schema.sql
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📊 Sample Data

The application includes 10 medical schools with realistic data:
- NYU Grossman School of Medicine (Free tuition)
- Harvard Medical School 
- Case Western Reserve SOM
- UCLA David Geffen School of Medicine
- UCSF
- Baylor College of Medicine
- LECOM Bradenton
- Columbia Vagelos College of P&S
- UNC School of Medicine
- Rush Medical College

Each school includes:
- Location and institution info
- Tuition and cost of living data
- Quality scores (training, community, lifestyle, burnout, match strength)
- Research output metrics
- IMG-friendly status
- Tags for filtering

## 🎯 Next Steps (Phase 2)

- [ ] User authentication and signup flow
- [ ] Stripe payment integration
- [ ] Review system with anonymous posting
- [ ] Check-in functionality (now/soon/been)
- [ ] Photo uploads
- [ ] Admin dashboard
- [ ] Additional seed data (50+ places)
- [ ] Advanced search with FTS5
- [ ] Recommendation engine

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and App Router
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with automatic profile creation
- **Styling**: TailwindCSS with custom design system
- **Payments**: Stripe Checkout with webhook integration
- **API**: Next.js API routes with Supabase client
- **State Management**: React Context + Supabase real-time
- **Deployment**: Vercel (recommended) with automatic deploys

## 📱 Mobile Experience

The application is fully responsive with:
- Mobile-optimized filters sidebar
- Touch-friendly cards and modals
- Hamburger navigation menu
- Optimized grid layouts for small screens

---

**Built following the complete specification in websitescope.md**