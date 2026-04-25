import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sprout, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().trim().email('Email không hợp lệ').max(255),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(72),
  displayName: z.string().trim().max(100).optional(),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Sai email hoặc mật khẩu' : error.message);
      return;
    }
    toast.success('Đăng nhập thành công');
    navigate(from, { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password, displayName });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName || email.split('@')[0] },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes('already') ? 'Email đã được đăng ký' : error.message);
      return;
    }
    toast.success('Đăng ký thành công! Đang đăng nhập...');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-info/10 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Sprout className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-2xl">AgriFlow</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Cổng Đối Tác</CardTitle>
            <CardDescription>Đăng nhập hoặc tạo tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Đăng nhập</TabsTrigger>
                <TabsTrigger value="signup">Đăng ký</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" autoComplete="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="si-pw">Mật khẩu</Label>
                    <Input id="si-pw" type="password" autoComplete="current-password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Đăng nhập
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="su-name">Tên hiển thị</Label>
                    <Input id="su-name" value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" autoComplete="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="su-pw">Mật khẩu</Label>
                    <Input id="su-pw" type="password" autoComplete="new-password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Tạo tài khoản
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Tài khoản mặc định ở vai trò Khách. Admin cấp quyền dealer/technician.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
