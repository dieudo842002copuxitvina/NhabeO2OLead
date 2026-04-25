import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings, Database, Cpu, Layout } from 'lucide-react';

export default function AdminConfigPage() {
  const [commodityPrices, setCommodityPrices] = useState(true);
  const [weather, setWeather] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiProductSuggestion, setAiProductSuggestion] = useState(true);
  const [aiMarketAlert, setAiMarketAlert] = useState(true);
  const [showHero, setShowHero] = useState(true);
  const [showNearbyDealers, setShowNearbyDealers] = useState(true);
  const [showMarketMini, setShowMarketMini] = useState(true);
  const [showNews, setShowNews] = useState(true);
  const [showWeatherMini, setShowWeatherMini] = useState(true);

  const handleSave = () => {
    toast.success('Cấu hình đã được lưu thành công!');
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-6 animate-slide-up">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-bold">Control Center</h1>
          <p className="text-muted-foreground">Cấu hình hệ thống Nhà Bè Agri</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Data Config */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Database className="w-5 h-5 text-info" /> Data Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Giá nông sản</Label>
                <p className="text-xs text-muted-foreground">Hiển thị biểu đồ giá cà phê, tiêu, cao su, lúa</p>
              </div>
              <Switch checked={commodityPrices} onCheckedChange={setCommodityPrices} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Thời tiết</Label>
                <p className="text-xs text-muted-foreground">Dữ liệu thời tiết và dự báo 7 ngày</p>
              </div>
              <Switch checked={weather} onCheckedChange={setWeather} />
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {commodityPrices && weather ? '2/2 nguồn đang bật' : `${[commodityPrices, weather].filter(Boolean).length}/2 nguồn đang bật`}
            </Badge>
          </CardContent>
        </Card>

        {/* AI Config */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Cpu className="w-5 h-5 text-accent" /> AI Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">AI Engine</Label>
                <p className="text-xs text-muted-foreground">Bật/tắt toàn bộ AI</p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Gợi ý sản phẩm</Label>
                <p className="text-xs text-muted-foreground">AI gợi ý dựa trên thời tiết + hành vi</p>
              </div>
              <Switch checked={aiProductSuggestion} onCheckedChange={setAiProductSuggestion} disabled={!aiEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Cảnh báo thị trường</Label>
                <p className="text-xs text-muted-foreground">AI phân tích hạn hán, mưa lớn, cơ hội</p>
              </div>
              <Switch checked={aiMarketAlert} onCheckedChange={setAiMarketAlert} disabled={!aiEnabled} />
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {aiEnabled ? 'AI đang hoạt động' : 'AI đã tắt'}
            </Badge>
          </CardContent>
        </Card>

        {/* UI Config */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Layout className="w-5 h-5 text-primary" /> UI Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Hero Banner</Label>
              <Switch checked={showHero} onCheckedChange={setShowHero} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-medium">Đại lý gần bạn</Label>
              <Switch checked={showNearbyDealers} onCheckedChange={setShowNearbyDealers} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-medium">Giá nông sản mini</Label>
              <Switch checked={showMarketMini} onCheckedChange={setShowMarketMini} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-medium">Tin tức</Label>
              <Switch checked={showNews} onCheckedChange={setShowNews} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="font-medium">Thời tiết mini</Label>
              <Switch checked={showWeatherMini} onCheckedChange={setShowWeatherMini} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={handleSave} className="px-8">
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}
