export interface Company {
  id: string;
  name: string;
  industry?: string;
  salesVolume?: string;
  growth?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  review?: string;
  notes?: string;
  createdBy: string;
  team_id?: string | null;
  sharedWith: string[];
  reviews?: Review[];
  comments?: Comment[];
  team_reviews?: Review[];
  averageRating?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
}

export interface CompanyInvitation {
  id: string;
  email: string;
  role: string;
  companyId: string;
}

export interface Offer {
  id: string;
  companyId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// Re-export Team type from types/team
export { Team } from '@/types/team';