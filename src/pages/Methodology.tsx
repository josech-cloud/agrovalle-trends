import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Methodology = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a inicio
          </Link>
          <h1 className="text-3xl font-bold">Metodología de Clasificación</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Clasificación de Sentimiento</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Analizamos cada noticia para determinar si es positiva, neutral o negativa:</p>
            <ul>
              <li><strong>Positivo:</strong> Noticias sobre récords, aumentos de producción, buenos precios, subsidios, innovación tecnológica</li>
              <li><strong>Neutral:</strong> Información general sin tendencia emocional clara</li>
              <li><strong>Negativo:</strong> Plagas, sequías, pérdidas, crisis, caída de precios</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nivel de Impacto</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul>
              <li><strong>Alto:</strong> Afecta todo el Valle o múltiples municipios, cambios significativos de precios (&gt;20%), políticas departamentales</li>
              <li><strong>Medio:</strong> Afecta un municipio específico o grupo de productores, cambios moderados (5-20%)</li>
              <li><strong>Bajo:</strong> Casos localizados, eventos pequeños, noticias anecdóticas</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Veracidad de Fuente</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul>
              <li><strong>Alta:</strong> Fuentes oficiales (.gov.co), medios nacionales reconocidos, universidades</li>
              <li><strong>Media:</strong> Medios regionales conocidos, portales especializados</li>
              <li><strong>Baja:</strong> Blogs, fuentes no verificadas, redes sociales</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inteligencia Artificial y Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>Nuestro sistema combina reglas claras con inteligencia artificial:</p>
            <ol>
              <li>Análisis inicial con palabras clave y reglas programadas</li>
              <li>Refinamiento con modelo de lenguaje (Gemini 2.5 Flash)</li>
              <li>Aprendizaje continuo: cuando los administradores corrigen clasificaciones, el sistema aprende de esos ejemplos</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Methodology;
