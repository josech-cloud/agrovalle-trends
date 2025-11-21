import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  useEffect(() => {
    if (authenticated) fetchNews();
  }, [authenticated]);

  const fetchNews = async () => {
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false }).limit(20);
    if (data) setNews(data);
  };

  const handleSubmit = async () => {
    if (!selectedNews) return;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        news_id: selectedNews.id,
        new_sentiment_label: selectedNews.sentiment_label,
        new_impact_level: selectedNews.impact_level,
        new_reliability_level: selectedNews.reliability_level,
        comment: 'Corrección manual',
        admin_password: password
      })
    });

    if (response.ok) {
      toast({ title: "Éxito", description: "Clasificación actualizada" });
      fetchNews();
      setSelectedNews(null);
    } else {
      toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" });
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader><CardTitle>Panel de Administración</CardTitle></CardHeader>
          <CardContent>
            <Label>Contraseña</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button className="w-full mt-4" onClick={() => setAuthenticated(password === 'admin_password')}>Ingresar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Noticias Recientes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {news.map(n => (
                  <div key={n.id} className="p-2 border rounded cursor-pointer hover:bg-accent" onClick={() => setSelectedNews(n)}>
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground">Sentimiento: {n.sentiment_label} | Impacto: {n.impact_level}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedNews && (
            <Card>
              <CardHeader><CardTitle>Editar Clasificación</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sentimiento</Label>
                  <Select value={selectedNews.sentiment_label} onValueChange={(v) => setSelectedNews({...selectedNews, sentiment_label: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positivo">Positivo</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negativo">Negativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Impacto</Label>
                  <Select value={selectedNews.impact_level} onValueChange={(v) => setSelectedNews({...selectedNews, impact_level: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="bajo">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSubmit} className="w-full gap-2"><Save className="h-4 w-4" />Guardar Cambios</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
