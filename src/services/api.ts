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
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*');

  if (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
  
  return data || [];
};

export const fetchUserCompanies = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('created_by', userId);

  if (error) throw error;
  return data || [];
};

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

export const addCompany = async (company: Omit<Company, "id">): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()
    .single();

  if (error) throw error;
  return data;
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
  return updatedCompany;
};