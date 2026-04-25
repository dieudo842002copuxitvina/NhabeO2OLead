import { customers } from '@/data/mock';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function FieldSalesCustomersPage() {
  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Quản lý khách hàng</h1>
      <p className="text-muted-foreground mb-6">{customers.length} khách hàng trong khu vực</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.map(cust => (
          <Card key={cust.id} className="animate-fade-in">
            <CardContent className="p-5">
              <h3 className="font-display font-semibold">{cust.name}</h3>
              <div className="space-y-1.5 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {cust.address}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> {cust.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> {cust.email}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
