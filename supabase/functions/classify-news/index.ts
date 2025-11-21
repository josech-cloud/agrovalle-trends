import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Keywords for sentiment analysis
const POSITIVE_KEYWORDS = [
  'récord', 'cosecha', 'aumento', 'productividad', 'crecimiento', 'subsidio', 
  'apoyo', 'inversión', 'exportaciones aumentan', 'mejoran precios', 
  'beneficio', 'productores', 'buenas prácticas', 'innovación', 'sostenible', 
  'recuperación', 'mejora', 'incremento positivo', 'alza', 'bonanza'
];

const NEGATIVE_KEYWORDS = [
  'plaga', 'sequía', 'inundación', 'pérdidas', 'quiebra', 'crisis', 'paro', 
  'bloqueo', 'protesta', 'caída de precios', 'reducción', 'producción', 
  'emergencia', 'desastre', 'deuda', 'incertidumbre', 'afecta', 'amenaza',
  'daños', 'problemas', 'dificultades', 'colapso'
];

const HIGH_IMPACT_KEYWORDS = [
  'valle del cauca', 'región', 'departamento', 'pérdidas millonarias', 
  'quiebra masiva', 'cierre de plantas', 'más de 20%', 'disparada', 
  'emergencia climática', 'sequía severa', 'inundación grave', 'nueva ley',
  'aranceles', 'grandes subsidios', 'todos los municipios', 'crisis general'
];

const MEDIUM_IMPACT_KEYWORDS = [
  'municipio', 'zona específica', 'grupo de productores', 'variación moderada',
  'programa de apoyo', '5%', '10%', '15%', 'apoyo limitado'
];

// Source reliability lists
const HIGH_RELIABILITY_DOMAINS = [
  '.gov.co', '.edu.co', 'elpais.com.co', 'eltiempo.com', 
  'minagricultura.gov.co', 'agronet.gov.co', 'finagro.com.co'
];

const MEDIUM_RELIABILITY_DOMAINS = [
  'periodicolocal', 'noticiasregionales', 'agrocolombiano'
];

interface NewsArticle {
  title: string;
  summary?: string;
  body?: string;
  source_domain?: string;
  sector: string;
  municipality?: string;
  department?: string;
}

interface ClassificationResult {
  sentiment_label: 'positivo' | 'neutral' | 'negativo';
  sentiment_score: number;
  impact_level: 'alto' | 'medio' | 'bajo';
  reliability_level: 'alto' | 'medio' | 'bajo';
  source_type: 'oficial' | 'medio_nacional' | 'medio_regional' | 'blog' | 'red_social';
  classification_explanation: string;
}

/**
 * Classifies a news article using rules and ML
 */
export async function classifyNews(article: NewsArticle, lovableApiKey: string): Promise<ClassificationResult> {
  console.log('Starting classification for:', article.title);
  
  // Combine text for analysis
  const fullText = `${article.title} ${article.summary || ''} ${article.body || ''}`.toLowerCase();
  
  // 1. Rule-based sentiment analysis
  let positiveCount = 0;
  let negativeCount = 0;
  
  POSITIVE_KEYWORDS.forEach(keyword => {
    const matches = fullText.match(new RegExp(keyword, 'gi'));
    if (matches) positiveCount += matches.length;
  });
  
  NEGATIVE_KEYWORDS.forEach(keyword => {
    const matches = fullText.match(new RegExp(keyword, 'gi'));
    if (matches) negativeCount += matches.length;
  });
  
  // Calculate base sentiment
  let baseSentiment: 'positivo' | 'neutral' | 'negativo' = 'neutral';
  let baseScore = 0;
  
  if (positiveCount > negativeCount + 2) {
    baseSentiment = 'positivo';
    baseScore = Math.min(0.8, 0.3 + (positiveCount - negativeCount) * 0.1);
  } else if (negativeCount > positiveCount + 2) {
    baseSentiment = 'negativo';
    baseScore = Math.max(-0.8, -0.3 - (negativeCount - positiveCount) * 0.1);
  }
  
  // 2. Determine impact level
  let impactLevel: 'alto' | 'medio' | 'bajo' = 'bajo';
  const hasHighImpact = HIGH_IMPACT_KEYWORDS.some(keyword => fullText.includes(keyword));
  const hasMediumImpact = MEDIUM_IMPACT_KEYWORDS.some(keyword => fullText.includes(keyword));
  
  if (hasHighImpact || (article.department === 'Valle del Cauca' && fullText.includes('región'))) {
    impactLevel = 'alto';
  } else if (hasMediumImpact || article.municipality) {
    impactLevel = 'medio';
  }
  
  // Check for percentage mentions that indicate high impact
  const percentageMatch = fullText.match(/(\d+)%/);
  if (percentageMatch) {
    const percentage = parseInt(percentageMatch[1]);
    if (percentage >= 20) impactLevel = 'alto';
    else if (percentage >= 10) impactLevel = 'medio';
  }
  
  // 3. Determine source reliability
  let reliabilityLevel: 'alto' | 'medio' | 'bajo' = 'bajo';
  let sourceType: 'oficial' | 'medio_nacional' | 'medio_regional' | 'blog' | 'red_social' = 'blog';
  
  const domain = article.source_domain?.toLowerCase() || '';
  
  if (HIGH_RELIABILITY_DOMAINS.some(d => domain.includes(d))) {
    reliabilityLevel = 'alto';
    if (domain.includes('.gov.co') || domain.includes('.edu.co')) {
      sourceType = 'oficial';
    } else {
      sourceType = 'medio_nacional';
    }
  } else if (MEDIUM_RELIABILITY_DOMAINS.some(d => domain.includes(d))) {
    reliabilityLevel = 'medio';
    sourceType = 'medio_regional';
  }
  
  // 4. Refine with ML
  try {
    const mlResult = await refineWithML(article, baseSentiment, baseScore, impactLevel, lovableApiKey);
    
    return {
      sentiment_label: mlResult.sentiment_label || baseSentiment,
      sentiment_score: mlResult.sentiment_score || baseScore,
      impact_level: mlResult.impact_level || impactLevel,
      reliability_level: reliabilityLevel,
      source_type: sourceType,
      classification_explanation: mlResult.explanation || generateExplanation(baseSentiment, baseScore, impactLevel, reliabilityLevel)
    };
  } catch (error) {
    console.error('ML refinement failed, using rule-based results:', error);
    
    return {
      sentiment_label: baseSentiment,
      sentiment_score: baseScore,
      impact_level: impactLevel,
      reliability_level: reliabilityLevel,
      source_type: sourceType,
      classification_explanation: generateExplanation(baseSentiment, baseScore, impactLevel, reliabilityLevel)
    };
  }
}

/**
 * Refine classification using Lovable AI
 */
async function refineWithML(
  article: NewsArticle, 
  baseSentiment: string, 
  baseScore: number, 
  baseImpact: string,
  lovableApiKey: string
): Promise<{
  sentiment_label?: 'positivo' | 'neutral' | 'negativo';
  sentiment_score?: number;
  impact_level?: 'alto' | 'medio' | 'bajo';
  explanation?: string;
}> {
  const text = `${article.title}\n\n${article.summary || ''}`;
  
  const systemPrompt = `Eres un clasificador experto de noticias del sector agropecuario del Valle del Cauca, Colombia. 
Tu tarea es analizar noticias y clasificarlas según su sentimiento (positivo, neutral, negativo) e impacto (alto, medio, bajo) para los productores agrícolas.

CRITERIOS DE SENTIMIENTO:
- POSITIVO: Noticias sobre aumentos de producción, buenos precios, subsidios, innovación, récords, recuperación
- NEGATIVO: Noticias sobre plagas, sequías, pérdidas, crisis, caída de precios, problemas climáticos
- NEUTRAL: Noticias informativas sin impacto emocional claro

CRITERIOS DE IMPACTO:
- ALTO: Afecta a todo el Valle del Cauca o varios municipios, pérdidas/ganancias significativas, cambios de política importantes
- MEDIO: Afecta a un municipio específico o un grupo de productores
- BAJO: Casos muy localizados, eventos pequeños, noticias anecdóticas

Debes considerar el contexto agrícola colombiano y la importancia para los productores locales.`;

  const userPrompt = `Analiza esta noticia del sector agropecuario:

TÍTULO: ${article.title}
${article.summary ? `RESUMEN: ${article.summary}` : ''}
SECTOR: ${article.sector}
${article.municipality ? `MUNICIPIO: ${article.municipality}` : ''}

Clasificación inicial basada en reglas:
- Sentimiento: ${baseSentiment} (score: ${baseScore})
- Impacto: ${baseImpact}

Por favor, confirma o ajusta esta clasificación y proporciona una explicación clara de 2-3 frases.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'classify_news',
            description: 'Clasificar una noticia agrícola según sentimiento e impacto',
            parameters: {
              type: 'object',
              properties: {
                sentiment_label: {
                  type: 'string',
                  enum: ['positivo', 'neutral', 'negativo'],
                  description: 'El sentimiento de la noticia'
                },
                sentiment_score: {
                  type: 'number',
                  description: 'Score de -1 a 1, donde -1 es muy negativo y 1 es muy positivo'
                },
                impact_level: {
                  type: 'string',
                  enum: ['alto', 'medio', 'bajo'],
                  description: 'El nivel de impacto de la noticia'
                },
                explanation: {
                  type: 'string',
                  description: 'Explicación breve de 2-3 frases sobre la clasificación'
                }
              },
              required: ['sentiment_label', 'sentiment_score', 'impact_level', 'explanation']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'classify_news' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('ML classification result:', JSON.stringify(data));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return result;
    }
    
    throw new Error('No tool call in response');
  } catch (error) {
    console.error('Error calling Lovable AI:', error);
    throw error;
  }
}

/**
 * Generate explanation for classification
 */
function generateExplanation(
  sentiment: string, 
  score: number, 
  impact: string, 
  reliability: string
): string {
  const sentimentText = sentiment === 'positivo' 
    ? 'positiva por palabras clave como récord, aumento o mejora'
    : sentiment === 'negativo'
    ? 'negativa por palabras clave como pérdidas, crisis o problemas'
    : 'neutral por no presentar tendencia clara';
    
  const impactText = impact === 'alto'
    ? 'Impacto alto porque afecta a múltiples municipios o al sector completo'
    : impact === 'medio'
    ? 'Impacto medio porque afecta a un grupo específico de productores'
    : 'Impacto bajo por ser muy localizado';
    
  const reliabilityText = reliability === 'alto'
    ? 'Veracidad alta por fuente oficial o medio reconocido'
    : reliability === 'medio'
    ? 'Veracidad media por medio regional conocido'
    : 'Veracidad baja por fuente no verificada';
    
  return `Clasificada como ${sentimentText}. ${impactText}. ${reliabilityText}.`;
}
