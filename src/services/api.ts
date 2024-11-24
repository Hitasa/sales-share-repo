const API_URL = 'https://api.example.com';

export interface Offer {
  id: number;
  companyId: number;
  userId: string;
  type: 'sent' | 'received';
  amount: string;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
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
}

// Fetch companies for the current user (including shared ones)
export const fetchUserCompanies = async (userId: string): Promise<Company[]> => {
  // For demonstration, we'll return mock data
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
          reviews: [
            {
              id: 1,
              rating: 4,
              comment: "Great company to work with!",
              date: "2024-02-20",
            },
          ],
        },
      ]);
    }, 1000);
  });
};

export const shareCompany = async (companyId: number, userId: string): Promise<Company> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: companyId,
        name: "Shared Company",
        industry: "Technology",
        salesVolume: "$1.2M",
        growth: "+15%",
        createdBy: "user1",
        sharedWith: [userId],
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
  // Replace with actual API call: return fetch(`${API_URL}/companies`, { method: 'POST', body: JSON.stringify(company) })
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
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: companyId,
        name: "Updated Company",
        industry: "Updated Industry",
        salesVolume: "Updated Sales",
        growth: "Updated Growth",
        reviews: [{
          id: Date.now(),
          ...review,
          date: new Date().toISOString().split("T")[0],
        }],
      });
    }, 500);
  });
};
