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

export interface Company {
  id: number;
  name: string;
  industry: string;
  salesVolume: string;
  growth: string;
  createdBy: string;
  sharedWith: string[];
  reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    date: string;
  }>;
  offers?: Offer[];
  invitations?: CompanyInvitation[];
}