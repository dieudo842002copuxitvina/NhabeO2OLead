'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Package,
  Edit3,
  Save,
  RefreshCw,
  Globe,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Box,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// ─── Types ───────────────────────────────────────────────────────────
interface SpecField {
  key: string;
  label: string;
  value: string;
  unit?: string;
}

interface MockProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  active: boolean;
  image: string | null;
  specifications: Record<string, string>;
}

// ─── Spec Schema Per Category ────────────────────────────────────────
const SPEC_SCHEMA: Record<string, SpecField[]> = {
  van: [
    { key: 'nominal_diameter', label: 'Đường kính danh định', value: '', unit: 'mm' },
    { key: 'max_pressure', label: 'Áp suất tối đa', value: '', unit: 'bar' },
    { key: 'material', label: 'Chất liệu', value: '' },
    { key: 'connection_type', label: 'Kiểu kết nối', value: '' },
  ],
  pipe: [
    { key: 'outer_diameter', label: 'Đường kính ngoài', value: '', unit: 'mm' },
    { key: 'wall_thickness', label: 'Độ dày thành ống', value: '', unit: 'mm' },
    { key: 'material', label: 'Chất liệu', value: '' },
    { key: 'pressure_rating', label: 'Cấp áp suất', value: '', unit: 'bar' },
    { key: 'roll_length', label: 'Chiều dài cuộn', value: '', unit: 'm' },
  ],
  nozzle: [
    { key: 'flow_rate', label: 'Lưu lượng', value: '', unit: 'L/h' },
    { key: 'spray_radius', label: 'Bán kính phun', value: '', unit: 'm' },
    { key: 'spray_angle', label: 'Góc phun', value: '', unit: '°' },
    { key: 'connection_size', label: 'Kích thước đầu nối', value: '', unit: 'mm' },
  ],
  pump: [
    { key: 'power', label: 'Công suất', value: '', unit: 'HP' },
    { key: 'max_flow', label: 'Lưu lượng tối đa', value: '', unit: 'm³/h' },
    { key: 'max_head', label: 'Cột áp tối đa', value: '', unit: 'm' },
    { key: 'inlet_size', label: 'Cỡ đầu hút', value: '', unit: 'inch' },
    { key: 'outlet_size', label: 'Cỡ đầu đẩy', value: '', unit: 'inch' },
    { key: 'voltage', label: 'Điện áp', value: '', unit: 'V' },
  ],
  fertilizer: [
    { key: 'npk_ratio', label: 'Tỷ lệ NPK', value: '' },
    { key: 'weight', label: 'Trọng lượng', value: '', unit: 'kg' },
    { key: 'application_method', label: 'Phương pháp bón', value: '' },
  ],
  sensor: [
    { key: 'measurement_range', label: 'Phạm vi đo', value: '' },
    { key: 'accuracy', label: 'Độ chính xác', value: '' },
    { key: 'protocol', label: 'Giao thức', value: '' },
    { key: 'battery_life', label: 'Tuổi thọ pin', value: '', unit: 'tháng' },
  ],
};

const DEFAULT_SPEC_SCHEMA: SpecField[] = [
  { key: 'description', label: 'Mô tả kỹ thuật', value: '' },
  { key: 'material', label: 'Chất liệu', value: '' },
  { key: 'origin', label: 'Xuất xứ', value: '' },
];

// ─── Mock Products ───────────────────────────────────────────────────
const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'p-1', name: 'Ống PE Ø20mm', slug: 'ong-pe-20mm', category: 'pipe',
    price: 12000, unit: 'm', stock: 5000, active: true, image: null,
    specifications: { outer_diameter: '20', wall_thickness: '1.5', material: 'HDPE', pressure_rating: '4', roll_length: '200' },
  },
  {
    id: 'p-2', name: 'Van bi PVC Ø32mm', slug: 'van-bi-pvc-32mm', category: 'van',
    price: 45000, unit: 'cái', stock: 320, active: true, image: null,
    specifications: { nominal_diameter: '32', max_pressure: '6', material: 'PVC', connection_type: 'Ren ngoài' },
  },
  {
    id: 'p-3', name: 'Béc tưới nhỏ giọt 4L/h', slug: 'bec-tuoi-nho-giot-4lh', category: 'nozzle',
    price: 3500, unit: 'cái', stock: 12000, active: true, image: null,
    specifications: { flow_rate: '4', spray_radius: '0.3', spray_angle: '360', connection_size: '4' },
  },
  {
    id: 'p-4', name: 'Máy bơm Solar 1.5HP', slug: 'may-bom-solar-1-5hp', category: 'pump',
    price: 12500000, unit: 'bộ', stock: 15, active: true, image: null,
    specifications: { power: '1.5', max_flow: '8', max_head: '40', inlet_size: '2', outlet_size: '1.5', voltage: 'DC' },
  },
  {
    id: 'p-5', name: 'Cảm biến độ ẩm ST-100', slug: 'cam-bien-do-am-st-100', category: 'sensor',
    price: 850000, unit: 'cái', stock: 50, active: true, image: null,
    specifications: { measurement_range: '0-100% RH', accuracy: '±2%', protocol: 'LoRa', battery_life: '24' },
  },
  {
    id: 'p-6', name: 'Phân NPK 20-20-15', slug: 'phan-npk-20-20-15', category: 'fertilizer',
    price: 15000, unit: 'kg', stock: 3000, active: true, image: null,
    specifications: { npk_ratio: '20-20-15', weight: '25', application_method: 'Bón gốc' },
  },
  {
    id: 'p-7', name: 'Ống PE Ø25mm', slug: 'ong-pe-25mm', category: 'pipe',
    price: 18000, unit: 'm', stock: 3500, active: true, image: null,
    specifications: { outer_diameter: '25', wall_thickness: '2.0', material: 'HDPE', pressure_rating: '6', roll_length: '200' },
  },
  {
    id: 'p-8', name: 'Van điện từ 1"', slug: 'van-dien-tu-1-inch', category: 'van',
    price: 320000, unit: 'cái', stock: 85, active: false, image: null,
    specifications: { nominal_diameter: '25', max_pressure: '10', material: 'Đồng thau', connection_type: 'Ren trong' },
  },
];

const CATEGORIES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pipe', label: 'Ống' },
  { value: 'van', label: 'Van' },
  { value: 'nozzle', label: 'Béc tưới' },
  { value: 'pump', label: 'Máy bơm' },
  { value: 'sensor', label: 'Cảm biến' },
  { value: 'fertilizer', label: 'Phân bón' },
];

// ─── Main Page ───────────────────────────────────────────────────────
export default function PIMEditorPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editProduct, setEditProduct] = useState<MockProduct | null>(null);
  const [editSpecs, setEditSpecs] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.slug.includes(searchQuery.toLowerCase())) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      return true;
    });
  }, [products, searchQuery, filterCategory]);

  const openEditor = (product: MockProduct) => {
    setEditProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditStock(product.stock.toString());
    setEditActive(product.active);
    setEditSpecs({ ...product.specifications });
    setDrawerOpen(true);
  };

  const getSpecSchema = (category: string): SpecField[] => {
    return SPEC_SCHEMA[category] ?? DEFAULT_SPEC_SCHEMA;
  };

  const handleSpecChange = (key: string, value: string) => {
    setEditSpecs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!editProduct) return;
    setSaving(true);

    // Validate required spec fields
    const schema = getSpecSchema(editProduct.category);
    const missing = schema.filter((s) => !editSpecs[s.key]?.trim());

    if (missing.length > 0) {
      toast({
        title: '⚠️ Thiếu thông số kỹ thuật',
        description: `Vui lòng điền: ${missing.map((m) => m.label).join(', ')}`,
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    // Simulate API save
    await new Promise((r) => setTimeout(r, 1000));

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editProduct.id
          ? {
              ...p,
              name: editName,
              price: parseInt(editPrice) || p.price,
              stock: parseInt(editStock) || p.stock,
              active: editActive,
              specifications: editSpecs,
            }
          : p
      )
    );

    toast({ title: '✅ Đã lưu sản phẩm', description: `${editName} đã được cập nhật thành công.` });
    setSaving(false);
    setDrawerOpen(false);
  };

  const handleSyncNetwork = async () => {
    if (!editProduct) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast({
      title: '🌐 Đã đồng bộ toàn mạng lưới',
      description: `Thông số kỹ thuật ${editName} đã được cập nhật cho tất cả 23 đại lý đang phân phối SKU này.`,
    });
    setSaving(false);
  };

  return (
    <AdminShell title="Quản lý PIM" subtitle="Product Information Management — Quản lý thông tin sản phẩm tập trung">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng sản phẩm', value: products.length, icon: Package },
          { label: 'Đang bán', value: products.filter((p) => p.active).length, icon: CheckCircle2 },
          { label: 'Ngưng bán', value: products.filter((p) => !p.active).length, icon: AlertCircle },
          { label: 'Danh mục', value: new Set(products.map((p) => p.category)).size, icon: Tag },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/50">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm sản phẩm theo tên, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px] rounded-xl border-border/50 bg-muted/30">
              <Box className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Product Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product, i) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer border-border/30 transition-colors hover:bg-muted/30"
                  onClick={() => openEditor(product)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {CATEGORIES.find((c) => c.value === product.category)?.label ?? product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {product.price.toLocaleString('vi-VN')}đ/{product.unit}
                  </TableCell>
                  <TableCell className="text-right text-sm">{product.stock.toLocaleString('vi-VN')}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        product.active
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                      )}
                    >
                      {product.active ? 'Đang bán' : 'Ngưng bán'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg" side="right">
          {editProduct && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" style={{ color: '#2E7D32' }} />
                  Chỉnh sửa sản phẩm
                </SheetTitle>
                <SheetDescription>
                  Cập nhật thông tin và thông số kỹ thuật cho {editProduct.name}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Thông tin cơ bản
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="edit-name" className="text-xs">Tên sản phẩm</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="edit-price" className="text-xs">Giá (VNĐ)</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-stock" className="text-xs">Tồn kho</Label>
                        <Input
                          id="edit-stock"
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                      <div>
                        <p className="text-sm font-medium">Trạng thái bán</p>
                        <p className="text-[11px] text-muted-foreground">
                          {editActive ? 'Sản phẩm đang được hiển thị' : 'Sản phẩm đã ẩn'}
                        </p>
                      </div>
                      <Switch checked={editActive} onCheckedChange={setEditActive} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dynamic Specifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Thông số kỹ thuật ({CATEGORIES.find((c) => c.value === editProduct.category)?.label})
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      JSONB · Dynamic
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {getSpecSchema(editProduct.category).map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={`spec-${field.key}`} className="text-xs">
                          {field.label}
                          {field.unit && (
                            <span className="ml-1 text-muted-foreground">({field.unit})</span>
                          )}
                        </Label>
                        <Input
                          id={`spec-${field.key}`}
                          value={editSpecs[field.key] ?? ''}
                          onChange={(e) => handleSpecChange(field.key, e.target.value)}
                          placeholder={`Nhập ${field.label.toLowerCase()}...`}
                          className="mt-1 rounded-xl"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-[11px] leading-relaxed text-amber-400">
                      💡 Thông số kỹ thuật được lưu dưới dạng JSONB trong Supabase. Các trường hiển thị
                      được tự động điều chỉnh theo danh mục sản phẩm (van → nominal_diameter, max_pressure;
                      ống → wall_thickness...).
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full rounded-xl"
                    style={{ backgroundColor: '#2E7D32' }}
                  >
                    {saving ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Lưu thay đổi
                  </Button>
                  <Button
                    onClick={handleSyncNetwork}
                    disabled={saving}
                    variant="outline"
                    className="w-full rounded-xl border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Cập nhật toàn mạng lưới (23 đại lý)
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}
