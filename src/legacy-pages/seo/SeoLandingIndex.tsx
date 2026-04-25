import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import SeoMeta from '@/components/SeoMeta';
import { CROPS, PROVINCES, getAllSeoPairs, buildSeoUrl } from '@/lib/seoLanding';

export default function SeoLandingIndex() {
  const pairs = getAllSeoPairs();
  const grouped = pairs.reduce<Record<string, typeof pairs>>((acc, p) => {
    (acc[p.province.region] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <SeoMeta
        title="Giải pháp tưới cây trồng theo từng tỉnh thành | Nhà Bè Agri"
        description={`${pairs.length} giải pháp tưới chuyên biệt cho ${CROPS.length} loại cây trồng tại ${PROVINCES.length} tỉnh trọng điểm. Tư vấn miễn phí, đại lý gần bạn.`}
        canonical="https://nhabeagri.com/giai-phap-tuoi"
      />

      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/30 py-10">
        <div className="container">
          <Badge variant="outline" className="mb-3 gap-1.5 bg-background"><Sparkles className="w-3 h-3" /> {pairs.length} giải pháp địa phương hoá</Badge>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold">
            Giải pháp tưới <span className="text-primary">theo cây trồng & tỉnh thành</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Mỗi vùng đất, mỗi loại cây có nhu cầu nước riêng. Chọn cây trồng và tỉnh của bạn để xem giải pháp tưới chuyên biệt, giá nông sản cập nhật và đại lý gần nhất.
          </p>
        </div>
      </section>

      <div className="container py-8 space-y-8">
        {Object.entries(grouped).map(([region, items]) => (
          <section key={region}>
            <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> {region}
              <Badge variant="secondary" className="text-[10px]">{items.length} trang</Badge>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.map(({ crop, province }) => (
                <Link key={`${crop.slug}-${province.slug}`} to={buildSeoUrl(crop.slug, province.slug)}>
                  <Card className="hover:border-primary/40 hover:shadow-md transition-all">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="text-3xl">{crop.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">Tưới {crop.name}</p>
                        <p className="text-xs text-muted-foreground truncate">tại {province.name}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
