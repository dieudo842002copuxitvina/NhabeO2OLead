import { newsArticles } from '@/data/mock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { NewsCardSkeleton } from '@/components/skeletons/PriceTickerSkeleton';

const categories = ['Tất cả', 'Thị trường', 'Công nghệ', 'Thời tiết', 'Tin tức'];

export default function NewsPage() {
  const [category, setCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const filtered = category === 'Tất cả'
    ? newsArticles
    : newsArticles.filter(a => a.category === category);

  return (
    <div className="container py-8">
      <div className="animate-slide-up">
        <h1 className="font-display text-3xl font-bold mb-1">Tin tức nông nghiệp</h1>
        <p className="text-muted-foreground mb-6">Cập nhật thị trường, công nghệ và thời tiết</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-colors ${
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-muted border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? <NewsCardSkeleton /> : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((article, i) => (
          <Card key={article.id} className="animate-slide-up hover:shadow-lg transition-shadow group cursor-pointer" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="aspect-[16/9] bg-muted rounded-t-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
                <span className="text-4xl opacity-30">
                  {article.category === 'Thị trường' ? '📈' : article.category === 'Công nghệ' ? '🔬' : article.category === 'Thời tiết' ? '🌤️' : '📰'}
                </span>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px]">{article.category}</Badge>
                {article.aiSummary && (
                  <Badge className="bg-info/10 text-info border-0 text-[10px]">🤖 AI tóm tắt</Badge>
                )}
              </div>
              <h3 className="font-display font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{article.summary}</p>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>{article.date}</span>
                <span>{article.readTime} đọc</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
