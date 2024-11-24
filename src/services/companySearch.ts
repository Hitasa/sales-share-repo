import { Company } from './types';

const GOOGLE_API_KEY = 'AIzaSyBgCiYKdPkflAb-bh5seRBs64us61C-Qkk';
const GOOGLE_CSE_ID = import.meta.env.VITE_GOOGLE_CSE_ID;

const getFallbackCompanies = (query: string): Company[] => {
  return [
    {
      id: Date.now(),
      name: `Search results for: ${query}`,
      industry: 'Technology',
      salesVolume: 'N/A',
      growth: 'N/A',
      createdBy: 'system',
      sharedWith: [],
      link: ''
    },
    {
      id: 2,
      name: 'Google Search API is not enabled',
      industry: 'Various',
      salesVolume: 'N/A',
      growth: 'N/A',
      createdBy: 'system',
      sharedWith: [],
      link: 'https://console.developers.google.com/apis/api/customsearch.googleapis.com/overview'
    },
    {
      id: 3,
      name: 'Please enable the Custom Search API in Google Cloud Console',
      industry: 'Various',
      salesVolume: 'N/A',
      growth: 'N/A',
      createdBy: 'system',
      sharedWith: [],
      link: 'https://console.developers.google.com'
    }
  ];
};

export const searchCompanies = async (query: string): Promise<Company[]> => {
  if (!GOOGLE_CSE_ID || !GOOGLE_API_KEY) {
    console.warn('Google CSE ID or API Key not configured');
    return getFallbackCompanies(query);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query + ' company information')}&siteSearch=teatmik.ee&siteSearchFilter=i`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google search error:', errorData);
      
      if (errorData.error?.code === 403) {
        console.error('Google Custom Search API is not enabled. Please enable it in the Google Cloud Console.');
      }
      
      return getFallbackCompanies(query);
    }

    const data = await response.json();
    const items = data.items || [];
    
    // Add searched companies to mockCompanies
    const searchResults = items.map((item: any) => ({
      id: Date.now() + Math.random(), // Ensure unique IDs
      name: item.title || 'Unknown',
      industry: item.pagemap?.metatags?.[0]?.['og:type'] || 'Various',
      salesVolume: 'N/A',
      growth: 'N/A',
      createdBy: 'system',
      sharedWith: [],
      link: item.link || '',
      reviews: [],
      offers: [],
      invitations: []
    }));

    // Import mockCompanies and add the search results to it
    const { mockCompanies } = await import('./mockData');
    searchResults.forEach(company => {
      if (!mockCompanies.some(c => c.id === company.id)) {
        mockCompanies.push(company);
      }
    });

    return searchResults;
  } catch (error) {
    console.error('Google search error:', error);
    return getFallbackCompanies(query);
  }
};