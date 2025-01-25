import { supabase } from "@/integrations/supabase/client";

let accessToken: string | null = null;

export const analyzeKeywordWithGemini = async (keyword: string) => {
  try {
    console.log('Starting keyword analysis for:', keyword);
    
    // First try to get search volume from Google Search Console
    const { data: searchData, error: searchError } = await supabase.functions.invoke('google-search-data', {
      body: { keyword },
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : undefined
    });

    console.log('Google Search Console response:', { searchData, searchError });

    if (searchError) {
      // If we get an auth error, we need to start the OAuth flow
      if (searchData?.authUrl) {
        console.log('Starting OAuth flow with URL:', searchData.authUrl);
        window.location.href = searchData.authUrl;
        return;
      }
      throw searchError;
    }

    // If we got tokens back, store them and retry
    if (searchData?.tokens) {
      console.log('Received new access token');
      accessToken = searchData.tokens.access_token;
      return analyzeKeywordWithGemini(keyword);
    }

    // Then get the AI analysis for other metrics
    const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-keywords', {
      body: { keyword }
    });

    console.log('AI analysis response:', { aiData, aiError });

    if (aiError) throw aiError;

    // Combine the real search data with AI analysis
    return {
      ...aiData,
      volume: searchData.searchVolume || aiData.volume, // Fallback to AI estimate if no Google data
    };
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    throw error;
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (code: string) => {
  try {
    console.log('Handling OAuth callback with code');
    const { data, error } = await supabase.functions.invoke('google-search-data', {
      body: { code }
    });

    console.log('OAuth callback response:', { data, error });

    if (error) throw error;

    if (data.tokens) {
      accessToken = data.tokens.access_token;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    throw error;
  }
};