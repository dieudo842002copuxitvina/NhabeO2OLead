'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { 
  Package, 
  UploadCloud, 
  Save, 
  X,
  Settings2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { uploadProductImage, createProduct } from '../../../../app/actions/productActions';

const formSchema = z.object({
  title: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự.'),
  sku: z.string().min(3, 'SKU phải có ít nhất 3 ký tự.'),
  brand: z.string().optional(),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục.'),
  basePrice: z.number().min(0, 'Giá bán không hợp lệ.'),
  description: z.string().optional(),
  specifications: z.record(z.any()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORIES = [
  { id: 'pump', name: 'Máy Bơm' },
  { id: 'valve', name: 'Van / Phụ kiện' },
  { id: 'pipe', name: 'Ống dẫn nước' },
];

export default function ProductForm() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      sku: '',
      brand: '',
      categoryId: '',
      basePrice: 0,
      description: '',
      specifications: {}
    }
  });

  const selectedCategory = form.watch('categoryId');

  // Handle Drag & Drop Image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let uploadedImageUrl = '';

      // 1. Gọi Server Action Upload Image
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const uploadResult = await uploadProductImage(formData);
        if (!uploadResult.success) {
          toast({ title: 'Lỗi tải ảnh', description: uploadResult.error, variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
        uploadedImageUrl = uploadResult.publicUrl || '';
      }

      // 2. Gọi Server Action Create Product
      const payload = {
        title: values.title,
        sku: values.sku,
        brand: values.brand || '',
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        specifications: values.specifications || {},
        imageUrl: uploadedImageUrl
      };

      const result = await createProduct(payload);

      if (result.success) {
        toast({ 
          title: '✅ Thêm sản phẩm thành công', 
          description: `Đã lưu sản phẩm vào hệ thống PIM.` 
        });
        router.push('/admin/products');
      } else {
        toast({ 
          title: '❌ Lỗi lưu dữ liệu', 
          description: result.error, 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error(error);
      toast({ title: '❌ Lỗi hệ thống', description: 'Có lỗi không mong muốn xảy ra.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Thêm / Chỉnh sửa sản phẩm</h1>
            <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin PIM (Product Information Management).</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2E7D32] hover:bg-[#1B5E20]">
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSubmitting ? 'Đang xử lý...' : 'Lưu Sản Phẩm'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: Main Info */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-500" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm *</FormLabel>
                      <FormControl>
                        <Input placeholder="Vd: Bơm ly tâm Adelino 3HP" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã SKU *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Vd: ADE-001" 
                            className="rounded-xl font-mono uppercase" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thương hiệu</FormLabel>
                        <FormControl>
                          <Input placeholder="Vd: Adelino" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá bán (VNĐ) *</FormLabel>
                        <FormControl>
                          <Input 
                            className="rounded-xl font-bold font-mono text-[#2E7D32]" 
                            placeholder="Nhập giá bán"
                            value={field.value ? new Intl.NumberFormat('en-US').format(field.value) : ''}
                            onChange={(e) => {
                              // Tự động format hàng nghìn: Loại bỏ ký tự ko phải số
                              const rawValue = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(Number(rawValue));
                            }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mô tả công năng của sản phẩm..." 
                          className="rounded-xl resize-none h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI: Media & Specs */}
          <div className="lg:col-span-5 space-y-6">
            
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  Hình ảnh sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-border/50 group bg-slate-50 flex items-center justify-center aspect-video">
                    <img src={imagePreview} alt="Preview" className="object-contain w-full h-full p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="rounded-full shadow-lg">
                        <X className="h-4 w-4 mr-1.5" /> Xóa ảnh
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video border-2 border-dashed border-slate-200 hover:border-blue-500/50 transition-colors rounded-xl bg-slate-50 hover:bg-blue-50 flex flex-col items-center justify-center text-center p-6 cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Kéo thả hoặc click để chọn ảnh</p>
                    <p className="text-xs text-slate-500 mt-1">Định dạng PNG, JPG (Max 5MB)</p>
                  </div>
                )}
                
              </CardContent>
            </Card>

            {/* DYNAMIC TECHNICAL SPECS JSONB */}
            {selectedCategory && (
              <Card className="border-border/50 shadow-sm border-l-4 border-l-[#2E7D32]">
                <CardHeader className="pb-4 border-b border-border/30">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-[#2E7D32]" />
                    Thông số kỹ thuật JSONB
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Tùy biến theo danh mục: {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  
                  {selectedCategory === 'pump' && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel className="text-xs">Công suất (HP)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="rounded-lg h-9" 
                            onChange={(e) => {
                              const currentSpecs = form.getValues('specifications') || {};
                              form.setValue('specifications', { ...currentSpecs, horsepower: Number(e.target.value) });
                            }} 
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="text-xs">Cột áp tối đa H-Max (m)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="rounded-lg h-9" 
                            onChange={(e) => {
                              const currentSpecs = form.getValues('specifications') || {};
                              form.setValue('specifications', { ...currentSpecs, max_head: Number(e.target.value) });
                            }} 
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">Lưu lượng Q-Max (m³/h)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="rounded-lg h-9" 
                            onChange={(e) => {
                              const currentSpecs = form.getValues('specifications') || {};
                              form.setValue('specifications', { ...currentSpecs, max_flow: Number(e.target.value) });
                            }} 
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  )}

                  {selectedCategory === 'valve' && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel className="text-xs">Đường kính (mm)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="rounded-lg h-9" 
                            onChange={(e) => {
                              const currentSpecs = form.getValues('specifications') || {};
                              form.setValue('specifications', { ...currentSpecs, nominal_diameter: Number(e.target.value) });
                            }} 
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="text-xs">Áp suất chịu tải (bar)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="rounded-lg h-9" 
                            onChange={(e) => {
                              const currentSpecs = form.getValues('specifications') || {};
                              form.setValue('specifications', { ...currentSpecs, max_pressure: Number(e.target.value) });
                            }} 
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  )}

                  {selectedCategory !== 'valve' && selectedCategory !== 'pump' && (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
                      <p className="text-sm text-slate-500 italic">Danh mục này hiện không yêu cầu thông số đặc biệt.</p>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}
            
          </div>
        </div>
      </form>
    </Form>
  );
}
