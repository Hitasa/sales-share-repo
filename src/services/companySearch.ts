import { Company } from './types';

const GOOGLE_API_KEY = 'AIzaSyBgCiYKdPkflAb-bh5seRBs64us61C-Qkk';
const GOOGLE_CSE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;

export const searchCompanies = async (query: string): Promise<Company[]> => {
  if (!GOOGLE_CSE_ID) {
    throw new Error('Google CSE ID not configured');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query + ' company information')}`
    );
    
    if (!response.ok) {
      throw new Error('Search request failed');
    }

    const data = await response.json();
    const items = data.items || [];
    
    return items.map((item: any, index: number) => ({
      id: index + 1,
      name: item.title || 'Unknown',
      industry: item.pagemap?.metatags?.[0]?.['og:type'] || 'Various',
      salesVolume: 'N/A',
      growth: 'N/A',
      createdBy: 'system',
      sharedWith: [],
    }));
  } catch (error) {
    console.error('Google search error:', error);
    return [];
  }
};