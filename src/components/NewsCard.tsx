import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Shield, ShieldAlert, ShieldQuestion } from "lucide-react";

interface NewsCardProps {
  id: string;
  title: string;
  summary?: string;
  source_name: string;
  published_at: string;
  sector: string;
  product_type?: string;
  sentiment_label: 'positivo' | 'neutral' | 'negativo';
  impact_level: 'alto' | 'medio' | 'bajo';
  reliability_level: 'alto' | 'medio' | 'bajo';
  url?: string;
  is_top_story?: boolean;
}

export const NewsCard = ({
  id,
  title,
  summary,
  source_name,
  published_at,
  sector,
  product_type,
  sentiment_label,
  impact_level,
  reliability_level,
  url,
  is_top_story
}: NewsCardProps) => {
  const getSentimentColor = () => {
    switch (sentiment_label) {
      case 'positivo': return 'bg-green-100 text-green-800 border-green-300';
      case 'negativo': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSentimentIcon = () => {
    switch (sentiment_label) {
      case 'positivo': return <TrendingUp className="h-3 w-3" />;
      case 'negativo': return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getImpactBorder = () => {
    switch (impact_level) {
      case 'alto': return 'border-l-4';
      case 'medio': return 'border-l-2';
      default: return 'border-l';
    }
  };

  const getReliabilityIcon = () => {
    switch (reliability_level) {
      case 'alto': return <Shield className="h-4 w-4 text-primary" />;
      case 'medio': return <ShieldQuestion className="h-4 w-4 text-muted" />;
      default: return <ShieldAlert className="h-4 w-4 text-destructive" />;
    }
  };

  const formattedDate = new Date(published_at).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className={`hover:shadow-lg transition-shadow ${getImpactBorder()} ${is_top_story ? 'bg-accent/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/noticia/${id}`} className="flex-1 group">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          {is_top_story && (
            <Badge variant="secondary" className="shrink-0">
              Top Historia
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={`${getSentimentColor()} flex items-center gap-1`}>
            {getSentimentIcon()}
            <span className="capitalize">{sentiment_label}</span>
          </Badge>
          <Badge variant="outline" className="border-primary/40">
            Impacto: {impact_level}
          </Badge>
          <div className="flex items-center gap-1">
            {getReliabilityIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {summary}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{source_name}</span>
          <span>•</span>
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="capitalize">{sector}</span>
          {product_type && (
            <>
              <span>•</span>
              <span className="capitalize">{product_type}</span>
            </>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <Link 
            to={`/noticia/${id}`}
            className="text-sm text-primary hover:underline font-medium"
          >
            Ver análisis completo →
          </Link>
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 ml-auto"
            >
              <ExternalLink className="h-3 w-3" />
              Fuente original
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
