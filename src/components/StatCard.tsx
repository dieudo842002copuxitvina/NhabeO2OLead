import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-display font-bold mt-1">{value}</p>
            {change !== undefined && (
              <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% so với tháng trước
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg bg-muted`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
