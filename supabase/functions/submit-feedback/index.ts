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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      news_id, 
      new_sentiment_label, 
      new_impact_level, 
      new_reliability_level, 
      comment,
      admin_password 
    } = await req.json();

    // Simple admin password check
    const expectedPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin_password';
    if (admin_password !== expectedPassword) {
      return new Response(
        JSON.stringify({ error: 'Contraseña de administrador incorrecta' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!news_id) {
      return new Response(
        JSON.stringify({ error: 'Se requiere news_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current news data
    const { data: currentNews, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .eq('id', news_id)
      .single();

    if (fetchError || !currentNews) {
      return new Response(
        JSON.stringify({ error: 'Noticia no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert feedback record
    const { error: feedbackError } = await supabase
      .from('classification_feedback')
      .insert({
        news_id,
        old_sentiment_label: currentNews.sentiment_label,
        new_sentiment_label: new_sentiment_label || currentNews.sentiment_label,
        old_impact_level: currentNews.impact_level,
        new_impact_level: new_impact_level || currentNews.impact_level,
        old_reliability_level: currentNews.reliability_level,
        new_reliability_level: new_reliability_level || currentNews.reliability_level,
        comment
      });

    if (feedbackError) {
      throw feedbackError;
    }

    // Update news with new values
    const updateData: any = {};
    if (new_sentiment_label) {
      updateData.sentiment_label = new_sentiment_label;
      // Recalculate score based on new label
      updateData.sentiment_score = new_sentiment_label === 'positivo' ? 0.7 :
                                   new_sentiment_label === 'negativo' ? -0.7 : 0;
    }
    if (new_impact_level) updateData.impact_level = new_impact_level;
    if (new_reliability_level) updateData.reliability_level = new_reliability_level;

    const { error: updateError } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', news_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Feedback registrado y noticia actualizada correctamente'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in submit-feedback:', error);
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
