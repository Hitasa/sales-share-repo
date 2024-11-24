import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { google } from 'npm:@googleapis/customsearch@3.0.2'

const customsearch = google.customsearch('v1')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Searching for:', query);
    
    const response = await customsearch.cse.list({
      auth: Deno.env.get('GOOGLE_API_KEY'),
      cx: Deno.env.get('GOOGLE_SEARCH_ENGINE_ID'),
      q: query,
    })

    const searchResults = response.data.items || []
    console.log('Found results:', searchResults.length);
    
    // Transform Google results into Company format
    const companies = searchResults.map((item, index) => ({
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
    }))

    return new Response(
      JSON.stringify(companies),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})