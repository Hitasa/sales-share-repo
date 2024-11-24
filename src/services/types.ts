export interface Offer {
  id: number;
  companyId: number;
  userId: string;
  type: 'sent' | 'received';
  amount: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

export interface CompanyInvitation {
  id: number;
  companyId: number;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: 'admin' | 'member';
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  date: string;
}

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  salesVolume?: string;
  growth?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  review?: string;
  notes?: string;
  comments?: Comment[];
  createdBy: string;
  sharedWith: string[];
  link?: string;
  reviews?: Review[];
  offers?: Offer[];
  invitations?: CompanyInvitation[];
  averageRating?: number;
}