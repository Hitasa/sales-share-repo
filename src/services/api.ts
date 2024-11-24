import { customsearch } from '@googleapis/customsearch';

const API_URL = 'https://api.example.com';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;

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

export const searchCompanies = async (query: string): Promise<Company[]> => {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    throw new Error('Google API credentials not configured');
  }

  const customSearch = new customsearch.v1.Customsearch({});
  
  try {
    const response = await customSearch.cse.list({
      auth: GOOGLE_API_KEY,
      cx: GOOGLE_CSE_ID,
      q: `${query} company information`,
    });

    const searchResults = response.data.items || [];
    
    return searchResults.map((item, index) => ({
      id: index + 1,
      name: item.title || 'Unknown',
      industry: item.pagemap?.metatags?.[0]?.['og:type'] || 'Various',
      salesVolume: 'N/A',
      growth: 'N/A',
      createdBy: 'system',
      sharedWith: [],
    }));
  } catch (error) {
    console.error('Google search error:', error);
    return [];
  }
};

export const fetchCompanies = async (): Promise<Company[]> => {
  // For demonstration, returning mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Acme Corp",
          industry: "Technology",
          salesVolume: "$1.2M",
          growth: "+15%",
          createdBy: "user1",
          sharedWith: [],
        },
      ]);
    }, 1000);
  });
};

export const fetchUserCompanies = async (userId: string): Promise<Company[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Acme Corp",
          industry: "Technology",
          salesVolume: "$1.2M",
          growth: "+15%",
          createdBy: userId,
          sharedWith: ["user2", "user3"],
          offers: [
            {
              id: 1,
              companyId: 1,
              userId: userId,
              type: "sent",
              amount: "$500K",
              status: "pending",
              date: "2024-02-20",
            }
          ],
          invitations: [
            {
              id: 1,
              companyId: 1,
              email: "invited@example.com",
              status: "pending",
              role: "member"
            }
          ],
        },
      ]);
    }, 1000);
  });
};

export const inviteUserToCompany = async (companyId: number, email: string, role: 'admin' | 'member'): Promise<CompanyInvitation> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        companyId,
        email,
        status: 'pending',
        role
      });
    }, 500);
  });
};

export const shareCompany = async (companyId: number, email: string): Promise<Company> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: companyId,
        name: "Shared Company",
        industry: "Technology",
        salesVolume: "$1.2M",
        growth: "+15%",
        createdBy: "user1",
        sharedWith: [email],
        offers: [],
        reviews: [],
      });
    }, 500);
  });
};

export const createOffer = async (companyId: number, offer: Omit<Offer, "id">): Promise<Offer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...offer,
        id: Date.now(),
        companyId,
      });
    }, 500);
  });
};

export const addCompany = async (company: Omit<Company, "id">): Promise<Company> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...company,
        id: Date.now(),
      });
    }, 500);
  });
};

export const addReview = async (companyId: number, review: { rating: number; comment: string }): Promise<Company> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: companyId,
        name: "Updated Company",
        industry: "Updated Industry",
        salesVolume: "Updated Sales",
        growth: "Updated Growth",
        createdBy: "user1",
        sharedWith: [],
        reviews: [{
          id: Date.now(),
          ...review,
          date: new Date().toISOString().split("T")[0],
        }],
      });
    }, 500);
  });
};
