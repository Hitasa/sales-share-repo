// Follow REST API best practices for CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a custom fetch function for Google API
async function searchGoogle(query: string) {
  const apiKey = Deno.env.get('GOOGLE_API_KEY');
  const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
  
  if (!apiKey || !searchEngineId) {
    throw new Error('Missing Google API configuration');
  }

  // Add site restriction to the query
  const siteRestrictedQuery = `${query} site:teatmik.ee`;
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(siteRestrictedQuery)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google API error: ${response.statusText}`);
  }
  
  return await response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Searching for:', query, 'on teatmik.ee');
    
    const searchResults = await searchGoogle(query);
    const items = searchResults.items || [];
    
    console.log('Found results:', items.length);
    
    // Transform Google results into Company format
    const companies = items.map((item: any, index: number) => ({
      id: `google-${index}`,
      name: item.title || '',
      industry: item.snippet || '',
      salesVolume: '',
      growth: '',
      createdBy: '',
      sharedWith: [],
      reviews: [],
      website: item.link || '',
      phoneNumber: '',
      email: '',
    }));

    return new Response(
      JSON.stringify(companies),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});