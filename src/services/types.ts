export interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

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
  sharedWith: string[];
  reviews: Review[];
  averageRating?: number;
}

export interface CompanyInvitation {
  id: string;
  companyId: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: 'admin' | 'member';
}

export interface Offer {
  id: string;
  companyId: string;
  amount: number;
  status: string;
  date: string;
}