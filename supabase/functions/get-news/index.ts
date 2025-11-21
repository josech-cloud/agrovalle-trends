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
    
    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Filters
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const sectors = url.searchParams.getAll('sector');
    const productTypes = url.searchParams.getAll('product_type');
    const municipalities = url.searchParams.getAll('municipality');
    const sentiments = url.searchParams.getAll('sentiment');
    const impactLevels = url.searchParams.getAll('impact_level');
    const reliabilityLevels = url.searchParams.getAll('reliability_level');

    let query = supabase
      .from('news')
      .select('*', { count: 'exact' });

    // Apply date filters
    if (fromDate) {
      query = query.gte('published_at', fromDate);
    }
    if (toDate) {
      query = query.lte('published_at', toDate);
    }

    // Apply category filters
    if (sectors.length > 0) {
      query = query.in('sector', sectors);
    }
    if (productTypes.length > 0) {
      query = query.in('product_type', productTypes);
    }
    if (municipalities.length > 0) {
      query = query.in('municipality', municipalities);
    }
    if (sentiments.length > 0) {
      query = query.in('sentiment_label', sentiments);
    }
    if (impactLevels.length > 0) {
      query = query.in('impact_level', impactLevels);
    }
    if (reliabilityLevels.length > 0) {
      query = query.in('reliability_level', reliabilityLevels);
    }

    // Order and paginate
    query = query
      .order('published_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        news: data,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in get-news:', error);
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
