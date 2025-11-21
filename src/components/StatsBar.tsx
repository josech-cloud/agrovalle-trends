import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsBarProps {
  totalNews: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  dailyTrend: number[];
}

export const StatsBar = ({
  totalNews,
  positivePercent,
  neutralPercent,
  negativePercent,
  dailyTrend
}: StatsBarProps) => {
  const max = Math.max(...dailyTrend.map(Math.abs), 1);
  const normalizedTrend = dailyTrend.map(v => (v / max) * 20);

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm font-medium">
              Hoy: <span className="text-2xl font-bold text-primary">{totalNews}</span> noticias
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-600">{positivePercent.toFixed(0)}% positivas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Minus className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-600">{neutralPercent.toFixed(0)}% neutrales</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-600">{negativePercent.toFixed(0)}% negativas</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-end gap-0.5 h-8">
          {normalizedTrend.slice(-7).map((value, index) => (
            <div
              key={index}
              className={`w-2 transition-all ${
                value > 0 ? 'bg-green-500' : value < 0 ? 'bg-red-500' : 'bg-gray-300'
              }`}
              style={{
                height: `${Math.abs(value) + 2}px`,
                alignSelf: value >= 0 ? 'flex-end' : 'flex-start'
              }}
              title={`Día ${index + 1}: ${value > 0 ? '+' : ''}${dailyTrend[index]}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
