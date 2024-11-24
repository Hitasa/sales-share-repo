import { Company } from './types';
import { supabase } from '@/integrations/supabase/client';

export const searchCompanies = async (query: string): Promise<Company[]> => {
  try {
    if (!query) {
      const { data, error } = await supabase
        .from('companies')
        .select('*');

      if (error) throw error;
      return data || [];
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

    // Then try Google search specifically for teatmik.ee
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;
    
    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
      console.warn('Google Search API configuration missing');
      return localResults || [];
    }

    const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}+site:teatmik.ee`;
    
    const googleResponse = await fetch(googleSearchUrl);
    
    if (!googleResponse.ok) {
      console.error('Google Search API error status:', googleResponse.status);
      const errorText = await googleResponse.text();
      console.error('Google Search API error details:', errorText);
      return localResults || [];
    }

    const googleData = await googleResponse.json();
    
    if (!googleData.items) {
      console.log('No Google search results found');
      return localResults || [];
    }

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
    
    return uniqueResults;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};