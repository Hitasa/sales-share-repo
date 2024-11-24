import { Company, Offer, CompanyInvitation } from './types';
export * from './types';
export * from './companySearch';

let mockCompanies: Company[] = [
  {
    id: 1,
    name: "Acme Corp",
    industry: "Technology",
    salesVolume: "$1.2M",
    growth: "+15%",
    createdBy: "user1",
    sharedWith: [],
    comments: [],
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

export const updateCompany = async (companyId: number, updates: Partial<Company>): Promise<Company> => {
  const companyIndex = mockCompanies.findIndex(c => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }
  
  mockCompanies[companyIndex] = {
    ...mockCompanies[companyIndex],
    ...updates,
  };
  
  return mockCompanies[companyIndex];
};

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
    throw new Error(`${company.name} is already in your repository`);
  }
  
  // Add to user's repository
  userRepositories[userId].push(companyId);
  
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
      const newCompany = {
        ...company,
        id: Date.now(),
        reviews: []
      };
      
      // Add the new company to mockCompanies
      mockCompanies.push(newCompany);
      
      // If there's a createdBy field, add it to that user's repository
      if (company.createdBy) {
        if (!userRepositories[company.createdBy]) {
          userRepositories[company.createdBy] = [];
        }
        userRepositories[company.createdBy].push(newCompany.id);
      }
      
      resolve(newCompany);
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
