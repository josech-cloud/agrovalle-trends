import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');

    // Build date filter
    const dateFilter = fromDate ? new Date(fromDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = toDate ? new Date(toDate) : new Date();

    // Get all news in the date range
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .select('*')
      .gte('published_at', dateFilter.toISOString())
      .lte('published_at', endDate.toISOString());

    if (newsError) throw newsError;

    // Calculate statistics
    const sectorStats: Record<string, { total: number; positivo: number; neutral: number; negativo: number }> = {};
    const dailyBalance: Record<string, number> = {};
    const newsData2 = newsData || [];

    newsData2.forEach((news: any) => {
      // Sector statistics
      if (!sectorStats[news.sector]) {
        sectorStats[news.sector] = { total: 0, positivo: 0, neutral: 0, negativo: 0 };
      }
      sectorStats[news.sector].total++;
      sectorStats[news.sector][news.sentiment_label as 'positivo' | 'neutral' | 'negativo']++;

      // Daily balance
      const date = new Date(news.published_at).toISOString().split('T')[0];
      if (!dailyBalance[date]) {
        dailyBalance[date] = 0;
      }
      
      const sentimentValue = news.sentiment_label === 'positivo' ? 1 : 
                            news.sentiment_label === 'negativo' ? -1 : 0;
      dailyBalance[date] += sentimentValue;
    });

    // Transform sector stats to array
    const sectorStatsArray = Object.entries(sectorStats).map(([sector, stats]) => ({
      sector,
      ...stats,
      positivePercentage: (stats.positivo / stats.total) * 100,
      negativePercentage: (stats.negativo / stats.total) * 100
    })).sort((a, b) => b.total - a.total);

    // Transform daily balance to array
    const dailyBalanceArray = Object.entries(dailyBalance)
      .map(([date, balance]) => ({ date, balance }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top sectors by sentiment
    const topPositiveSectors = [...sectorStatsArray]
      .sort((a, b) => b.positivePercentage - a.positivePercentage)
      .slice(0, 5);

    const topNegativeSectors = [...sectorStatsArray]
      .sort((a, b) => b.negativePercentage - a.negativePercentage)
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        sectorStats: sectorStatsArray,
        dailyBalance: dailyBalanceArray,
        topPositiveSectors,
        topNegativeSectors,
        totalNews: newsData2.length,
        dateRange: {
          from: dateFilter.toISOString(),
          to: endDate.toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in get-trends:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
