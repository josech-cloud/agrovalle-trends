import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectorStat {
  sector: string;
  total: number;
  positivo: number;
  neutral: number;
  negativo: number;
  positivePercentage: number;
  negativePercentage: number;
}

const Trends = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sectorStats, setSectorStats] = useState<SectorStat[]>([]);
  const [dailyBalance, setDailyBalance] = useState<{date: string; balance: number}[]>([]);
  const [dateRange, setDateRange] = useState({ days: 7 });

  useEffect(() => {
    fetchTrends();
  }, [dateRange]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - dateRange.days);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-trends?fromDate=${fromDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar tendencias');

      const data = await response.json();
      setSectorStats(data.sectorStats || []);
      setDailyBalance(data.dailyBalance || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tendencias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a inicio
          </Link>
          <h1 className="text-3xl font-bold">Tendencias del Sector Agropecuario</h1>
          <p className="text-muted-foreground mt-2">Análisis estadístico de noticias del Valle del Cauca</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <Button
            variant={dateRange.days === 7 ? "default" : "outline"}
            onClick={() => setDateRange({ days: 7 })}
          >
            Últimos 7 días
          </Button>
          <Button
            variant={dateRange.days === 30 ? "default" : "outline"}
            onClick={() => setDateRange({ days: 30 })}
          >
            Últimos 30 días
          </Button>
          <Button
            variant={dateRange.days === 90 ? "default" : "outline"}
            onClick={() => setDateRange({ days: 90 })}
          >
            Últimos 90 días
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sector Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Noticias por Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sectorStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="sector" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positivo" stackId="a" fill="#22c55e" name="Positivas" />
                    <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Neutrales" />
                    <Bar dataKey="negativo" stackId="a" fill="#ef4444" name="Negativas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Diario de Noticias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyBalance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('es-CO')}
                    />
                    <Line type="monotone" dataKey="balance" stroke="#f97316" strokeWidth={2} name="Balance" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sector Rankings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Top Sectores con Más Noticias Positivas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sectorStats
                      .sort((a, b) => b.positivePercentage - a.positivePercentage)
                      .slice(0, 5)
                      .map((sector, index) => (
                        <div key={sector.sector} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                            <span className="capitalize">{sector.sector}</span>
                          </div>
                          <span className="font-semibold text-green-600">
                            {sector.positivePercentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Top Sectores con Más Noticias Negativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sectorStats
                      .sort((a, b) => b.negativePercentage - a.negativePercentage)
                      .slice(0, 5)
                      .map((sector, index) => (
                        <div key={sector.sector} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                            <span className="capitalize">{sector.sector}</span>
                          </div>
                          <span className="font-semibold text-red-600">
                            {sector.negativePercentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Detalladas por Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-2">Sector</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right text-green-600">Positivas</th>
                        <th className="p-2 text-right">Neutrales</th>
                        <th className="p-2 text-right text-red-600">Negativas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectorStats.map(sector => (
                        <tr key={sector.sector} className="border-b">
                          <td className="p-2 capitalize font-medium">{sector.sector}</td>
                          <td className="p-2 text-right">{sector.total}</td>
                          <td className="p-2 text-right">{sector.positivo} ({sector.positivePercentage.toFixed(0)}%)</td>
                          <td className="p-2 text-right">{sector.neutral}</td>
                          <td className="p-2 text-right">{sector.negativo} ({sector.negativePercentage.toFixed(0)}%)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Trends;
