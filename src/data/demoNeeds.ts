export interface DemoNeed {
  id: string;
  title: string;
  description: string;
  category: string;
  photos: string[];
  location: string;
  estimated_price_cents: number;
  status: 'suggested' | 'confirmed' | 'assigned' | 'in_progress' | 'completed';
  created_at: string;
}

export const demoNeeds: DemoNeed[] = [
  {
    id: 'demo-1',
    title: 'Weekly Grocery Shopping',
    description: 'Need help with weekly grocery shopping from local supermarket. Prefer organic produce.',
    category: 'Shopping',
    photos: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400'
    ],
    location: 'Downtown Area, Main Street',
    estimated_price_cents: 3500,
    status: 'in_progress',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Home Deep Cleaning',
    description: '3-bedroom apartment needs deep cleaning including kitchen, bathrooms, and living areas.',
    category: 'Cleaning',
    photos: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400'
    ],
    location: 'Riverside Apartments, Unit 42',
    estimated_price_cents: 12000,
    status: 'confirmed',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Car Oil Change',
    description: 'Regular oil change needed for 2020 Honda Civic. Synthetic oil preferred.',
    category: 'Automotive',
    photos: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400'
    ],
    location: 'Oak Street Parking',
    estimated_price_cents: 5500,
    status: 'suggested',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Lawn Mowing Service',
    description: 'Front and back yard need mowing and edge trimming. About 500 sq ft total.',
    category: 'Home Repair',
    photos: [
      'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
    ],
    location: 'Maple Grove Residence',
    estimated_price_cents: 7500,
    status: 'assigned',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Pet Grooming',
    description: 'Golden Retriever needs grooming - bath, nail trim, and haircut.',
    category: 'Pet Care',
    photos: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'
    ],
    location: 'Home Service Requested',
    estimated_price_cents: 8000,
    status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
