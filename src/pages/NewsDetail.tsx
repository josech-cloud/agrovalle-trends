import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Minus, Shield, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface News {
  id: string;
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
  department: string;
  sentiment_label: 'positivo' | 'neutral' | 'negativo';
  sentiment_score: number;
  impact_level: 'alto' | 'medio' | 'bajo';
  reliability_level: 'alto' | 'medio' | 'bajo';
  classification_explanation?: string;
}

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setNews(data);
    } catch (error) {
      console.error('Error fetching news detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Noticia no encontrada</h1>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const getSentimentColor = () => {
    switch (news.sentiment_label) {
      case 'positivo': return 'bg-green-100 text-green-800 border-green-300';
      case 'negativo': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSentimentIcon = () => {
    switch (news.sentiment_label) {
      case 'positivo': return <TrendingUp className="h-5 w-5" />;
      case 'negativo': return <TrendingDown className="h-5 w-5" />;
      default: return <Minus className="h-5 w-5" />;
    }
  };

  const getReliabilityIcon = () => {
    switch (news.reliability_level) {
      case 'alto': return <Shield className="h-5 w-5 text-primary" />;
      case 'medio': return <ShieldQuestion className="h-5 w-5 text-muted" />;
      default: return <ShieldAlert className="h-5 w-5 text-destructive" />;
    }
  };

  const formattedDate = new Date(news.published_at).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Volver a inicio
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{news.title}</h1>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline" className={`${getSentimentColor()} flex items-center gap-2 text-base px-3 py-1`}>
              {getSentimentIcon()}
              <span className="capitalize">{news.sentiment_label}</span>
            </Badge>
            <Badge variant="outline" className="border-primary/40 text-base px-3 py-1">
              Impacto: {news.impact_level}
            </Badge>
            <div className="flex items-center gap-2">
              {getReliabilityIcon()}
              <span className="text-sm">Veracidad: {news.reliability_level}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm text-muted-foreground">
            <div>
              <strong>Fuente:</strong> {news.source_name}
              {news.url && (
                <a 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver original
                </a>
              )}
            </div>
            <div><strong>Publicado:</strong> {formattedDate}</div>
            <div><strong>Sector:</strong> <span className="capitalize">{news.sector}</span></div>
            {news.product_type && (
              <div><strong>Producto:</strong> <span className="capitalize">{news.product_type}</span></div>
            )}
            {news.municipality && (
              <div><strong>Municipio:</strong> {news.municipality}</div>
            )}
            <div><strong>Departamento:</strong> {news.department}</div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">
                {news.summary || news.body || 'Sin resumen disponible'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary">📊</span>
                Análisis automático
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Clasificación de sentimiento:</h3>
                <p className="text-sm text-muted-foreground">
                  Esta noticia fue clasificada como <strong className="capitalize">{news.sentiment_label}</strong> con un score de{' '}
                  <strong>{news.sentiment_score.toFixed(2)}</strong>. 
                  {news.sentiment_label === 'positivo' && 
                    ' Esto indica que la noticia contiene información favorable para el sector agrícola, como aumentos en producción, mejores precios o apoyo gubernamental.'}
                  {news.sentiment_label === 'negativo' && 
                    ' Esto indica que la noticia presenta desafíos o problemas para el sector, como pérdidas, crisis o condiciones adversas.'}
                  {news.sentiment_label === 'neutral' && 
                    ' Esto indica que la noticia presenta información sin una tendencia emocional clara o contiene tanto aspectos positivos como negativos.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Nivel de impacto:</h3>
                <p className="text-sm text-muted-foreground">
                  El impacto fue clasificado como <strong>{news.impact_level}</strong>.
                  {news.impact_level === 'alto' && 
                    ' Esto significa que la noticia afecta a múltiples municipios o a todo el departamento, con implicaciones significativas para el sector.'}
                  {news.impact_level === 'medio' && 
                    ' Esto significa que la noticia afecta principalmente a un municipio o grupo específico de productores.'}
                  {news.impact_level === 'bajo' && 
                    ' Esto significa que el impacto es muy localizado o se trata de un evento de menor escala.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Veracidad de la fuente:</h3>
                <p className="text-sm text-muted-foreground">
                  La fuente fue calificada con veracidad <strong>{news.reliability_level}</strong>.
                  {news.reliability_level === 'alto' && 
                    ' Esto indica que proviene de una fuente oficial, medio nacional reconocido o institución educativa con alta credibilidad.'}
                  {news.reliability_level === 'medio' && 
                    ' Esto indica que proviene de un medio regional conocido o portal especializado con reputación establecida.'}
                  {news.reliability_level === 'bajo' && 
                    ' Esto indica que la fuente no está verificada o proviene de canales con menor credibilidad establecida.'}
                </p>
              </div>

              {news.classification_explanation && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Explicación técnica:</h3>
                  <p className="text-sm text-muted-foreground italic">
                    {news.classification_explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  );
};

export default NewsDetail;
