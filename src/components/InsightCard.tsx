import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsInsight } from '@/data/types';
import { AlertTriangle, TrendingUp, MapPin, PackageCheck } from 'lucide-react';

const iconMap = {
  restock: PackageCheck,
  trending: TrendingUp,
  regional: MapPin,
  warning: AlertTriangle,
};

const colorMap = {
  restock: 'text-info',
  trending: 'text-success',
  regional: 'text-primary',
  warning: 'text-warning',
};

interface InsightCardProps {
  insight: AnalyticsInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const Icon = iconMap[insight.type];
  const color = colorMap[insight.type];

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <CardTitle className="text-sm font-semibold">{insight.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        {insight.metric && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-lg font-display font-bold">{insight.metric}</span>
            {insight.change !== undefined && (
              <span className={`text-xs font-medium ${insight.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {insight.change >= 0 ? '↑' : '↓'}{Math.abs(insight.change)}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
