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

  if (error) throw error;
  return data || [];
};

export const searchCompanies = async (query: string): Promise<Company[]> => {
  try {
    if (!query) {
      return fetchCompanies();
    }

    // First try local database search
    const { data: localResults, error: localError } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${query}%`);

    if (localError) throw localError;

    // Then try Google search via Edge Function
    const { data: googleResults, error: functionError } = await supabase.functions.invoke('search-companies', {
      body: JSON.stringify({ query })
    });

    if (functionError) {
      console.error('Google search error:', functionError);
      return localResults || [];
    }

    // Combine and deduplicate results
    const allResults = [...(localResults || []), ...(googleResults || [])];
    const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());
    
    return uniqueResults;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
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