import { Company, Offer, CompanyInvitation } from './types';
import { mockCompanies } from './mockData';
export * from './types';
export * from './companySearch';
export * from './companyRepository';

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

export const fetchUserCompanies = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];
  // Get companies from mockCompanies where the user is the creator
  const userCompanies = mockCompanies.filter(company => company.createdBy === userId);
  return Promise.resolve(userCompanies);
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
        reviews: [],
        website: company.website || "",
        phoneNumber: company.phoneNumber || "",
        email: company.email || "",
        comments: []
      };
      mockCompanies.push(newCompany);
      resolve(newCompany);
    }, 500);
  });
};

export const addReview = async (companyId: number, review: { rating: number; comment: string }): Promise<Company> => {
  const companyIndex = mockCompanies.findIndex(c => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = mockCompanies[companyIndex];
  const newReview = {
    id: Date.now(),
    ...review,
    date: new Date().toISOString().split("T")[0],
  };

  const updatedReviews = [...(company.reviews || []), newReview];
  const updatedCompany = {
    ...company,
    reviews: updatedReviews,
  };

  mockCompanies[companyIndex] = updatedCompany;
  return Promise.resolve(updatedCompany);
};