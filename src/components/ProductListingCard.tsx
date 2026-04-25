import { useState } from "react";
import { ImageOff, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ProductListingCardProps {
  name: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  currency?: string;
  loading?: boolean;
  className?: string;
  onView?: () => void;
}

const formatPrice = (value: number, currency = "₫") =>
  `${new Intl.NumberFormat("vi-VN").format(value)} ${currency}`;

export function ProductListingCard({
  name,
  price,
  image,
  category,
  isPopular,
  currency,
  loading,
  className,
  onView,
}: ProductListingCardProps) {
  const [imgError, setImgError] = useState(false);

  if (loading) {
    return (
      <Card className={cn("overflow-hidden rounded-xl", className)}>
        <Skeleton className="aspect-square w-full rounded-none" />
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-1/2 mt-2" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Skeleton className="h-11 w-full rounded-md" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-xl border-border/60 transition-all",
        "hover:shadow-md hover:border-primary/40",
        "flex flex-col",
        className,
      )}
    >
      <button
        onClick={onView}
        className="relative block aspect-square w-full overflow-hidden bg-muted"
        aria-label={name}
      >
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {isPopular && (
          <Badge className="absolute top-2 left-2 gap-1 bg-warning text-warning-foreground hover:bg-warning shadow-sm">
            <Sparkles className="w-3 h-3" /> Phổ biến
          </Badge>
        )}
      </button>

      <CardContent className="p-4 space-y-1.5 flex-1">
        <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
          {category}
        </Badge>
        <h3
          className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors"
          title={name}
        >
          {name}
        </h3>
        <p className="pt-1 text-lg font-bold text-primary">{formatPrice(price, currency)}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={onView} className="w-full h-11 font-semibold">
          Xem chi tiết
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductListingCard;
