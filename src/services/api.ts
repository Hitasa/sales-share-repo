import { Company, Offer, CompanyInvitation } from './types';
import { supabase } from '@/integrations/supabase/client';

export * from './types';
export * from './search';
export * from './companyRepository';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
}

export const fetchTeamMembers = async (userId: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

export const updateCompany = async (companyId: string, updates: Partial<Company>): Promise<Company> => {
  // Transform the updates to match the database column names
  const dbUpdates = {
    name: updates.name,
    industry: updates.industry,
    sales_volume: updates.salesVolume,
    growth: updates.growth,
    website: updates.website,
    phone_number: updates.phoneNumber,
    email: updates.email,
    review: updates.review,
    notes: updates.notes,
    created_by: updates.createdBy,
    team_id: updates.team_id,
    reviews: updates.reviews,
    comments: updates.comments
  };

  const { data, error } = await supabase
    .from('companies')
    .update(dbUpdates)
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return transformCompanyFromDB(data);
};

export const fetchCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*');

  if (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
  
  return (data || []).map(transformCompanyFromDB);
};

export const fetchUserCompanies = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('created_by', userId);

  if (error) throw error;
  return (data || []).map(transformCompanyFromDB);
};

// Helper function to transform database response to Company type
const transformCompanyFromDB = (dbCompany: any): Company => ({
  id: dbCompany.id,
  name: dbCompany.name,
  industry: dbCompany.industry || undefined,
  salesVolume: dbCompany.sales_volume || undefined,
  growth: dbCompany.growth || undefined,
  website: dbCompany.website || undefined,
  phoneNumber: dbCompany.phone_number || undefined,
  email: dbCompany.email || undefined,
  review: dbCompany.review || undefined,
  notes: dbCompany.notes || undefined,
  createdBy: dbCompany.created_by || "",
  team_id: dbCompany.team_id,
  sharedWith: [],
  reviews: dbCompany.reviews || [],
  comments: dbCompany.comments || []
});

export const inviteUserToCompany = async (companyId: string, email: string, role: 'admin' | 'member'): Promise<CompanyInvitation> => {
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { companyId, email, role }
  });

  if (error) throw error;
  return data;
};

export const shareCompany = async (companyId: string, email: string): Promise<Company> => {
  const { data, error } = await supabase.functions.invoke('share-company', {
    body: { companyId, email }
  });

  if (error) throw error;
  return data;
};

export const createOffer = async (companyId: string, offer: Omit<Offer, "id">): Promise<Offer> => {
  const { data, error } = await supabase
    .from('offers')
    .insert([{ ...offer, company_id: companyId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addCompany = async (company: {
  name: string;
  industry: string;
  sales_volume: string;
  growth: string;
  website?: string;
  phone_number?: string;
  email?: string;
  review?: string;
  notes?: string;
  created_by: string;
}): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()
    .single();

  if (error) {
    console.error("Error adding company:", error);
    throw error;
  }
  return transformCompanyFromDB(data);
};

export const addReview = async (companyId: string, review: { rating: number; comment: string }): Promise<Company> => {
  const { data: company, error: getError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (getError) throw getError;

  const newReview = {
    id: crypto.randomUUID(),
    ...review,
    date: new Date().toISOString().split('T')[0],
  };

  const updatedReviews = [...(company.reviews || []), newReview];
  
  const { data: updatedCompany, error: updateError } = await supabase
    .from('companies')
    .update({ reviews: updatedReviews })
    .eq('id', companyId)
    .select()
    .single();

  if (updateError) throw updateError;
  return transformCompanyFromDB(updatedCompany);
};