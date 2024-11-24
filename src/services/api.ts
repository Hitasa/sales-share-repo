import { Company, Offer, CompanyInvitation } from './types';
export * from './types';
export * from './companySearch';

// Store to simulate database
let mockCompanies: Company[] = [
  {
    id: 1,
    name: "Acme Corp",
    industry: "Technology",
    salesVolume: "$1.2M",
    growth: "+15%",
    createdBy: "user1",
    sharedWith: [],
    reviews: [
      {
        id: 1,
        rating: 4,
        comment: "Great company to work with!",
        date: "2024-02-20",
      }
    ]
  },
];

// Store user repositories in memory
let userRepositories: Record<string, number[]> = {};

export const fetchCompanies = async (): Promise<Company[]> => {
  return Promise.resolve([...mockCompanies]);
};

export const fetchUserCompanyRepository = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];
  const userCompanyIds = userRepositories[userId] || [];
  const userCompanies = mockCompanies.filter(company => userCompanyIds.includes(company.id));
  return Promise.resolve(userCompanies);
};

export const addToUserRepository = async (companyId: number, userId: string): Promise<Company> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Initialize user repository if it doesn't exist
  if (!userRepositories[userId]) {
    userRepositories[userId] = [];
  }
  
  // Check if company exists
  const company = mockCompanies.find(c => c.id === companyId);
  if (!company) {
    throw new Error("Company not found");
  }
  
  // Check if already in repository
  if (userRepositories[userId].includes(companyId)) {
    throw new Error("Company already in repository");
  }
  
  // Add to user's repository and ensure it exists in mockCompanies
  userRepositories[userId].push(companyId);
  if (!mockCompanies.find(c => c.id === companyId)) {
    mockCompanies.push(company);
  }
  
  return Promise.resolve(company);
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
          reviews: []
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
        reviews: []
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
