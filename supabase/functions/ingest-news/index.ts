import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { classifyNews } from '../classify-news/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsInput {
  title: string;
  summary?: string;
  body?: string;
  url?: string;
  source_name: string;
  source_domain?: string;
  published_at: string;
  sector: string;
  product_type?: string;
  municipality?: string;
  department?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { articles } = await req.json();
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un array de artículos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Ingesting ${articles.length} articles...`);

    const results = [];

    for (const article of articles as NewsInput[]) {
      try {
        console.log(`Processing: ${article.title}`);
        
        // Classify the article
        const classification = await classifyNews({
          title: article.title,
          summary: article.summary,
          body: article.body,
          source_domain: article.source_domain,
          sector: article.sector,
          municipality: article.municipality,
          department: article.department || 'Valle del Cauca'
        }, lovableApiKey);

        // Insert into database
        const { data, error } = await supabase
          .from('news')
          .insert({
            title: article.title,
            summary: article.summary,
            body: article.body,
            url: article.url,
            source_name: article.source_name,
            source_domain: article.source_domain,
            published_at: article.published_at,
            sector: article.sector,
            product_type: article.product_type,
            municipality: article.municipality,
            department: article.department || 'Valle del Cauca',
            sentiment_label: classification.sentiment_label,
            sentiment_score: classification.sentiment_score,
            impact_level: classification.impact_level,
            reliability_level: classification.reliability_level,
            source_type: classification.source_type,
            classification_explanation: classification.classification_explanation,
            is_top_story: false
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting article:', error);
          results.push({
            title: article.title,
            status: 'error',
            error: error.message
          });
        } else {
          console.log('Article inserted successfully:', data.id);
          results.push({
            title: article.title,
            status: 'success',
            id: data.id,
            classification
          });
        }
      } catch (error) {
        console.error('Error processing article:', error);
        results.push({
          title: article.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update top stories based on impact and recency
    const { error: updateError } = await supabase.rpc('update_top_stories' as any);
    if (updateError) {
      console.error('Error updating top stories:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: articles.length,
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in ingest-news:', error);
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
