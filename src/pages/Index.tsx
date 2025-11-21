import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { StatsBar } from "@/components/StatsBar";
import { FilterDrawer, FilterState } from "@/components/FilterDrawer";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface News {
  id: string;
  title: string;
  summary?: string;
  source_name: string;
  published_at: string;
  sector: string;
  product_type?: string;
  sentiment_label: 'positivo' | 'neutral' | 'negativo';
  sentiment_score: number;
  impact_level: 'alto' | 'medio' | 'bajo';
  reliability_level: 'alto' | 'medio' | 'bajo';
  url?: string;
  is_top_story: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [news, setNews] = useState<News[]>([]);
  const [topStories, setTopStories] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    sectors: [],
    productTypes: [],
    municipalities: [],
    sentiments: [],
    impactLevels: [],
    reliabilityLevels: []
  });

  // Stats for the stats bar
  const [stats, setStats] = useState({
    total: 0,
    positivePercent: 0,
    neutralPercent: 0,
    negativePercent: 0,
    dailyTrend: [0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    fetchNews();
  }, [filters, page]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20'
      });

      // Add filters
      filters.sectors.forEach(s => params.append('sector', s));
      filters.municipalities.forEach(m => params.append('municipality', m));
      filters.sentiments.forEach(s => params.append('sentiment', s));
      filters.impactLevels.forEach(i => params.append('impact_level', i));
      filters.reliabilityLevels.forEach(r => params.append('reliability_level', r));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-news?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar noticias');

      const data = await response.json();
      setNews(data.news || []);
      setTotalPages(data.pagination?.totalPages || 1);

      // Get top stories
      const top = (data.news || []).filter((n: News) => n.is_top_story).slice(0, 3);
      setTopStories(top);

      // Calculate stats
      const allNews = data.news || [];
      const positive = allNews.filter((n: News) => n.sentiment_label === 'positivo').length;
      const neutral = allNews.filter((n: News) => n.sentiment_label === 'neutral').length;
      const negative = allNews.filter((n: News) => n.sentiment_label === 'negativo').length;
      const total = allNews.length;

      setStats({
        total,
        positivePercent: total > 0 ? (positive / total) * 100 : 0,
        neutralPercent: total > 0 ? (neutral / total) * 100 : 0,
        negativePercent: total > 0 ? (negative / total) * 100 : 0,
        dailyTrend: [2, 3, -1, 4, 1, -2, 3] // Simplified - in real app, calculate from data
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las noticias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-primary">AgroValle al día</h1>
              <p className="text-sm text-muted-foreground">Noticias agrícolas en tiempo real</p>
            </Link>
            <nav className="flex gap-4">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link to="/tendencias" className="text-sm font-medium hover:text-primary transition-colors">
                Tendencias
              </Link>
              <Link to="/metodologia" className="text-sm font-medium hover:text-primary transition-colors">
                Metodología
              </Link>
              <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Bar */}
        <StatsBar totalNews={stats.total} positivePercent={stats.positivePercent} neutralPercent={stats.neutralPercent} negativePercent={stats.negativePercent} dailyTrend={stats.dailyTrend} />

        {/* Filter Button */}
        <div className="mb-6">
          <FilterDrawer filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Top Stories */}
        {topStories.length > 0 && page === 1 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Las 3 noticias más impactantes de hoy</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topStories.map(story => (
                <NewsCard key={story.id} {...story} />
              ))}
            </div>
          </section>
        )}

        {/* All News */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Todas las noticias</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron noticias con los filtros seleccionados</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {news.filter(n => !n.is_top_story || page > 1).map(article => (
                  <NewsCard key={article.id} {...article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AgroValle al día - Noticias agrícolas del Valle del Cauca</p>
          <p className="mt-2">Última actualización: {new Date().toLocaleString('es-CO')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
