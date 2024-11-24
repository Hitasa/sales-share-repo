import { Company, Offer, CompanyInvitation } from './types';
import { mockCompanies } from './mockData';
import { supabase } from '@/integrations/supabase/client';

export * from './types';
export * from './companySearch';
export * from './companyRepository';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
}

export const fetchTeamMembers = async (userId: string): Promise<TeamMember[]> => {
  return Promise.resolve([
    {
      id: "1",
      email: "team.member@example.com",
      role: "member",
      status: "active"
    }
  ]);
};

export const updateCompany = async (companyId: string, updates: Partial<Company>): Promise<Company> => {
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
  const { data, error } = await supabase
    .from('companies')
    .select('*');

  if (error) throw error;
  return data || [];
};

export const searchCompanies = async (query: string): Promise<Company[]> => {
  try {
    if (!query) {
      const { data, error } = await supabase
        .from('companies')
        .select('*');

      if (error) throw error;
      return data || [];
    }

    // Call the Edge Function for Google search
    const { data: companies, error } = await supabase.functions.invoke('search-companies', {
      body: { query }
    });

    if (error) throw error;
    return companies || [];
    
  } catch (error) {
    console.error('Search error:', error);
    // Fallback to database search if Google search fails
    const { data, error: dbError } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${query}%`);

    if (dbError) throw dbError;
    return data || [];
  }
};

export const fetchUserCompanies = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];
  const userCompanies = mockCompanies.filter(company => company.createdBy === userId);
  return Promise.resolve(userCompanies);
};

export const inviteUserToCompany = async (companyId: string, email: string, role: 'admin' | 'member'): Promise<CompanyInvitation> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: String(Date.now()),
        companyId,
        email,
        status: 'pending',
        role
      });
    }, 500);
  });
};

export const shareCompany = async (companyId: string, email: string): Promise<Company> => {
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
        reviews: [],
      });
    }, 500);
  });
};

export const createOffer = async (companyId: string, offer: Omit<Offer, "id">): Promise<Offer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...offer,
        id: String(Date.now()),
        companyId,
      });
    }, 500);
  });
};

export const addCompany = async (company: Omit<Company, "id">): Promise<Company> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCompany: Company = {
        ...company,
        id: String(Date.now()),
        reviews: [],
        website: company.website || "",
        phoneNumber: company.phoneNumber || "",
        email: company.email || "",
        sharedWith: company.sharedWith || [],
      };
      mockCompanies.push(newCompany);
      resolve(newCompany);
    }, 500);
  });
};

export const addReview = async (companyId: string, review: { rating: number; comment: string }): Promise<Company> => {
  const companyIndex = mockCompanies.findIndex(c => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error("Company not found");
  }

  const company = mockCompanies[companyIndex];
  const newReview = {
    id: String(Date.now()),
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
