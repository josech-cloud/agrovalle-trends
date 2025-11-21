-- Create enum types for classification
CREATE TYPE sentiment_type AS ENUM ('positivo', 'neutral', 'negativo');
CREATE TYPE impact_level AS ENUM ('alto', 'medio', 'bajo');
CREATE TYPE reliability_level AS ENUM ('alto', 'medio', 'bajo');
CREATE TYPE source_type AS ENUM ('oficial', 'medio_nacional', 'medio_regional', 'blog', 'red_social');

-- Create news table
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  url TEXT,
  source_name TEXT NOT NULL,
  source_domain TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  sector TEXT NOT NULL,
  product_type TEXT,
  municipality TEXT,
  department TEXT DEFAULT 'Valle del Cauca',
  sentiment_label sentiment_type NOT NULL,
  sentiment_score FLOAT NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  impact_level impact_level NOT NULL,
  reliability_level reliability_level NOT NULL,
  trend_category TEXT,
  is_top_story BOOLEAN DEFAULT false,
  classification_version TEXT DEFAULT '1.0',
  classification_explanation TEXT,
  source_type source_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create classification_feedback table for learning from corrections
CREATE TABLE public.classification_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES public.news(id) ON DELETE CASCADE NOT NULL,
  old_sentiment_label sentiment_type,
  new_sentiment_label sentiment_type,
  old_impact_level impact_level,
  new_impact_level impact_level,
  old_reliability_level reliability_level,
  new_reliability_level reliability_level,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_sector ON public.news(sector);
CREATE INDEX idx_news_sentiment ON public.news(sentiment_label);
CREATE INDEX idx_news_impact ON public.news(impact_level);
CREATE INDEX idx_news_is_top_story ON public.news(is_top_story);
CREATE INDEX idx_news_ingested_at ON public.news(ingested_at DESC);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classification_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to news
CREATE POLICY "News are viewable by everyone"
  ON public.news
  FOR SELECT
  USING (true);

-- Create policies for classification_feedback (only for admin operations via edge functions)
CREATE POLICY "Feedback viewable by everyone"
  ON public.classification_feedback
  FOR SELECT
  USING (true);