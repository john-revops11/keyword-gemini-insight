import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// OAuth2 configuration
const OAUTH2_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const REDIRECT_URI = 'http://localhost:5173/oauth/callback' // Update this for production
const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { keyword, code } = await req.json()
    console.log('Processing request with:', { keyword, code })

    // If we have an authorization code, exchange it for tokens
    if (code) {
      console.log('Exchanging authorization code for tokens')
      const tokenResponse = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Token exchange failed:', errorText)
        throw new Error(`Failed to exchange authorization code: ${errorText}`)
      }

      const tokens = await tokenResponse.json()
      console.log('Successfully obtained access token')

      return new Response(JSON.stringify({ tokens }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If we have a keyword but no code, we need an access token
    if (!req.headers.get('Authorization')) {
      console.log('No authorization token found, initiating OAuth flow')
      // Generate authorization URL
      const authUrl = `${OAUTH2_ENDPOINT}?${new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent',
      })}`

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get search analytics data using the access token
    const accessToken = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!accessToken) {
      throw new Error('Invalid authorization header format')
    }
    
    console.log('Fetching verified sites')
    // First, get the list of verified sites
    const sitesResponse = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!sitesResponse.ok) {
      const errorText = await sitesResponse.text()
      console.error('Failed to fetch sites:', errorText)
      
      // If unauthorized, trigger new OAuth flow
      if (sitesResponse.status === 401) {
        const authUrl = `${OAUTH2_ENDPOINT}?${new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          redirect_uri: REDIRECT_URI,
          response_type: 'code',
          scope: SCOPES.join(' '),
          access_type: 'offline',
          prompt: 'consent',
        })}`
        return new Response(JSON.stringify({ authUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      // If no sites are verified, return 0 search volume instead of throwing an error
      if (sitesResponse.status === 403) {
        console.log('No access to Search Console API, returning 0 search volume')
        return new Response(JSON.stringify({ searchVolume: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      throw new Error(`Failed to fetch verified sites: ${errorText}`)
    }

    const sites = await sitesResponse.json()
    console.log('Received sites:', sites)
    
    if (!sites.siteEntry || sites.siteEntry.length === 0) {
      console.log('No verified sites found, returning 0 search volume')
      return new Response(JSON.stringify({ searchVolume: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const verifiedSite = sites.siteEntry[0].siteUrl
    console.log('Using verified site:', verifiedSite)

    // Now query search analytics for the keyword
    const searchAnalyticsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(verifiedSite)}/searchAnalytics/query`
    
    console.log('Fetching search analytics data')
    const response = await fetch(searchAnalyticsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        dimensions: ['query'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'query',
            operator: 'equals',
            expression: keyword
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Search analytics API error:', errorText)
      
      // If we can't get search analytics data, return 0 instead of throwing an error
      return new Response(JSON.stringify({ searchVolume: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const searchVolume = data.rows?.[0]?.impressions || 0
    console.log('Search volume for keyword:', searchVolume)

    return new Response(JSON.stringify({ searchVolume }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in google-search-data function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})