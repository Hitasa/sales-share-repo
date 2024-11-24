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

    if (localError) {
      console.error('Local search error:', localError);
      return [];
    }

    // Then try Google search
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;
    
    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
      console.warn('Google Search API configuration missing');
      return localResults || [];
    }

    console.log('Using Google API Key:', GOOGLE_API_KEY?.slice(0, 5) + '...');
    console.log('Using Search Engine ID:', SEARCH_ENGINE_ID);

    const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
    
    console.log('Making request to:', googleSearchUrl.replace(GOOGLE_API_KEY, 'REDACTED'));

    const googleResponse = await fetch(googleSearchUrl);
    
    if (!googleResponse.ok) {
      const errorText = await googleResponse.text();
      console.error('Google Search API error status:', googleResponse.status);
      console.error('Google Search API error details:', errorText);
      return localResults || [];
    }

    const googleData = await googleResponse.json();
    
    if (!googleData.items) {
      console.log('No Google search results found');
      return localResults || [];
    }

    console.log(`Found ${googleData.items.length} Google search results`);

    // Transform Google search results into Company format
    const googleResults = googleData.items.map((item: any) => ({
      id: item.cacheId || crypto.randomUUID(),
      name: item.title,
      industry: item.snippet?.split(' - ')[0] || '',
      website: item.link,
      created_by: null,
      team_id: null,
      created_at: new Date().toISOString(),
      email: null,
      growth: null,
      notes: item.snippet || null,
      phone_number: null,
      review: null,
      sales_volume: null
    }));

    // Combine and deduplicate results
    const allResults = [...(localResults || []), ...googleResults];
    const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());
    
    console.log(`Returning ${uniqueResults.length} total results (${localResults?.length || 0} local + ${googleResults.length} from Google)`);
    
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